import { WebClient } from '@slack/web-api'
import { Integration, Issue, IssueType } from '@/lib/db/types'
import { supabaseAdmin } from '@/lib/db/client'

export interface SlackConfig {
    accessToken: string
    teamId: string
    teamName: string
}

/**
 * Create Slack client from integration config
 */
export function createSlackClient(config: SlackConfig): WebClient {
    return new WebClient(config.accessToken)
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(
    config: SlackConfig
): Promise<boolean> {
    try {
        const client = createSlackClient(config)
        await client.auth.test()
        return true
    } catch (error) {
        console.error('Slack connection test failed:', error)
        return false
    }
}

/**
 * Fetch channels from Slack
 */
export async function fetchSlackChannels(
    integration: Integration
): Promise<any[]> {
    const config = integration.config as SlackConfig
    const client = createSlackClient(config)

    try {
        const response = await client.conversations.list({
            types: 'public_channel,private_channel',
            limit: 1000,
        })

        return response.channels || []
    } catch (error) {
        console.error('Failed to fetch Slack channels:', error)
        throw error
    }
}

/**
 * Fetch messages from Slack channel
 */
export async function fetchSlackMessages(
    integration: Integration,
    channelId: string,
    limit: number = 100
): Promise<any[]> {
    const config = integration.config as SlackConfig
    const client = createSlackClient(config)

    try {
        const response = await client.conversations.history({
            channel: channelId,
            limit,
        })

        return response.messages || []
    } catch (error) {
        console.error('Failed to fetch Slack messages:', error)
        throw error
    }
}

/**
 * Fetch thread replies
 */
export async function fetchThreadReplies(
    integration: Integration,
    channelId: string,
    threadTs: string
): Promise<any[]> {
    const config = integration.config as SlackConfig
    const client = createSlackClient(config)

    try {
        const response = await client.conversations.replies({
            channel: channelId,
            ts: threadTs,
        })

        return response.messages || []
    } catch (error) {
        console.error('Failed to fetch thread replies:', error)
        return []
    }
}

/**
 * Determine issue type from Slack message
 */
function classifySlackMessage(message: any, channelName: string): IssueType {
    const text = (message.text || '').toLowerCase()
    const channel = channelName.toLowerCase()

    if (channel.includes('support') || channel.includes('help')) {
        return 'support'
    }
    if (channel.includes('feature') || text.includes('feature request')) {
        return 'feature_request'
    }
    if (channel.includes('bug') || text.includes('bug')) {
        return 'bug'
    }

    return 'discussion'
}

/**
 * Normalize Slack message to internal format
 */
export function normalizeSlackMessage(
    message: any,
    channelId: string,
    channelName: string,
    integration: Integration,
    threadMessages?: any[]
): Partial<Issue> {
    const text = message.text || ''
    const threadText = threadMessages
        ?.map((m) => m.text)
        .filter(Boolean)
        .join('\n')

    // Extract title (first line or first 100 chars)
    const title = text.split('\n')[0].slice(0, 100) || 'Slack Discussion'

    // Combine message and thread for description
    const description = threadMessages
        ? `${text}\n\n--- Thread ---\n${threadText}`
        : text

    return {
        organization_id: integration.organization_id,
        integration_id: integration.id,
        external_id: `${channelId}_${message.ts}`,
        source: 'slack',
        type: classifySlackMessage(message, channelName),
        title,
        description,
        status: null,
        priority: null,
        labels: [channelName],
        metadata: {
            channelId,
            channelName,
            userId: message.user,
            threadTs: message.thread_ts || message.ts,
            replyCount: message.reply_count || 0,
            reactions: message.reactions || [],
            slackUrl: `https://${(integration.config as SlackConfig).teamName}.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`,
        },
        external_created_at: message.ts
            ? new Date(parseFloat(message.ts) * 1000)
            : null,
        external_updated_at: message.latest_reply
            ? new Date(parseFloat(message.latest_reply) * 1000)
            : null,
    }
}

/**
 * Sync Slack messages to database
 */
export async function syncSlackMessages(
    integration: Integration,
    channelIds?: string[]
): Promise<{ synced: number; errors: number }> {
    let synced = 0
    let errors = 0

    try {
        // Create sync log
        const { data: syncLog } = await supabaseAdmin
            .from('sync_logs')
            .insert({
                integration_id: integration.id,
                status: 'running',
            })
            .select()
            .single()

        if (!syncLog) {
            throw new Error('Failed to create sync log')
        }

        // Get channels to sync
        let channels: any[]
        if (channelIds && channelIds.length > 0) {
            channels = channelIds.map((id) => ({ id }))
        } else {
            channels = await fetchSlackChannels(integration)
            // Filter to relevant channels (support, feature-requests, etc.)
            channels = channels.filter((ch) => {
                const name = ch.name?.toLowerCase() || ''
                return (
                    name.includes('support') ||
                    name.includes('feature') ||
                    name.includes('bug') ||
                    name.includes('feedback')
                )
            })
        }

        // Sync messages from each channel
        for (const channel of channels) {
            try {
                const messages = await fetchSlackMessages(integration, channel.id, 100)

                for (const message of messages) {
                    try {
                        // Skip bot messages and system messages
                        if (message.bot_id || message.subtype) continue

                        // Fetch thread if it exists
                        let threadMessages: any[] | undefined
                        if (message.reply_count && message.reply_count > 0) {
                            threadMessages = await fetchThreadReplies(
                                integration,
                                channel.id,
                                message.ts
                            )
                        }

                        const normalizedIssue = normalizeSlackMessage(
                            message,
                            channel.id,
                            channel.name || 'unknown',
                            integration,
                            threadMessages
                        )

                        // Upsert issue
                        const { error } = await supabaseAdmin.from('issues').upsert(
                            normalizedIssue,
                            {
                                onConflict: 'integration_id,external_id',
                            }
                        )

                        if (error) {
                            console.error('Failed to upsert Slack message:', error)
                            errors++
                        } else {
                            synced++
                        }
                    } catch (error) {
                        console.error('Failed to process Slack message:', error)
                        errors++
                    }
                }
            } catch (error) {
                console.error(`Failed to sync channel ${channel.id}:`, error)
                errors++
            }
        }

        // Update sync log
        await supabaseAdmin
            .from('sync_logs')
            .update({
                status: 'completed',
                items_synced: synced,
                completed_at: new Date().toISOString(),
            })
            .eq('id', syncLog.id)

        // Update integration last_sync_at
        await supabaseAdmin
            .from('integrations')
            .update({
                last_sync_at: new Date().toISOString(),
            })
            .eq('id', integration.id)

        return { synced, errors }
    } catch (error) {
        console.error('Slack sync failed:', error)
        errors++
        return { synced, errors }
    }
}
