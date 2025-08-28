
import type { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { customerDetails, items, paymentId } = JSON.parse(event.body);

    const { 
      BREVO_SMTP_HOST, 
      BREVO_SMTP_KEY, 
      BREVO_SENDER_EMAIL, 
      OWNER_EMAIL 
    } = process.env;

    if (!BREVO_SMTP_HOST || !BREVO_SMTP_KEY || !BREVO_SENDER_EMAIL || !OWNER_EMAIL) {
      console.error('CRITICAL: Email service environment variables are not configured.');
      // Silently fail to avoid affecting user checkout experience
      return { statusCode: 200, body: JSON.stringify({ message: 'Email service not fully configured, skipping.' }) };
    }

    const transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: 587,
      secure: false, 
      auth: {
        user: BREVO_SENDER_EMAIL,
        pass: BREVO_SMTP_KEY,
      },
    });

    const itemsHtml = items.map((item: { name: string, price: number }) => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
    const total = items.reduce((acc: number, item: { price: number }) => acc + item.price, 0);

    const mailOptions = {
      from: `"CRESKI" <${BREVO_SENDER_EMAIL}>`,
      to: [customerDetails.email, OWNER_EMAIL],
      subject: `Order Confirmation - #${paymentId}`,
      html: `
        <h1>Thank you for your order, ${customerDetails.name}!</h1>
        <p>Your order has been confirmed.</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <h3>Shipping Details:</h3>
        <p>
          ${customerDetails.name}<br>
          ${customerDetails.email}<br>
          ${customerDetails.phone}<br>
          ${customerDetails.address}
        </p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Confirmation email sent.' }),
    };

  } catch (error: any) {
    console.error('Error sending confirmation email:', error.message);
    // Do not block the user flow if email fails
    return {
      statusCode: 200, // Return 200 to not worry the client
      body: JSON.stringify({ success: false, error: 'Could not send confirmation email.' }),
    };
  }
};
