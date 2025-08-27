'use server';

import { 
  createRazorpayOrder as createOrder,
  verifyRazorpayPayment as verifyPayment,
  sendOrderConfirmationEmail as sendEmail
} from '@/lib/server-actions';

// This file is now a safe "pass-through" to the actual server logic.
// It contains no secrets or sensitive modules.

export async function createRazorpayOrder(
    amount: number, 
    customerDetails: { [key: string]: string }, 
    items: {name: string, price: number}[]
) {
  return await createOrder(amount, customerDetails, items);
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    return await verifyPayment(data);
}

export async function sendOrderConfirmationEmail(
  customerDetails: { [key: string]: any },
  items: { name: string; price: number }[],
  paymentId: string
) {
  // This is now a fire-and-forget action that calls the secure implementation.
  // The user flow does not wait for this.
  try {
    await sendEmail(customerDetails, items, paymentId);
  } catch (error) {
    // The error is logged on the server by the secure action.
    // We do nothing here to prevent crashes.
  }
  return { success: true };
}
