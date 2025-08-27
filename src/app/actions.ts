
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

export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams): Promise<{ success: boolean; message: string }> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, OWNER_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL || !OWNER_EMAIL) {
        const errorMessage = 'Email service is not configured on the server.';
        console.error('SMTP environment variables are not fully configured. Cannot send email.');
        return { success: false, message: errorMessage };
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');

    // --- Email to Owner ---
    const emailHtmlForOwner = `
        <h1>New CRESKI Order!</h1>
        <p>A new order has been placed.</p>
        <h2>Customer Details:</h2>
        <ul>
            <li><strong>Name:</strong> ${customerDetails.name}</li>
            <li><strong>Email:</strong> ${customerDetails.email}</li>
            <li><strong>Phone:</strong> ${customerDetails.phone}</li>
            <li><strong>Address:</strong> ${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state}, ${customerDetails.zip}</li>
        </ul>
        <h2>Order Items:</h2>
        <ul>
            ${itemsListHtml}
        </ul>
        <h3>Total Price: $${totalPrice.toFixed(2)}</h3>
        <p>Please verify the payment and process the order.</p>
    `;

    const ownerEmailOptions = {
        from: `"CRESKI Orders" <${SMTP_FROM_EMAIL}>`,
        to: OWNER_EMAIL,
        subject: `New Order from ${customerDetails.name}`,
        html: emailHtmlForOwner,
    };

    // --- Email to Customer ---
    const emailHtmlForCustomer = `
        <h1>Your CRESKI Order is Received!</h1>
        <p>Hi ${customerDetails.name},</p>
        <p>Thank you for your order! We have received it and will notify you as soon as it has been shipped after payment verification.</p>
        <p>You can view your order details in your account.</p>
        <p>Thanks for shopping with us!</p>
        <p><strong>- The CRESKI Team</strong></p>
    `;

    const customerEmailOptions = {
        from: `"CRESKI" <${SMTP_FROM_EMAIL}>`,
        to: customerDetails.email,
        subject: `Your CRESKI Order has been received!`,
        html: emailHtmlForCustomer,
    };

    try {
        console.log("Sending emails via SMTP...");
        const ownerEmailPromise = transporter.sendMail(ownerEmailOptions);
        const customerEmailPromise = transporter.sendMail(customerEmailOptions);
        
        await Promise.all([ownerEmailPromise, customerEmailPromise]);
        
        console.log("✅ Emails sent successfully.");
        return { success: true, message: "Emails sent successfully." };
    } catch (error: any) {
        console.error('❌ Failed to send emails via SMTP.');
        // Log detailed error information from nodemailer
        console.error('Error Code:', error.code);
        console.error('Error Response:', error.response);
        console.error('Error Response Code:', error.responseCode);
        console.error('Full Error:', error);
        return { success: false, message: 'Failed to send order confirmation emails.' };
    }
}
