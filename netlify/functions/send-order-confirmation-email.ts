
import type { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { customerDetails, items, paymentId } = JSON.parse(event.body);
    
    const emailConfig = {
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT),
      user: process.env.BREVO_SMTP_USER,
      key: process.env.BREVO_SMTP_KEY,
      sender: process.env.BREVO_SENDER_EMAIL || 'creski.shop@gmail.com',
      to: process.env.EMAIL_TO || 'creski.shop@gmail.com',
    };

    if (!emailConfig.host || !emailConfig.port || !emailConfig.user || !emailConfig.key) {
      console.error('CRITICAL: Missing Brevo SMTP credentials.');
      // Return 200 OK to not break the user flow. Error is logged.
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Email config missing' }) };
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.key,
      },
    });

    const itemsHtml = items.map((item: { name: string, price: number }) => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
    const total = items.reduce((acc: number, item: { price: number }) => acc + item.price, 0);

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
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error.message);
    // Important: Still return success so the user flow isn't broken.
    // The error is logged for maintainers to see.
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, error: 'Failed to send confirmation email.' }),
    };
  }
};

    