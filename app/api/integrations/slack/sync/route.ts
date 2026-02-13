import { NextRequest, NextResponse } from 'next/server'
import { syncSlackMessages } from '@/lib/integrations/slack/client'
import { supabaseAdmin } from '@/lib/db/client'

export async function POST(request: NextRequest) {
    try {
        const { integrationId, channelIds } = await request.json()

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
        const result = await syncSlackMessages(integration, channelIds)

        return NextResponse.json({
            success: true,
            synced: result.synced,
            errors: result.errors,
        })
    } catch (error: any) {
        console.error('Slack sync error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to sync Slack messages' },
            { status: 500 }
        )
    }
}
