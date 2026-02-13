import OpenAI from 'openai'
import { Opportunity } from '@/lib/db/types'

let openaiInstance: OpenAI | null = null

function getOpenAIClient(): OpenAI {
    if (!openaiInstance) {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is missing')
        }
        openaiInstance = new OpenAI({ apiKey })
    }
    return openaiInstance
}

/**
 * Generate deep, strategic actions for a specific opportunity using GPT-4
 */
export async function generateStrategicActions(
    opportunity: Partial<Opportunity>
): Promise<string[]> {
    const prompt = `As a Strategic Revenue Advisor, analyze this identified revenue opportunity and provide 3-4 highly actionable, specific, and strategic next steps.

Opportunity Details:
- Title: ${opportunity.title}
- Description: ${opportunity.description || 'N/A'}
- Category: ${opportunity.category}
- Revenue Impact (ARR): $${opportunity.revenue_impact_arr?.toLocaleString() || '0'}
- RPS Score: ${opportunity.rps_score}
- Affected Customers: ${opportunity.affected_customers?.join(', ') || 'Various'}

Your recommendations should be:
1. Specific: Don't just say "call customers"; tell them what to say.
2. Strategic: Consider long-term revenue retention and expansion.
3. Relevant: Tailor the advice based on whether it's a bug fix, missing feature, or automation gap.

Respond in JSON format:
{
  "actions": [
    "Draft a customized upsell proposal for Acme Corp emphasizing the SSO security benefits and Q3 implementation timeline.",
    "..."
  ]
}`

    const openai = getOpenAIClient()
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a world-class strategic revenue consultant. Your goal is to maximize ARR and minimize churn through precise action items.',
                },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')
        return result.actions || []
    } catch (error) {
        console.error('Error generating strategic actions:', error)
        return [
            "Escalate to product leadership for deeper review",
            "Evaluate technical feasibility",
            "Contact affected customers for qualitative feedback"
        ]
    }
}
