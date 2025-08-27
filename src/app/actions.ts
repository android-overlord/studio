
'use server';

import * as brevo from '@getbrevo/brevo';
import TelegramBot from 'node-telegram-bot-api';

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

// Helper to send notification to your Telegram bot
async function sendTelegramNotification({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams) {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('Telegram bot token or chat ID is not configured.');
        return; // Don't block the main flow if Telegram isn't set up
    }

    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
    const itemsList = selectedItems.map(item => `- ${item.name}`).join('\n');
    
    // Hidden metadata in the message to be used by the webhook later
    const metadata = {
        customerEmail: customerDetails.email,
        customerName: customerDetails.name
    };
    const hiddenMetadata = `\n\n---METADATA---\n${JSON.stringify(metadata)}`;

    const message = `
*New CRESKI Order!* 📦

*Customer Details:*
- *Name:* ${customerDetails.name}
- *Email:* ${customerDetails.email}
- *Phone:* ${customerDetails.phone}
- *Address:* ${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.zip}

*Order Items:*
${itemsList}

*Total Price: $${totalPrice.toFixed(2)}*

Please verify payment. React with 👍 to send the confirmation email to the customer.
${hiddenMetadata}
    `;

    try {
        await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
        console.log('✅ Order notification sent to Telegram.');
    } catch (error) {
        console.error('❌ Failed to send Telegram notification:', error);
    }
}


export async function sendOrderEmail({ customerDetails, selectedItems, totalPrice }: SendOrderEmailParams) {
    const { BREVO_API_KEY } = process.env;

    if (!BREVO_API_KEY) {
        const errorMessage = 'Missing Brevo API Key. Please ensure BREVO_API_KEY is set in your environment.';
        console.error(errorMessage);
        return { success: false, message: 'Server is not configured to send emails. Please check your environment configuration.' };
    }
    
    // --- Step 1: Send notification to your own email and Telegram ---
    const api = new brevo.TransactionalEmailsApi();
    api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');
    
    const emailHtmlForOwner = `
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

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'CRESKI Orders', email: 'creski.help@gmail.com' };
    sendSmtpEmail.to = [{ email: 'sahoo.adarsh@gmail.com', name: 'Adarsh Sahoo' }];
    sendSmtpEmail.subject = `New Order from ${customerDetails.name}`;
    sendSmtpEmail.htmlContent = emailHtmlForOwner;

    try {
        console.log("Sending email with payload:", sendSmtpEmail);
        const response = await api.sendTransacEmail(sendSmtpEmail);
        console.log("Brevo response:", response);

        // Also send notification to Telegram
        await sendTelegramNotification({ customerDetails, selectedItems, totalPrice });

        return { success: true, message: 'Order notification sent.' };
    } catch (error: any) {
        console.error('Failed to send email via Brevo.');
        if (error.response) {
            console.error("Brevo API error response:", error.response.body);
        } else {
            console.error("Unknown error:", error);
        }
        return { success: false, message: 'Failed to send order notification email. Please check server logs for details.' };
    }
}


// --- Step 2: This function will be called by our future webhook ---
export async function sendConfirmationEmailToCustomer({ name, email }: { name: string, email: string }) {
    const { BREVO_API_KEY } = process.env;
     if (!BREVO_API_KEY) {
        console.error('Missing Brevo API Key for customer confirmation.');
        return { success: false, message: 'Server is not configured to send emails.' };
    }

    const api = new brevo.TransactionalEmailsApi();
    api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

    const emailHtmlForCustomer = `
        <h1>Your CRESKI Order is Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your order! We have received it and will notify you as soon as it has been shipped.</p>
        <p>You can view your order details in your account.</p>
        <p>Thanks for shopping with us!</p>
        <p><strong>- The CRESKI Team</strong></p>
    `;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'CRESKI', email: 'creski.help@gmail.com' };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.subject = `Your CRESKI Order is Confirmed!`;
    sendSmtpEmail.htmlContent = emailHtmlForCustomer;

    try {
        console.log(`Sending confirmation email to ${email}`);
        await api.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Confirmation email sent to ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error(`❌ Failed to send confirmation email to ${email}.`);
        if (error.response) {
            console.error("Brevo API error response:", error.response.body);
        } else {
            console.error("Unknown error:", error);
        }
        return { success: false, message: 'Failed to send customer confirmation email.' };
    }
}
