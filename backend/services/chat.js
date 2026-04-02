import axios from 'axios'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Send message to Groq API for AI-powered responses
 */
export async function sendChatMessage(userMessage, userContext = {}) {
  if (!GROQ_API_KEY) {
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
        model: 'mixtral-8x7b-32768', // Free Groq model
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
          'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    policyTier = 'standard',
    earnings = 6000,
    city = 'your area'
  } = context

  return `You are a helpful and empathetic customer support AI for GigShield, an income protection insurance app for gig workers.

User Profile:
- Name: ${name}
- Platform: ${platform}
- Location: ${city}
- NFI Risk Score: ${nfiScore}/100
- Policy Tier: ${policyTier}
- Weekly Earnings: ₹${earnings}

Your role:
1. Explain how GigShield protects against disruptions (rain, heat, poor air quality, app outages)
2. Answer questions about their specific policy and coverage
3. Help with claim questions and payout status
4. Provide tips to reduce risk (e.g., avoid delivery during heat waves)
5. Be supportive and empathetic - these are gig workers with irregular income

Coverage Details for ${policyTier} tier:
- Basic: ₹50,000 max coverage, ₹20/week premium
- Standard: ₹2,00,000 max coverage, ₹54/week premium
- Premium: ₹5,00,000 max coverage, ₹99/week premium

Auto-Payout Triggers:
- Heavy rainfall >35mm
- Heat index >42°C
- Poor air quality (AQI >350)
- Platform outage >90 minutes

Keep responses short (2-3 sentences), friendly, and conversational. Use their name when appropriate. Be specific to their situation.`
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
