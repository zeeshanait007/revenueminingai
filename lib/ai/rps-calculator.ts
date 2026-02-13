import { Issue, RevenueSignal, Opportunity, OpportunityCategory } from '@/lib/db/types'
import { supabaseAdmin } from '@/lib/db/client'
import { generateStrategicActions } from './recommendations-agent'

// RPS Weights (configurable)
export const RPS_WEIGHTS = {
    REVENUE_IMPACT: 0.4, // 40%
    FREQUENCY: 0.25, // 25%
    URGENCY: 0.20, // 20%
    EFFORT: 0.15, // 15%
}

/**
 * Calculate frequency score based on count (normalized 0-100)
 */
function calculateFrequencyScore(count: number): number {
    return Math.min(100, Math.log10(count + 1) * 50)
}

/**
 * Calculate urgency score based on level
 */
function calculateUrgencyScore(level: string): number {
    const scores: Record<string, number> = {
        low: 25,
        medium: 50,
        high: 75,
        critical: 100,
    }
    return scores[level.toLowerCase()] || 25
}

/**
 * Calculate effort score based on hours (normalized 0-100, inverse)
 */
function calculateEffortScore(hours: number): number {
    return Math.max(0, 100 - (hours / 160) * 100)
}

/**
 * Calculate Revenue Potential Score (RPS) for an opportunity
 */
export function calculateRPS(params: {
    revenueImpactArr: number
    frequency: number
    urgency: 'low' | 'medium' | 'high' | 'critical'
    effortHours: number
}): number {
    const { revenueImpactArr, frequency, urgency, effortHours } = params

    // Normalize revenue impact (0-100 scale, assuming 100k is max for normalization)
    const revenueScore = Math.min(100, (revenueImpactArr / 100000) * 100)
    const frequencyScore = calculateFrequencyScore(frequency)
    const urgencyScore = calculateUrgencyScore(urgency)
    const effortScore = calculateEffortScore(effortHours)

    // Calculate weighted RPS
    const rps =
        revenueScore * RPS_WEIGHTS.REVENUE_IMPACT +
        frequencyScore * RPS_WEIGHTS.FREQUENCY +
        urgencyScore * RPS_WEIGHTS.URGENCY +
        effortScore * RPS_WEIGHTS.EFFORT

    return Math.round(rps * 10) / 10
}

/**
 * Determine opportunity category based on characteristics
 */
export function determineCategory(signals: RevenueSignal[]): OpportunityCategory {
    const signalTypes = signals.map((s) => s.signal_type)

    if (signalTypes.includes('deal_blocker')) {
        return 'missing_feature'
    }
    if (signalTypes.includes('churn_risk')) {
        return 'bug_fix'
    }
    if (signalTypes.includes('automation_opportunity')) {
        return 'automation_gap'
    }
    if (signalTypes.includes('feature_gap')) {
        return 'roadmap_misalignment'
    }

    return 'missing_feature'
}

/**
 * Generate recommended actions based on opportunity
 */
export function generateRecommendedActions(
    opportunity: Partial<Opportunity>
): string[] {
    const actions: string[] = []

    if (opportunity.rps_score && opportunity.rps_score >= 80) {
        actions.push('Escalate to executive team immediately')
        actions.push('Schedule customer call within 48 hours')
    }

    if (opportunity.category === 'missing_feature') {
        actions.push('Add to product roadmap')
        actions.push('Estimate engineering effort')
        actions.push('Identify workaround for immediate relief')
    }

    if (opportunity.category === 'bug_fix') {
        actions.push('Create high-priority bug ticket')
        actions.push('Assign to senior engineer')
        actions.push('Provide daily status updates to customer')
    }

    if (opportunity.category === 'automation_gap') {
        actions.push('Evaluate automation tools')
        actions.push('Create implementation plan')
        actions.push('Calculate ROI for automation')
    }

    if (opportunity.affected_customers && opportunity.affected_customers.length >= 5) {
        actions.push('Conduct customer survey')
        actions.push('Host customer roundtable discussion')
    }

    return actions
}

/**
 * Generate opportunities from clusters
 */
