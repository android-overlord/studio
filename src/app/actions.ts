
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

<<<<<<< HEAD
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
=======
export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams) {
    const { BREVO_API_KEY } = process.env;
>>>>>>> parent of 94a34ef (ohk how do i start)

    if (missingEnvVars.length > 0) {
        const errorMessage = `Email service is not configured. Missing environment variables: ${missingEnvVars.join(', ')}.`;
        console.error(errorMessage);
        return { success: false, message: 'The email service is currently unavailable. Please contact support.' };
    }
<<<<<<< HEAD
    
    const apiClient = new brevo.ApiClient();
    apiClient.authentications['api-key'].apiKey = BREVO_API_KEY!;
    const transactionalEmailsApi = new brevo.TransactionalEmailsApi(apiClient);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');

    const emailHtmlForOwner = `
=======

    const api = new brevo.TransactionalEmailsApi();
    api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');
    const itemsListText = selectedItems.map(item => `- ${item.name}`).join('\n');

    const emailHtml = `
>>>>>>> parent of 94a34ef (ohk how do i start)
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

<<<<<<< HEAD
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
        const errorMessage = error.response?.body?.message || error.message || 'An unknown error occurred.';
        console.error('Brevo API Error:', errorMessage);
        console.error('Full Error:', JSON.stringify(error, null, 2));
        return { success: false, message: `Failed to send order notification. Reason: ${errorMessage}` };
=======
    const emailText = `
        New CRESKI Order!
        A new order has been placed.

        Customer Details:
        - Name: ${customerDetails.name}
        - Email: ${customerDetails.email}
        - Phone: ${customerDetails.phone}
        - Address: ${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.zip}

        Order Items:
        ${itemsListText}

        Total Price: $${totalPrice.toFixed(2)}

        Please verify the payment and process the order.
    `;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'CRESKI Orders', email: 'creski.help@gmail.com' };
    sendSmtpEmail.to = [{ email: 'sahoo.adarsh@gmail.com', name: 'Adarsh Sahoo' }];
    sendSmtpEmail.subject = `New Order from ${customerDetails.name}`;
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.textContent = emailText;

    try {
        console.log("Sending email with payload:", sendSmtpEmail);
        const response = await api.sendTransacEmail(sendSmtpEmail);
        console.log("Brevo response:", response);
        return { success: true, message: 'Order email sent.' };
    } catch (error: any) {
        console.error('Failed to send email via Brevo.');
        if (error.response) {
            console.error("Brevo API error response:", error.response.body);
        } else {
            console.error("Unknown error:", error);
        }
        throw new Error("Failed to send order notification email. Please check server logs for details.");
>>>>>>> parent of 94a34ef (ohk how do i start)
    }
}
