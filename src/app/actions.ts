'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error('Missing Razorpay API keys. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function createRazorpayOrder(
    amount: number, 
    customerDetails: { [key: string]: string }, 
    items: {name: string, price: number}[]
) {
  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (e.g., paisa for INR)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
        ...customerDetails,
        items: JSON.stringify(items.map(item => item.name)), // Store item names as a JSON string
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { error: 'Could not create order. Please try again.' };
  }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        return { success: true, paymentId: razorpay_payment_id };
    } else {
        return { success: false, error: 'Payment verification failed.' };
    }
}
