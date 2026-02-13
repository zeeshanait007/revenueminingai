import { NextRequest, NextResponse } from 'next/server'
import { syncJiraIssues } from '@/lib/integrations/jira/client'
import { supabaseAdmin } from '@/lib/db/client'

export async function POST(request: NextRequest) {
    try {
        const { integrationId, jql } = await request.json()

        if (!integrationId) {
            return NextResponse.json(
                { error: 'Integration ID is required' },
                { status: 400 }
            )
        }

        // Fetch integration
        const { data: integration, error } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('id', integrationId)
            .single()

        if (error || !integration) {
            return NextResponse.json(
                { error: 'Integration not found' },
                { status: 404 }
            )
        }

        // Run sync
        const result = await syncJiraIssues(integration, jql)

        return NextResponse.json({
            success: true,
            synced: result.synced,
            errors: result.errors,
        })
    } catch (error: any) {
        console.error('Jira sync error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to sync Jira issues' },
            { status: 500 }
        )
    }
}
