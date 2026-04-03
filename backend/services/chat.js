import axios from 'axios'

// URL for Groq
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Send message to Groq API for AI-powered responses
 */
export async function sendChatMessage(userMessage, userContext = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Groq API key not configured'
    }
  }


  try {
    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(userContext)

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant', // Free Groq model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        top_p: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const reply = response.data.choices[0].message.content

    return {
      success: true,
      reply,
      model: response.data.model
    }
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message)

    // Return a helpful error message
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Invalid Groq API key'
      }
    }

    return {
      success: false,
      error: error.message || 'Chat service unavailable'
    }
  }
}

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(context) {
  const {
    name = 'Friend',
    platform = 'Zomato',
    nfiScore = 60,
    policyTier = 'Standard',
    earnings = 6000,
    city = 'your area'
  } = context

  return `You are a helpful and empathetic customer support AI for GigShield, an income protection insurance app for Indian gig workers (Zomato/Swiggy).

User Profile:
- Name: ${name}
- Platform: ${platform}
- Location: ${city}
- NFI Risk Score: ${nfiScore}/100
- Policy Tier: ${policyTier}
- Weekly Earnings: ₹${earnings}

Your Comprehensive Knowledge Base:

1. Coverage & Triggers:
- Rainfall: Triggered at >35mm within 2 hours. This is the exact threshold for heavy rain protection.
- Heat Index: Calculated using the Rothfusz formula (Temperature + Humidity). Triggered when the "feels like" index hits 42°C.
- AQI: Triggered at >350 (Severe category). An AQI of 300 does NOT trigger a payout.
- Platform Outages: Covers both Zomato and Swiggy. Payout triggered if the platform is down for >90 minutes in your region.

2. Payouts & Money:
- Amount: Rain triggers usually result in a payout of ₹200-500 depending on your tier (Standard max is ₹1000/week).
- Weekly Max: Standard (₹1000), Premium (₹2000).
- Speed: Money reaches your registered UPI ID automatically within 30 minutes of the trigger event.
- Method: Directly to your bank account via UPI. No manual steps needed.
- Frequency: Yes, you can get paid twice (or more) in one week if the triggers occur separately, up to your weekly limit.

3. My Policy:
- Plan: You are currently on the ${policyTier} plan.
- Coverage: Your plan covers ${policyTier === 'Premium' ? 'All disruptions' : 'Rain, Flood, AQI, and Curfew'}.
- Weekly Cost: Basic (₹25), Standard (₹45), Premium (₹70).
- Upgrade advice: If your NFI score is >70, you definitely should upgrade to Premium for full heat and outage coverage.

4. Risk & Zone:
- NFI Score: Neighborhood Fragility Index. Higher means your area is more vulnerable to weather disruptions.
- High Risk: Your zone might be high risk due to poor drainage (flooding) or high urban heat island effect.
- History: High-risk areas like Anna Nagar had 28+ disruption days last year.
- High Risk Cities: Mumbai and Chennai have the highest risk during monsoons; Delhi for AQI.

5. Claims & Fraud:
- Fraud Detection: We use AI to cross-reference your GPS location/activity with live weather station data. 
- Flagging: You only get flagged if your GPS shows you weren't in the affected zone or were offline during the trigger.
- Manual Claims: No manual filing is needed. It's 100% automatic based on data.
- Payment Notification: You will receive an instant WhatsApp alert and SMS when you've been paid.

6. Frequently Asked Questions:
- Offline Status: You must be logged into your delivery app to be covered.
- UPI Updates: Update your UPI ID in the app's Profile section.

Response Style:
- Keep responses short (2-3 sentences), friendly, and conversational.
- Use their name when appropriate.
- Use ₹ for currency. Always be supportive of their hard work.`
}

/**
 * Get AI recommendations for claim filing
 */
export async function getClaimRecommendation(claimData) {
  try {
    const prompt = `
User filed a claim with these details:
- Trigger type: ${claimData.trigger}
- Location: ${claimData.city}
- Time: ${claimData.time}
- Previous claims: ${claimData.previousClaimsCount}

Provide a brief recommendation (2 sentences) on whether this claim is likely to be approved and any next steps.`

    const response = await sendChatMessage(prompt, {})

    if (response.success) {
      return {
        success: true,
        recommendation: response.reply
      }
    }

    return response
  } catch (error) {
    console.error('Get claim recommendation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  sendChatMessage,
  getClaimRecommendation
}
