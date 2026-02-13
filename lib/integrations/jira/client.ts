import { Version3Client } from 'jira.js'
import { Integration, Issue, IssueType } from '@/lib/db/types'
import { supabaseAdmin } from '@/lib/db/client'

export interface JiraConfig {
    host: string
    email: string
    apiToken: string
}

/**
 * Create Jira client from integration config
 */
export function createJiraClient(config: JiraConfig): Version3Client {
    return new Version3Client({
        host: config.host,
        authentication: {
            basic: {
                email: config.email,
                apiToken: config.apiToken,
            },
        },
    })
}

/**
 * Test Jira connection
 */
export async function testJiraConnection(
    config: JiraConfig
): Promise<boolean> {
    try {
        const client = createJiraClient(config)
        await client.myself.getCurrentUser()
        return true
    } catch (error) {
        console.error('Jira connection test failed:', error)
        return false
    }
}

/**
 * Fetch issues from Jira
 */
export async function fetchJiraIssues(
    integration: Integration,
    jql?: string,
    maxResults: number = 100
): Promise<any[]> {
    const config = integration.config as JiraConfig
    const client = createJiraClient(config)

    const defaultJql = jql || 'ORDER BY updated DESC'

    try {
        const response = await client.issueSearch.searchForIssuesUsingJql({
            jql: defaultJql,
            maxResults,
            fields: [
                'summary',
                'description',
                'status',
                'priority',
                'labels',
                'issuetype',
                'created',
                'updated',
                'assignee',
                'reporter',
                'customfield_*',
            ],
        })

        return response.issues || []
    } catch (error) {
        console.error('Failed to fetch Jira issues:', error)
        throw error
    }
}

/**
 * Map Jira issue type to internal issue type
 */
function mapJiraIssueType(jiraType: string): IssueType {
    const type = jiraType.toLowerCase()
    if (type.includes('bug')) return 'bug'
    if (type.includes('feature') || type.includes('story')) return 'feature_request'
    if (type.includes('support') || type.includes('help')) return 'support'
    if (type.includes('task')) return 'other'
    return 'other'
}

/**
 * Normalize Jira issue to internal format
 */
export function normalizeJiraIssue(
    jiraIssue: any,
    integration: Integration
): Partial<Issue> {
    const fields = jiraIssue.fields

    return {
        organization_id: integration.organization_id,
        integration_id: integration.id,
        external_id: jiraIssue.key,
        source: 'jira',
        type: mapJiraIssueType(fields.issuetype?.name || 'other'),
        title: fields.summary || '',
        description: fields.description || null,
        status: fields.status?.name || null,
        priority: fields.priority?.name || null,
        labels: fields.labels || [],
        metadata: {
            assignee: fields.assignee?.displayName || null,
            reporter: fields.reporter?.displayName || null,
            issueType: fields.issuetype?.name || null,
            jiraUrl: `${(integration.config as JiraConfig).host}/browse/${jiraIssue.key}`,
            customFields: extractCustomFields(fields),
        },
        external_created_at: fields.created ? new Date(fields.created) : null,
        external_updated_at: fields.updated ? new Date(fields.updated) : null,
    }
}

/**
 * Extract custom fields from Jira issue
 */
function extractCustomFields(fields: any): Record<string, any> {
    const customFields: Record<string, any> = {}

    for (const [key, value] of Object.entries(fields)) {
        if (key.startsWith('customfield_') && value !== null) {
            customFields[key] = value
        }
    }

    return customFields
}

/**
 * Sync Jira issues to database
 */
export async function syncJiraIssues(
    integration: Integration,
    jql?: string
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

        // Fetch issues from Jira
        const jiraIssues = await fetchJiraIssues(integration, jql, 1000)

        // Normalize and upsert issues
        for (const jiraIssue of jiraIssues) {
            try {
                const normalizedIssue = normalizeJiraIssue(jiraIssue, integration)

                // Upsert issue (update if exists, insert if not)
                const { error } = await supabaseAdmin.from('issues').upsert(
                    normalizedIssue,
                    {
                        onConflict: 'integration_id,external_id',
                    }
                )

                if (error) {
                    console.error('Failed to upsert issue:', error)
                    errors++
                } else {
                    synced++
                }
            } catch (error) {
                console.error('Failed to process Jira issue:', error)
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
        console.error('Jira sync failed:', error)
        errors++
        return { synced, errors }
    }
}

/**
 * Setup Jira webhook for real-time updates
 * Note: Webhook setup requires Jira admin permissions
 */
export async function setupJiraWebhook(
    integration: Integration,
    webhookUrl: string
): Promise<boolean> {
    // Webhook setup would be done manually through Jira UI
    // This is a placeholder for future implementation
    console.log('Webhook setup for integration:', integration.id, 'URL:', webhookUrl)
    return true
}
