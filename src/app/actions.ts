
'use server';

import nodemailer from 'nodemailer';

type Perfume = {
    name: string;
};

type CustomerDetails = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
};

interface SendOrderEmailParams {
    customerDetails: CustomerDetails;
    selectedItems: Perfume[];
    totalPrice: number;
}

export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams) {
    const { 
        EMAIL_HOST, 
        EMAIL_PORT, 
        EMAIL_USER, 
        EMAIL_PASS, 
        EMAIL_TO 
    } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
        console.error('Missing one or more email environment variables. Please ensure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, and EMAIL_TO are set in your .env.local file.');
        throw new Error('Server is not configured to send emails. Please check your environment configuration.');
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT, 10),
        secure: parseInt(EMAIL_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');

    const emailHtml = `
        <h1>New CRESKI Order!</h1>
        <p>A new order has been placed.</p>
        <h2>Customer Details:</h2>
        <ul>
            <li><strong>Name:</strong> ${customerDetails.name}</li>
            <li><strong>Email:</strong> ${customerDetails.email}</li>
            <li><strong>Phone:</strong> ${customerDetails.phone}</li>
            <li><strong>Address:</strong> ${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.zip}</li>
        </ul>
        <h2>Order Items:</h2>
        <ul>
            ${itemsListHtml}
        </ul>
        <h3>Total Price: $${totalPrice.toFixed(2)}</h3>
        <p>Please verify the payment and process the order.</p>
    `;

    const mailOptions = {
        from: `"CRESKI Orders" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: `New Order from ${customerDetails.name}`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order email sent successfully.');
        return { success: true, message: 'Order email sent.' };
    } catch (error) {
        console.error('Error sending order email:', error);
        throw new Error('Failed to send order notification email.');
    }
}
