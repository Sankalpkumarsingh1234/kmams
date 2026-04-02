import { Router } from 'express';
import twilio from 'twilio';

const router = Router();

// Get Twilio client from env variables
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  
  // Check if credentials are missing or placeholder
  if (!sid || !token || token === 'your_auth_token_here') {
    return null;
  }
  return twilio(sid, token);
}

/**
 * POST /api/notify/whatsapp
 * Send WhatsApp notification to user
 */
router.post('/api/notify/whatsapp', async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return res.status(503).json({ error: 'Twilio not configured' });
    }

    const { phone, message, contentSid, contentVariables } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let messageSid;
    
    if (contentSid) {
      // Template-based message
      const msg = await client.messages.create({
        from: 'whatsapp:+14155238886',
        contentSid: contentSid,
        contentVariables: JSON.stringify(contentVariables || {}),
        to: `whatsapp:${phone}`
      });
      messageSid = msg.sid;
    } else if (message) {
      // Simple text message
      const msg = await client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${phone}`,
      });
      messageSid = msg.sid;
    } else {
      return res.status(400).json({ error: 'Either contentSid or message is required' });
    }

    res.json({
      success: true,
      messageSid,
      phone,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    res.status(500).json({
      error: 'Failed to send WhatsApp notification',
      details: error.message,
    });
  }
});

/**
 * POST /api/notify/claim
 * Send claim trigger notification via WhatsApp
 */
router.post('/api/notify/claim', async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return res.status(503).json({ error: 'Twilio not configured' });
    }

    const { phone, claimAmount, triggerType } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const message = `🎉 GigShield Alert!\n\n✅ Your claim has been APPROVED!\n\nTrigger: ${triggerType}\nAmount: ₹${claimAmount}\n\nAmount will be transferred to your registered account within 2 hours.\n\nStay Safe! 🛡️`;

    const msg = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phone}`,
    });

    res.json({
      success: true,
      messageSid: msg.sid,
      message,
      phone,
    });
  } catch (error) {
    console.error('Claim notification error:', error);
    res.status(500).json({
      error: 'Failed to send claim notification',
      details: error.message,
    });
  }
});

/**
 * POST /api/notify/policy-activated
 * Send policy activation notification
 */
router.post('/api/notify/policy-activated', async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return res.status(503).json({ error: 'Twilio not configured' });
    }

    const { phone, policyTier, premiumWeekly } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const message = `✅ GigShield Policy Activated!\n\nTier: ${policyTier.toUpperCase()}\nWeekly Premium: ₹${premiumWeekly}\n\nYou are now protected against:\n• Heat Stress\n• Heavy Rain\n• Poor Air Quality\n\nWe'll notify you instantly if you qualify for a claim. 🛡️`;

    const msg = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phone}`,
    });

    res.json({
      success: true,
      messageSid: msg.sid,
      message,
      phone,
    });
  } catch (error) {
    console.error('Policy notification error:', error);
    res.status(500).json({
      error: 'Failed to send policy notification',
      details: error.message,
    });
  }
});

export default router;
