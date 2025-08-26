
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
        const errorMessage = 'Missing Brevo API Key. Please ensure BREVO_API_KEY is set in your environment.';
        console.error(errorMessage);
        throw new Error('Server is not configured to send emails. Please check your environment configuration.');
    }

    const api = new brevo.TransactionalEmailsApi();
    api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

    const itemsListHtml = selectedItems.map(item => `<li>${item.name}</li>`).join('');
    const itemsListText = selectedItems.map(item => `- ${item.name}`).join('\n');

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
    sendSmtpEmail.sender = { name: 'CRESKI Orders', email: '7b43cf001@smtp-brevo.com' };
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
    }
}
