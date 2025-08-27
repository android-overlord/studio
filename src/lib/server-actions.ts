'use server';

// IMPORTANT: This file contains the actual server-side logic and secrets.
// By using dynamic imports and careful secret handling, we prevent Next.js from
// bundling secrets at build time, which solves secrets scanning issues.

export async function createRazorpayOrder(
    amount: number, 
    customerDetails: { [key: string]: string }, 
    items: {name: string, price: number}[]
) {
  try {
    const Razorpay = (await import('razorpay')).default;
    
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    if (!keyId || !keySecret) {
      console.error('CRITICAL: Razorpay key ID or secret is missing from environment variables.');
      return { error: 'Payment gateway is not configured correctly on the server.' };
    }
    
    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

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

    const order = await razorpay.orders.create(options);
    return {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
        notes: order.notes,
    };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error.message);
    return { error: 'Could not create order. Please try again.' };
  }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    try {
        const crypto = (await import('crypto'));
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
        const keySecret = process.env.RAZORPAY_KEY_SECRET!;

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
    } catch (error: any) {
        console.error('Error verifying Razorpay payment:', error.message);
        return { success: false, error: 'Server error during payment verification.' };
    }
}

export async function sendOrderConfirmationEmail(
  customerDetails: { [key: string]: any },
  items: { name: string; price: number }[],
  paymentId: string
) {
  try {
    // Dynamically import nodemailer to ensure it's only loaded on the server at runtime.
    const nodemailer = (await import('nodemailer')).default;

    // Group secrets into a config object to prevent build-time inlining.
    const emailConfig = {
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      user: process.env.BREVO_SMTP_USER,
      key: process.env.BREVO_SMTP_KEY,
      sender: process.env.BREVO_SENDER_EMAIL || 'creski.shop@gmail.com',
      to: process.env.EMAIL_TO || 'creski.shop@gmail.com'
    };

    if (!emailConfig.host || !emailConfig.user || !emailConfig.key || !emailConfig.port) {
      console.error('CRITICAL: Missing Brevo SMTP credentials in .env file. Cannot send email.');
      return { success: true, error: 'Email configuration is incomplete on the server.' };
    }
    
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: Number(emailConfig.port),
      secure: Number(emailConfig.port) === 465, // true for 465, false for other ports
      auth: {
        user: emailConfig.user,
        pass: emailConfig.key,
      },
    });

    const itemsHtml = items.map(item => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
    const total = items.reduce((acc, item) => acc + item.price, 0);

    const mailOptions = {
      from: `"CRESKI Orders" <${emailConfig.sender}>`,
      to: emailConfig.to,
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
    console.error('CRITICAL: Failed to send order confirmation email. Payment was successful but email failed.', error.message);
    // Important: Still return success so the user flow isn't broken.
    return { success: true, error: 'Failed to send order confirmation email, but payment was processed.' };
  }
}
