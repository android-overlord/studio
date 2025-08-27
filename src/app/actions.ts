'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const brevoHost = process.env.BREVO_SMTP_HOST;
const brevoUser = 'creski.shop@gmail.com';
const brevoKey = process.env.BREVO_SMTP_KEY;
const brevoPort = process.env.BREVO_SMTP_PORT;
const brevoSender = process.env.BREVO_SENDER_EMAIL || 'creski.shop@gmail.com';
const emailTo = process.env.EMAIL_TO || 'creski.shop@gmail.com';


if (!keyId || !keySecret) {
  // This log helps debug missing environment variables on the server.
  console.error('CRITICAL: Missing Razorpay API keys. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
}

// Initialize Razorpay, but handle potential missing keys gracefully
let razorpay: Razorpay | null = null;
if (keyId && keySecret) {
    razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}

export async function createRazorpayOrder(
    amount: number, 
    customerDetails: { [key: string]: string }, 
    items: {name: string, price: number}[]
) {
  // This is the main protection against the 500 error.
  if (!razorpay) {
    console.error('Razorpay instance is not initialized. Check your API keys.');
    return { error: 'Payment gateway is not configured on the server.' };
  }

  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (e.g., paisa for INR)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        items: JSON.stringify(items.map(item => item.name)),
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
        notes: order.notes,
    };
  } catch (error: any) {
    // This will log the actual error from Razorpay to your Netlify function logs.
    console.error('Error creating Razorpay order:', error.message);
    // This returns a structured error to the frontend instead of crashing.
    return { error: 'Could not create order. Please try again.' };
  }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!keySecret) {
         console.error('Razorpay key secret is not available for verification.');
         return { success: false, error: 'Cannot verify payment on server.' };
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        return { success: true, paymentId: razorpay_payment_id };
    } else {
        return { success: false, error: 'Payment verification failed.' };
    }
}

export async function sendOrderConfirmationEmail(
  customerDetails: { [key: string]: any },
  items: { name: string; price: number }[],
  paymentId: string
) {
  // This is the robust try/catch for email sending you requested.
  try {
    if (!brevoHost || !brevoUser || !brevoKey || !emailTo || !brevoSender || !brevoPort) {
      console.error('Missing Brevo SMTP credentials in .env file. Cannot send email.');
      // Return success because the payment itself was not affected.
      return { success: true, error: 'Email configuration is incomplete on the server.' };
    }

    const transporter = nodemailer.createTransport({
      host: brevoHost,
      port: Number(brevoPort),
      secure: false, // true for 465, false for other ports
      auth: {
        user: brevoUser,
        pass: brevoKey,
      },
    });

    const itemsHtml = items.map(item => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
    const total = items.reduce((acc, item) => acc + item.price, 0);

    const mailOptions = {
      from: `"CRESKI Orders" <${brevoSender}>`,
      to: emailTo,
      subject: `New Order Received from ${customerDetails.name} - #${paymentId.slice(-6)}`,
      html: `
        <h1>New Order Received!</h1>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <h2>Customer Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${customerDetails.name}</li>
          <li><strong>Email:</strong> ${customerDetails.email}</li>
          <li><strong>Phone:</strong> ${customerDetails.phone}</li>
          <li><strong>Address:</strong> ${customerDetails.address}</li>
        </ul>
        <h2>Order Items:</h2>
        <ul>
          ${itemsHtml}
        </ul>
        <h3>Total: ₹${total.toFixed(2)}</h3>
        <hr>
        <p>This is an automated notification. Please process the order.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    // This logs the specific SMTP error to Netlify logs.
    console.error('CRITICAL: Failed to send order confirmation email. The payment was successful, but the email notification failed. Error:', error.message);
    // The function returns success so it doesn't break the client flow.
    return { success: true, error: 'Failed to send order confirmation email, but payment was processed.' };
  }
}
