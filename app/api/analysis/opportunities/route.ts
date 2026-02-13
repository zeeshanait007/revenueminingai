import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/client'
import { generateOpportunities } from '@/lib/ai/rps-calculator'

export async function POST(request: NextRequest) {
    try {
        const { organizationId } = await request.json()

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            )
        }

        // Generate opportunities from clusters and signals
        const opportunities = await generateOpportunities(organizationId)

        return NextResponse.json({
            success: true,
            opportunities,
            count: opportunities.length,
        })
    } catch (error: any) {
        console.error('Generate opportunities error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate opportunities' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get('organizationId')
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            )
        }

        let query = supabaseAdmin
            .from('opportunities')
            .select('*')
            .eq('organization_id', organizationId)
            .order('rps_score', { ascending: false })
            .limit(limit)

        if (status) {
            query = query.eq('status', status)
        }

        const { data: opportunities, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ opportunities })
    } catch (error: any) {
        console.error('Fetch opportunities error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch opportunities' },
            { status: 500 }
        )
    }
}
