import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/client'
import { DashboardMetrics } from '@/lib/db/types'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get('organizationId')

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            )
        }

        // Fetch opportunities
        const { data: opportunities } = await supabaseAdmin
            .from('opportunities')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'identified')

        // Calculate total revenue at risk
        const totalRevenueAtRisk = opportunities?.reduce(
            (sum: number, opp: any) => sum + (opp.revenue_impact_arr || 0),
            0
        ) || 0

        // Count high priority opportunities (RPS > 70)
        const highPriorityCount = opportunities?.filter(
            (opp: any) => opp.rps_score >= 70
        ).length || 0

        // Calculate average RPS
        const avgRps = opportunities?.length
            ? opportunities.reduce((sum: number, opp: any) => sum + opp.rps_score, 0) /
            opportunities.length
            : 0

        // Fetch total issues
        const { count: totalIssues } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)

        // Fetch total clusters
        const { count: totalClusters } = await supabaseAdmin
            .from('clusters')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)

        // Get last analysis date
        const { data: lastCluster } = await supabaseAdmin
            .from('clusters')
            .select('created_at')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const metrics: DashboardMetrics = {
            total_revenue_at_risk: totalRevenueAtRisk,
            total_opportunities: opportunities?.length || 0,
            high_priority_opportunities: highPriorityCount,
            avg_rps_score: Math.round(avgRps * 10) / 10,
            total_issues_analyzed: totalIssues || 0,
            total_clusters: totalClusters || 0,
            last_analysis_date: lastCluster?.created_at
                ? new Date(lastCluster.created_at)
                : null,
        }

        return NextResponse.json({ metrics })
    } catch (error: any) {
        console.error('Fetch metrics error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch metrics' },
            { status: 500 }
        )
    }
}