export async function generateOpportunities(
    organizationId: string
): Promise<Opportunity[]> {
    // Fetch all clusters for the organization
    const { data: clusters, error: clustersError } = await supabaseAdmin
        .from('clusters')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

    if (clustersError || !clusters) {
        throw new Error(`Failed to fetch clusters: ${clustersError?.message}`)
    }

    const opportunities: Opportunity[] = []

    for (const cluster of clusters) {
        // Fetch cluster members
        const { data: members } = await supabaseAdmin
            .from('cluster_members')
            .select('issue_id')
            .eq('cluster_id', cluster.id)

        if (!members || members.length === 0) continue

        const issueIds = members.map((m: any) => m.issue_id)

        // Fetch revenue signals for these issues
        const { data: signals } = await supabaseAdmin
            .from('revenue_signals')
            .select('*')
            .in('issue_id', issueIds)

        if (!signals || signals.length === 0) continue

        // Calculate total revenue impact
        const totalRevenueImpact = signals.reduce(
            (sum: number, s: any) => sum + (s.deal_size_arr || 0),
            0
        )

        // Determine urgency (highest urgency from signals)
        const urgencyLevels = ['low', 'medium', 'high', 'critical']
        const maxUrgency = signals.reduce((max: string, s: any) => {
            const currentIndex = urgencyLevels.indexOf(s.urgency)
            const maxIndex = urgencyLevels.indexOf(max)
            return currentIndex > maxIndex ? s.urgency : max
        }, 'low')

        // Calculate scores for schema
        const fScore = calculateFrequencyScore(cluster.issue_count)
        const uScore = calculateUrgencyScore(maxUrgency)
        const eScore = calculateEffortScore(cluster.total_time_spent_hours || 0)

        // Calculate RPS
        const rps = calculateRPS({
            revenueImpactArr: totalRevenueImpact,
            frequency: cluster.issue_count,
            urgency: maxUrgency as any,
            effortHours: cluster.total_time_spent_hours || 0,
        })

        // Determine category
        const category = determineCategory(signals as RevenueSignal[])

        // Extract affected customers
        const affectedCustomers: string[] = Array.from(
            new Set(
                signals
                    .map((s: any) => s.customer_name)
                    .filter((name: any): name is string => !!name)
            )
        )

        // Create opportunity
        const opportunity: Partial<Opportunity> = {
            organization_id: organizationId,
            cluster_id: cluster.id,
            title: cluster.name,
            description: cluster.description,
            category,
            rps_score: rps,
            revenue_impact_arr: totalRevenueImpact,
            frequency_score: fScore,
            urgency_score: uScore,
            effort_hours: cluster.total_time_spent_hours || 0,
            effort_score: eScore,
            affected_customers: affectedCustomers,
            status: 'identified',
        }

        // Generate recommended actions
        if (opportunity.rps_score && opportunity.rps_score >= 80) {
            // Use AI for high priority items
            try {
                opportunity.recommended_actions = await generateStrategicActions(opportunity)
            } catch (e) {
                opportunity.recommended_actions = generateRecommendedActions(opportunity)
            }
        } else {
            opportunity.recommended_actions = generateRecommendedActions(opportunity)
        }

        // Insert opportunity
        const { data: insertedOpp, error: oppError } = await supabaseAdmin
            .from('opportunities')
            .insert(opportunity)
            .select()
            .single()

        if (!oppError && insertedOpp) {
            opportunities.push(insertedOpp as Opportunity)
        }
    }

    return opportunities
}

/**
 * Recalculate RPS for existing opportunities
 */
export async function recalculateRPS(opportunityId: string): Promise<number> {
    // Fetch opportunity
    const { data: opportunity } = await supabaseAdmin
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single()

    if (!opportunity) {
        throw new Error('Opportunity not found')
    }

    const urgencyLevels = ['low', 'medium', 'high', 'critical']
    // Attempt to map urgency score back to level for calculation if needed, 
    // but here we can just use the stored scores directly if we refactor calculateRPS
    // For now, let's just make it simple.

    const frequency = opportunity.affected_customers?.length || 1
    const revenueImpactArr = opportunity.revenue_impact_arr || 0
    const effortHours = opportunity.effort_hours || 0

    // RPS calculation using existing scores
    const rps =
        (Math.min(100, (revenueImpactArr / 100000) * 100) * RPS_WEIGHTS.REVENUE_IMPACT) +
        (opportunity.frequency_score * RPS_WEIGHTS.FREQUENCY) +
        (opportunity.urgency_score * RPS_WEIGHTS.URGENCY) +
        (opportunity.effort_score * RPS_WEIGHTS.EFFORT)

    const newRps = Math.round(rps * 10) / 10

    // Update opportunity
    await supabaseAdmin
        .from('opportunities')
        .update({ rps_score: newRps })
        .eq('id', opportunityId)

    return newRps
}
