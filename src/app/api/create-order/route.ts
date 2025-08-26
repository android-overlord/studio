
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    const { amount } = await request.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json(
            { error: 'Razorpay API keys are not configured.' },
            { status: 500 }
        );
    }
    
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: amount * 100, // Amount in the smallest currency unit (e.g., paise for INR)
        currency: 'USD', // Or your preferred currency
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return NextResponse.json({ order });
    } catch (error) {
        console.error('RAZORPAY ERROR', error);
        return NextResponse.json(
            { error: 'Failed to create Razorpay order.' },
            { status: 500 }
        );
    }
}
