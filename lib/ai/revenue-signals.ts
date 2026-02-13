import OpenAI from 'openai'
import { Issue, RevenueSignalType, UrgencyLevel } from '@/lib/db/types'
import { supabaseAdmin } from '@/lib/db/client'

// Initialize OpenAI client lazily to avoid build-time errors when API key is missing
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

export interface DetectedSignal {
    issueId: string
    signalType: RevenueSignalType
    confidence: number
    dealSizeArr?: number
    customerName?: string
    urgency: UrgencyLevel
    extractedEntities: Record<string, any>
}

/**
 * Analyze issue text for revenue signals using GPT-4
 */
export async function detectRevenueSignals(
    issue: Issue
): Promise<DetectedSignal[]> {
    const text = `
Title: ${issue.title}
Description: ${issue.description || 'N/A'}
Labels: ${issue.labels.join(', ')}
Priority: ${issue.priority || 'N/A'}
Status: ${issue.status || 'N/A'}
  `.trim()

    const prompt = `Analyze this issue for revenue impact signals. Identify:

1. Signal Type: deal_blocker, churn_risk, feature_gap, automation_opportunity
2. Confidence: 0-1 score
3. Deal Size (ARR): Extract if mentioned
4. Customer Name: Extract if mentioned
5. Urgency: low, medium, high, critical
6. Entities: Extract key entities (features, pain points, competitors, etc.)
7. Customer Pain Points: Extract specific frustrations (max 3)
8. Competitive Context: Mention competitors if they appear to be winning/losing ground here

Issue:
${text}

Respond in JSON format:
{
  "signals": [
    {
      "signalType": "deal_blocker",
      "confidence": 0.85,
      "dealSizeArr": 50000,
      "customerName": "Acme Corp",
      "urgency": "high",
      "extractedEntities": { ... },
      "painPoints": ["Manual effort is too high", "Security audit failing"],
      "competitiveContext": "Competitor X already has this feature"
    }
  ]
}

Return empty array if no revenue signals detected.`

    const openai = getOpenAIClient()
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an expert at analyzing product issues for revenue impact. Be precise and conservative in your assessments.',
                },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')
        const signals: DetectedSignal[] = (result.signals || []).map(
            (s: any) => ({
                issueId: issue.id,
                signalType: s.signalType,
                confidence: s.confidence,
                dealSizeArr: s.dealSizeArr,
                customerName: s.customerName,
                urgency: s.urgency,
                extractedEntities: s.extractedEntities || {},
            })
        )

        return signals
    } catch (error) {
        console.error('Error detecting revenue signals:', error)
        return []
    }
}

/**
 * Batch process issues for revenue signal detection
 */
export async function detectRevenueSignalsBatch(
    organizationId: string,
    issueIds?: string[]
): Promise<DetectedSignal[]> {
    // Fetch issues
    let query = supabaseAdmin
        .from('issues')
        .select('*')
        .eq('organization_id', organizationId)

    if (issueIds && issueIds.length > 0) {
        query = query.in('id', issueIds)
    }

    const { data: issues, error } = await query

    if (error || !issues) {
        throw new Error(`Failed to fetch issues: ${error?.message}`)
    }

    const allSignals: DetectedSignal[] = []

    // Process in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < issues.length; i += batchSize) {
        const batch = issues.slice(i, i + batchSize)
        const batchPromises = batch.map((issue: any) =>
            detectRevenueSignals(issue as Issue)
        )
        const batchResults = await Promise.all(batchPromises)
        allSignals.push(...batchResults.flat())

        // Rate limiting delay
        if (i + batchSize < issues.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    // Store signals in database
    if (allSignals.length > 0) {
        const signalRecords = allSignals.map((signal) => ({
            organization_id: organizationId,
            issue_id: signal.issueId,
            signal_type: signal.signalType,
            confidence: signal.confidence,
            deal_size_arr: signal.dealSizeArr,
            customer_name: signal.customerName,
            urgency: signal.urgency,
            extracted_entities: signal.extractedEntities,
            pain_points: (signal as any).painPoints || [],
            competitive_context: (signal as any).competitiveContext || null,
        }))

        await supabaseAdmin.from('revenue_signals').insert(signalRecords)
    }

    return allSignals
}

/**
 * Classify urgency based on keywords and context
 */
export function classifyUrgency(issue: Issue): UrgencyLevel {
    const text = `${issue.title} ${issue.description || ''}`.toLowerCase()

    const criticalKeywords = [
        'urgent',
        'critical',
        'blocker',
        'asap',
        'immediately',
        'emergency',
    ]
    const highKeywords = [
        'important',
        'high priority',
        'soon',
        'deal at risk',
        'losing customer',
    ]
    const mediumKeywords = ['needed', 'requested', 'would like', 'planning']

    if (criticalKeywords.some((kw) => text.includes(kw))) {
        return 'critical'
    }
    if (highKeywords.some((kw) => text.includes(kw))) {
        return 'high'
    }
    if (mediumKeywords.some((kw) => text.includes(kw))) {
        return 'medium'
    }

    return 'low'
}

/**
 * Extract deal size from text using regex and NLP
 */
export function extractDealSize(text: string): number | null {
    // Look for currency patterns
    const patterns = [
        /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K|thousand)/g,
        /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:m|M|million)/g,
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K)\s*ARR/gi,
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:m|M)\s*ARR/gi,
    ]

    for (const pattern of patterns) {
        const match = pattern.exec(text)
        if (match) {
            const num = parseFloat(match[1].replace(/,/g, ''))
            if (text.toLowerCase().includes('m') || text.toLowerCase().includes('million')) {
                return num * 1000000
            }
            if (text.toLowerCase().includes('k') || text.toLowerCase().includes('thousand')) {
                return num * 1000
            }
            return num
        }
    }

    return null
}

/**
 * Estimate time spent on issue based on metadata and patterns
 */
export function estimateTimeSpent(issue: Issue): number {
    // Check metadata for time tracking
    const metadata = issue.metadata as any
    if (metadata?.timeSpentHours) {
        return metadata.timeSpentHours
    }

    // Estimate based on issue type and priority
    const baseHours: Record<string, number> = {
        bug: 4,
        feature_request: 8,
        support: 2,
        discussion: 1,
        other: 2,
    }

    const priorityMultiplier: Record<string, number> = {
        critical: 1.5,
        high: 1.2,
        medium: 1.0,
        low: 0.8,
    }

    const base = baseHours[issue.type || 'other'] || 2
    const multiplier = priorityMultiplier[issue.priority?.toLowerCase() || 'medium'] || 1.0

    return base * multiplier
}
