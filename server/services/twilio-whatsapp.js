// server/services/twilio-whatsapp.js
// Twilio WhatsApp notification service
// Usage: sendWhatsAppNotification(phoneNumber, message)

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send WhatsApp notification to user
 * @param {string} phoneNumber - User's phone with country code (e.g., +91XXXXXXXXXX)
 * @param {string} message - Message text
 * @returns {Promise<string>} - Twilio message SID
 */
export async function sendWhatsAppNotification(phoneNumber, message) {
  try {
    const msg = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log(`✅ WhatsApp sent to ${phoneNumber}: ${msg.sid}`);
    return msg.sid;
  } catch (err) {
    console.error(`❌ WhatsApp error for ${phoneNumber}:`, err.message);
    throw err;
  }
}

/**
 * Send WhatsApp template-based notification to user (using content templates)
 * @param {string} phoneNumber - User's phone with country code (e.g., +919369889575)
 * @param {string} contentSid - Twilio content template SID
 * @param {object} contentVariables - Variables to substitute in template (e.g., {"1":"12/1","2":"3pm"})
 * @returns {Promise<string>} - Twilio message SID
 */
export async function sendWhatsAppTemplate(phoneNumber, contentSid, contentVariables) {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables),
      to: `whatsapp:${phoneNumber}`
    });

    console.log(`✅ WhatsApp template sent to ${phoneNumber}: ${message.sid}`);
    return message.sid;
  } catch (err) {
    console.error(`❌ WhatsApp template error for ${phoneNumber}:`, err.message);
    throw err;
  }
}

/**
 * Send WhatsApp notification for payout
 */
export async function sendPayoutNotification(phoneNumber, { amount, reference, timestamp }) {
  const message = `
🛵 GigShield Payout

Your payout of ₹${amount} has been sent to your account.

📍 Reference: ${reference}
⏰ Time: ${new Date(timestamp).toLocaleTimeString('en-IN')}

Check your bank account within a few seconds.
Thank you for using GigShield!

🛡️
  `.trim();

  return sendWhatsAppNotification(phoneNumber, message);
}

/**
 * Send WhatsApp notification for claim approval
 */
export async function sendClaimNotification(phoneNumber, { amount, reason, claimId }) {
  const message = `
🛵 GigShield Claim Approved

Great news! Your claim of ₹${amount} has been approved.

📌 Reason: ${reason}
🎫 Claim ID: ${claimId}

Your payout will be sent automatically to your UPI account.
Thank you for using GigShield!

🛡️
  `.trim();

  return sendWhatsAppNotification(phoneNumber, message);
}

/**
 * Send WhatsApp notification for claim rejection
 */
export async function sendClaimRejectionNotification(phoneNumber, { reason, claimId }) {
  const message = `
🛵 GigShield Claim Status

Your claim (ID: ${claimId}) could not be approved.

❌ Reason: ${reason}

Please contact support if you believe this is incorrect.
support@gigshield.in

🛡️
  `.trim();

  return sendWhatsAppNotification(phoneNumber, message);
}

/**
 * Send WhatsApp OTP for verification
 */
export async function sendOTPNotification(phoneNumber, otp) {
  const message = `🛵 GigShield OTP: ${otp} (Valid for 10 minutes)`;
  return sendWhatsAppNotification(phoneNumber, message);
}
