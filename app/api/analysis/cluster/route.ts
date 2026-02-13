import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/client'
import { clusterIssues } from '@/lib/ai/clustering'

export async function POST(request: NextRequest) {
    try {
        const { organizationId, issueIds } = await request.json()

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            )
        }

        // Run clustering
        const clusters = await clusterIssues(organizationId, issueIds)

        return NextResponse.json({
            success: true,
            clusters,
            count: clusters.length,
        })
    } catch (error: any) {
        console.error('Clustering error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to cluster issues' },
            { status: 500 }
        )
    }
}

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

        // Fetch existing clusters
        const { data: clusters, error } = await supabaseAdmin
            .from('clusters')
            .select('*')
            .eq('organization_id', organizationId)
            .order('issue_count', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({ clusters })
    } catch (error: any) {
        console.error('Fetch clusters error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch clusters' },
            { status: 500 }
        )
    }
}
