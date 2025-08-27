'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const brevoHost = process.env.BREVO_SMTP_HOST;
const brevoUser = process.env.BREVO_SMTP_USER;
const brevoKey = process.env.BREVO_SMTP_KEY;
const emailTo = process.env.EMAIL_TO;

if (!keyId || !keySecret) {
  throw new Error('Missing Razorpay API keys. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function createRazorpayOrder(
    amount: number, 
    customerDetails: { [key: string]: string }, 
    items: {name: string, price: number}[]
) {
  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (e.g., paisa for INR)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        items: JSON.stringify(items.map(item => item.name)), // Store item names as a JSON string
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { error: 'Could not create order. Please try again.' };
  }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        return { success: true, paymentId: razorpay_payment_id };
    } else {
        return { success: false, error: 'Payment verification failed.' };
    }
}

export async function sendOrderConfirmationEmail(
  customerDetails: { [key: string]: any }, // More flexible type
  items: { name: string; price: number }[],
  paymentId: string
) {
  if (!brevoHost || !brevoUser || !brevoKey || !emailTo) {
    console.error('Missing Brevo SMTP credentials in .env file. Cannot send email.');
    return { error: 'Email configuration is incomplete on the server.' };
  }

  const transporter = nodemailer.createTransport({
    host: brevoHost,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: brevoUser,
      pass: brevoKey,
    },
  });

  const itemsHtml = items.map(item => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
  const total = items.reduce((acc, item) => acc + item.price, 0);

  const mailOptions = {
    from: `"CRESKI Orders" <${brevoUser}>`,
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

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Failed to send order confirmation email.' };
  }
}
