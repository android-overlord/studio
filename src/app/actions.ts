'use server';

import * as Brevo from '@getbrevo/brevo';

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
    const { BREVO_API_KEY, BREVO_FROM_EMAIL, OWNER_EMAIL } = process.env;

    const requiredEnvVars = { BREVO_API_KEY, BREVO_FROM_EMAIL, OWNER_EMAIL };
    const missingEnvVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingEnvVars.length > 0) {
        const errorMessage = `Brevo environment variables are not fully configured. Missing: ${missingEnvVars.join(', ')}. Cannot send email.`;
        console.error(errorMessage);
        return { success: false, message: 'Email service is not configured on the server.' };
    }

    const api = new Brevo.TransactionalEmailsApi();
    api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY!);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');

    // --- Email to Owner ---
    const ownerEmailHtml = `
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

    const ownerEmail = new Brevo.SendSmtpEmail();
    ownerEmail.sender = { name: 'CRESKI Orders', email: BREVO_FROM_EMAIL! };
    ownerEmail.to = [{ email: OWNER_EMAIL! }];
    ownerEmail.subject = `New Order from ${customerDetails.name}`;
    ownerEmail.htmlContent = ownerEmailHtml;

    // --- Email to Customer ---
    const customerEmailHtml = `
        <h1>Your CRESKI Order is Received!</h1>
        <p>Hi ${customerDetails.name},</p>
        <p>Thank you for your order! We have received it and will notify you as soon as it has been shipped after payment verification.</p>
        <p>You can view your order details in your account.</p>
        <p>Thanks for shopping with us!</p>
        <p><strong>- The CRESKI Team</strong></p>
    `;

    const customerEmail = new Brevo.SendSmtpEmail();
    customerEmail.sender = { name: 'CRESKI', email: BREVO_FROM_EMAIL! };
    customerEmail.to = [{ email: customerDetails.email, name: customerDetails.name }];
    customerEmail.subject = `Your CRESKI Order has been received!`;
    customerEmail.htmlContent = customerEmailHtml;


    try {
        console.log("Sending emails via Brevo...");
        // Send both emails
        await Promise.all([
            api.sendTransacEmail(ownerEmail),
            api.sendTransacEmail(customerEmail)
        ]);
        console.log("✅ Emails sent successfully via Brevo.");
        return { success: true };

    } catch (error: any) {
        console.error('❌ Failed to send emails via Brevo.');
        // Brevo errors often have a detailed body
        console.error('Brevo Error Body:', error.body);
        console.error('Full Error:', error);
        return { success: false, message: 'Failed to send order confirmation emails.' };
    }
}
