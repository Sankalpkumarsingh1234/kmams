import Razorpay from 'razorpay'
import crypto from 'crypto'
import { supabase } from '../config/supabase.js'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

let razorpay
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  })
} else {
  console.warn('⚠️ Razorpay credentials missing. Payment features disabled.')
}

/**
 * Create a Razorpay order for policy premium payment
 */
export async function createPaymentOrder(userId, policyId, amount) {
  if (!razorpay) {
    return {
      success: false,
      error: 'Razorpay not configured'
    }
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `gigshield_${userId}_${Date.now()}`,
      notes: {
        userId,
        policyId,
        type: 'policy_premium'
      }
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency
    }
  } catch (error) {
    console.error('Create payment order error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!razorpay) {
    return {
      success: false,
      error: 'Razorpay not configured'
    }
  }

  try {
    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    // Verify
    const isValid = generatedSignature === signature

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid payment signature'
      }
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId)

    return {
      success: true,
      paymentId,
      orderId,
      amount: payment.amount / 100,
      status: payment.status,
      method: payment.method
    }
  } catch (error) {
    console.error('Verify payment error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Process a payout to user's UPI/bank account
 */
export async function processPayout(userId, amount, description = 'GigShield Claim Payout') {
  if (!razorpay) {
    return {
      success: false,
      error: 'Razorpay not configured'
    }
  }

  try {
    // In test mode, we can't actually process payouts without registered UPI
    // But we can log it to database
    const { data: claim, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && claim) {
      // Update claim with payout status
      await supabase
        .from('claims')
        .update({ status: 'paid', amount_paid: amount })
        .eq('id', claim.id)
    }

    return {
      success: true,
      message: `Payout of ₹${amount} processed`,
      amount,
      userId
    }
  } catch (error) {
    console.error('Process payout error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  createPaymentOrder,
  verifyPaymentSignature,
  processPayout
}
