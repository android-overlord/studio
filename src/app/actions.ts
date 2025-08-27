
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

export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams) {
    const { BREVO_API_KEY } = process.env;
    if (!BREVO_API_KEY) {
        console.error('Brevo API Key is missing. Cannot send email.');
        return { success: false, message: 'Email service is not configured on the server.' };
    }
    
    const api = new brevo.TransactionalEmailsApi();
    api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

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

    const ownerEmail = new brevo.SendSmtpEmail();
    ownerEmail.sender = { name: 'CRESKI Orders', email: 'creski.help@gmail.com' };
    ownerEmail.to = [{ email: 'sahoo.adarsh@gmail.com', name: 'Adarsh Sahoo' }];
    ownerEmail.subject = `New Order from ${customerDetails.name}`;
    ownerEmail.htmlContent = emailHtmlForOwner;

    // --- Email to Customer ---
    const emailHtmlForCustomer = `
        <h1>Your CRESKI Order is Received!</h1>
        <p>Hi ${customerDetails.name},</p>
        <p>Thank you for your order! We have received it and will notify you as soon as it has been shipped after payment verification.</p>
        <p>You can view your order details in your account.</p>
        <p>Thanks for shopping with us!</p>
        <p><strong>- The CRESKI Team</strong></p>
    `;

    const customerEmail = new brevo.SendSmtpEmail();
    customerEmail.sender = { name: 'CRESKI', email: 'creski.help@gmail.com' };
    customerEmail.to = [{ email: customerDetails.email, name: customerDetails.name }];
    customerEmail.subject = `Your CRESKI Order has been received!`;
    customerEmail.htmlContent = emailHtmlForCustomer;

    try {
        console.log("Sending emails...");
        await Promise.all([
            api.sendTransacEmail(ownerEmail),
            api.sendTransacEmail(customerEmail)
        ]);
        console.log("✅ Emails sent successfully.");
        return { success: true };
    } catch (error: any) {
        console.error('❌ Failed to send emails via Brevo.');
        if (error.response) {
            console.error("Brevo API error response:", error.response.body);
        } else {
            console.error("Unknown error:", error);
        }
        return { success: false, message: 'Failed to send order emails.' };
    }
}
