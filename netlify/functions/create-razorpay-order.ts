
import type { Handler } from '@netlify/functions';
import Razorpay from 'razorpay';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { amount, customerDetails, items } = JSON.parse(event.body);
    
    const keyId = process.env.RAZORPAYKEYID;
    const keySecret = process.env.RAZORPAYKEYSECRET;

    if (!keyId || !keySecret) {
      console.error('CRITICAL: Razorpay key ID or secret is missing.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Payment gateway is not configured.' }),
      };
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const options = {
      amount: amount * 100, // Amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        items: JSON.stringify(items.map((item: { name: string }) => item.name)),
      },
    };

    const order = await razorpay.orders.create(options);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: order.id,
        currency: order.currency,
        amount: order.amount,
        notes: order.notes,
      }),
    };

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create order.' }),
    };
  }
};
