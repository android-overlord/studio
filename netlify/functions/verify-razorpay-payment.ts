
import type { Handler } from '@netlify/functions';
import crypto from 'crypto';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('CRITICAL: Razorpay key secret is missing for verification.');
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: 'Cannot verify payment.' }),
      };
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expectedSignature === razorpay_signature) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, paymentId: razorpay_payment_id }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Payment verification failed.' }),
      };
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Server error during payment verification.' }),
    };
  }
};

    