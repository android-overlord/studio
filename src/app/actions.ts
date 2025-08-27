
'use server';

import * as brevo from '@getbrevo/brevo';

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

interface EmailResult {
    success: boolean;
    message: string;
}

export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams): Promise<EmailResult> {
    const { BREVO_API_KEY, BREVO_SENDER_EMAIL, OWNER_EMAIL } = process.env;

    const requiredEnvVars = { BREVO_API_KEY, BREVO_SENDER_EMAIL, OWNER_EMAIL };
    const missingEnvVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingEnvVars.length > 0) {
        const errorMessage = `Email service is not configured. Missing environment variables: ${missingEnvVars.join(', ')}.`;
        console.error(errorMessage);
        return { success: false, message: 'The email service is currently unavailable. Please contact support.' };
    }
    
    const apiClient = new brevo.ApiClient();
    apiClient.authentications['api-key'].apiKey = BREVO_API_KEY;
    const transactionalEmailsApi = new brevo.TransactionalEmailsApi(apiClient);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');

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

    const ownerEmail = new brevo.SendSmtpEmail();
    ownerEmail.subject = `New Order from ${customerDetails.name}`;
    ownerEmail.htmlContent = emailHtmlForOwner;
    ownerEmail.sender = { name: 'CRESKI', email: BREVO_SENDER_EMAIL! };
    ownerEmail.to = [{ email: OWNER_EMAIL! }];

    const emailHtmlForCustomer = `
        <h1>Your CRESKI Order is Received!</h1>
        <p>Hi ${customerDetails.name},</p>
        <p>Thank you for your order! We have received it and will notify you as soon as it has been shipped after payment verification.</p>
        <p>You can view your order details in your account.</p>
        <p>Thanks for shopping with us!</p>
        <p><strong>- The CRESKI Team</strong></p>
    `;

    const customerEmail = new brevo.SendSmtpEmail();
    customerEmail.subject = 'Your CRESKI Order has been received!';
    customerEmail.htmlContent = emailHtmlForCustomer;
    customerEmail.sender = { name: 'CRESKI', email: BREVO_SENDER_EMAIL! };
    customerEmail.to = [{ email: customerDetails.email }];

    try {
        console.log("Sending emails via Brevo...");
        const ownerEmailPromise = transactionalEmailsApi.sendTransacEmail(ownerEmail);
        const customerEmailPromise = transactionalEmailsApi.sendTransacEmail(customerEmail);

        await Promise.all([ownerEmailPromise, customerEmailPromise]);
        
        console.log("✅ Emails sent successfully via Brevo.");
        return { success: true, message: 'Emails sent successfully.' };

    } catch (error: any) {
        console.error('❌ Failed to send emails via Brevo.');
        // Brevo SDK might wrap the actual error response in `response.body`
        const errorMessage = error.response?.body?.message || error.message || 'An unknown error occurred.';
        console.error('Brevo API Error:', errorMessage);
        console.error('Full Error:', JSON.stringify(error, null, 2));
        return { success: false, message: `Failed to send order notification. Reason: ${errorMessage}` };
    }
}
