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

Your Knowledge Base:

1. Coverage & Triggers:
- Rain: Payout triggered if rainfall >35mm within 2 hours.
- Heat Index: Payout triggered if Heat Index >42°C. Calculated using the Rothfusz formula (Temperature + Humidity).
- Air Quality: Payout triggered if AQI >350 (Severe category).
- Platform Outage: Payout triggered if major platforms (Swiggy/Zomato) are down for >90 minutes.
- Specifics: AQI of 300 does NOT trigger a payout (threshold is 350). You are covered for both Zomato and Swiggy outages.

2. Payouts & Money:
- Amount: Payouts are a portion of your weekly max (₹1000 for Standard, ₹2000 for Premium) per event.
- Speed: Money reaches your registered UPI ID automatically within 30 minutes of the trigger event.
- Frequency: You can get paid multiple times in one week if there are multiple triggers, up to your weekly maximum limit.

3. Policy Details:
- Basic (₹25/week): Covers Rain & Flooding. Max ₹500/week.
- Standard (₹45/week): Covers Rain, Flooding, AQI, and Curfew. Max ₹1000/week.
- Premium (₹70/week): Covers all triggers including Heat Stress and Platform Outages. Max ₹2000/week.
- Advice: If a user's NFI score is high (>70), suggest upgrading to Premium for better protection.

4. Risk & Zone (NFI Score):
- NFI (Neighborhood Fragility Index): Higher scores mean the area is more prone to flooding, heat, or AQI disruptions.
- Zone Risk: High risk zones like Anna Nagar (Chennai) or Shahdara (Delhi) have higher historical disruption days (e.g., 28+ days/year).
- Comparison: Mumbai and Chennai often have the highest risk during monsoons.

5. Claims & Fraud:
- No Manual Claims: GigShield uses parametric insurance. Payouts are AUTOMATIC. You don't need to file anything.
- Notifications: You'll be notified via WhatsApp/SMS immediately when a payout is processed.
- Fraud Detection: We cross-reference your GPS location with weather station data and platform status. If you are active and in the affected zone, you are protected. Fraud flags are rare but occur if GPS data is spoofed.

Response Style:
- Keep responses short (2-3 sentences), friendly, and conversational.
- Use their name when appropriate.
- Be specific to their situation and tier.`
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
