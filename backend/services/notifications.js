import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;

let client;

// Initialize Twilio if credentials are available
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Send WhatsApp message via Twilio
 * @param toPhone - Recipient phone number (with country code, e.g., +919876543210)
 * @param message - Message text
 */
export async function sendWhatsAppMessage(toPhone, message) {
  try {
    if (!client) {
      console.warn('Twilio not configured - skipping WhatsApp send');
      return { success: false, error: 'Twilio not configured' };
    }

    const msg = await client.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_PHONE}`,
      to: `whatsapp:${toPhone}`,
    });

    console.log(`WhatsApp sent to ${toPhone} (SID: ${msg.sid})`);

    return {
      success: true,
      messageId: msg.sid,
      status: msg.status,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send payout notification
 */
export async function sendPayoutNotification(
  phone,
  amount,
  claimId,
  triggerType,
  userName
) {
  const message = `🎉 Hi ${userName}! Your GigShield auto-payout of ₹${amount} has been processed!

⚡ Trigger: ${triggerType}
📋 Claim ID: ${claimId}
📱 Check your banking app for the UPI transfer.

Need help? Reply SUPPORT`;

  return sendWhatsAppMessage(phone, message);
}

/**
 * Send policy activation confirmation
 */
export async function sendPolicyConfirmation(phone, userName, tier, premium) {
  const message = `✅ Welcome to GigShield, ${userName}!

Your ${tier} policy is now ACTIVE
💰 Weekly Premium: ₹${premium}

You're protected against:
🌧️ Heavy Rain (>35mm)
🌡️ Extreme Heat (>42°C)  
💨 Poor Air Quality (AQI >350)
⚠️ App Outages (>90 min)

Auto-payouts go straight to your UPI! 🏦`;

  return sendWhatsAppMessage(phone, message);
}

/**
 * Send alert for storm/disruption
 */
export async function sendDisruptionAlert(phone, userName, location, riskLevel) {
  const emoji = riskLevel === 'high' ? '🚨' : '⚠️';
  const message = `${emoji} ${userName}, severe weather expected in ${location}

Your GigShield policy will auto-trigger if it hits our thresholds.
No need to file claims manually!

Stay safe, and earnings will be protected. 💪`;

  return sendWhatsAppMessage(phone, message);
}

/**
 * Send help/support message
 */
export async function sendSupportMessage(phone) {
  const message = `👋 GigShield Support Team

For assistance:
📧 support@gigshield.work
📞 +91-1800-GIG-SHIELD

Common issues:
• Payout not received? → Check banking app
• Policy questions? → Use in-app AI chat
• Emergency? → Contact support immediately`;

  return sendWhatsAppMessage(phone, message);
}

export default {
  sendWhatsAppMessage,
  sendPayoutNotification,
  sendPolicyConfirmation,
  sendDisruptionAlert,
  sendSupportMessage,
};
