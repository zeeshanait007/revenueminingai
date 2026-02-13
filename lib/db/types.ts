import { z } from 'zod'

// Organization
export const organizationSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
})

export type Organization = z.infer<typeof organizationSchema>

// User
export const userRoleSchema = z.enum(['admin', 'analyst', 'viewer'])

export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    organization_id: z.string().uuid(),
    role: userRoleSchema,
    created_at: z.date(),
    updated_at: z.date(),
})

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>

// Integration
export const integrationTypeSchema = z.enum(['jira', 'slack'])
export const integrationStatusSchema = z.enum(['active', 'inactive', 'error'])

export const integrationSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    type: integrationTypeSchema,
    name: z.string(),
    config: z.record(z.any()),
    status: integrationStatusSchema,
    last_sync_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
})

export type Integration = z.infer<typeof integrationSchema>
export type IntegrationType = z.infer<typeof integrationTypeSchema>
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>

// Issue
export const issueSourceSchema = z.enum(['jira', 'slack'])
export const issueTypeSchema = z.enum([
    'bug',
    'feature_request',
    'support',
    'discussion',
    'other',
])

export const issueSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    integration_id: z.string().uuid(),
    external_id: z.string(),
    source: issueSourceSchema,
    type: issueTypeSchema.nullable(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.string().nullable(),
    priority: z.string().nullable(),
    labels: z.array(z.string()),
    metadata: z.record(z.any()).nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    external_created_at: z.date().nullable(),
    external_updated_at: z.date().nullable(),
})

export type Issue = z.infer<typeof issueSchema>
export type IssueSource = z.infer<typeof issueSourceSchema>
export type IssueType = z.infer<typeof issueTypeSchema>

// Cluster
export const clusterSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    theme: z.string().nullable(),
    issue_count: z.number().int(),
    total_time_spent_hours: z.number(),
    created_at: z.date(),
    updated_at: z.date(),
})

export type Cluster = z.infer<typeof clusterSchema>

// Cluster Member
export const clusterMemberSchema = z.object({
    id: z.string().uuid(),
    cluster_id: z.string().uuid(),
    issue_id: z.string().uuid(),
    similarity_score: z.number().min(0).max(1).nullable(),
    created_at: z.date(),
})

export type ClusterMember = z.infer<typeof clusterMemberSchema>

// Revenue Signal
export const revenueSignalTypeSchema = z.enum([
    'deal_blocker',
    'churn_risk',
    'feature_gap',
    'automation_opportunity',
])

export const urgencyLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])

export const revenueSignalSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    issue_id: z.string().uuid(),
    signal_type: revenueSignalTypeSchema,
    confidence: z.number().min(0).max(1).nullable(),
    deal_size_arr: z.number().nullable(),
    customer_name: z.string().nullable(),
    urgency: urgencyLevelSchema.nullable(),
    extracted_entities: z.record(z.any()).nullable(),
    pain_points: z.array(z.string()).nullable(),
    competitive_context: z.string().nullable(),
    created_at: z.date(),
})

export type RevenueSignal = z.infer<typeof revenueSignalSchema>
export type RevenueSignalType = z.infer<typeof revenueSignalTypeSchema>
export type UrgencyLevel = z.infer<typeof urgencyLevelSchema>

// Opportunity
export const opportunityCategorySchema = z.enum([
    'missing_feature',
    'automation_gap',
    'bug_fix',
    'roadmap_misalignment',
])

export const opportunityStatusSchema = z.enum([
    'identified',
    'in_progress',
    'completed',
    'dismissed',
])

export const opportunitySchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    cluster_id: z.string().uuid().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    category: opportunityCategorySchema.nullable(),
    rps_score: z.number().min(0).max(100),
    revenue_impact_arr: z.number().nullable(),
    frequency_score: z.number().min(0).max(100),
    urgency_score: z.number().min(0).max(100),
    effort_hours: z.number().nullable(),
    effort_score: z.number().min(0).max(100),
    status: opportunityStatusSchema,
    affected_customers: z.array(z.string()),
    recommended_actions: z.array(z.string()),
    created_at: z.date(),
    updated_at: z.date(),
})

export type Opportunity = z.infer<typeof opportunitySchema>
export type OpportunityCategory = z.infer<typeof opportunityCategorySchema>
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>

// Report
export const reportTypeSchema = z.enum(['executive_summary', 'detailed_analysis'])

export const reportSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    title: z.string(),
    report_type: reportTypeSchema.nullable(),
    date_range_start: z.date().nullable(),
    date_range_end: z.date().nullable(),
    content: z.record(z.any()),
    file_url: z.string().nullable(),
    created_by: z.string().uuid().nullable(),
    created_at: z.date(),
})

export type Report = z.infer<typeof reportSchema>
export type ReportType = z.infer<typeof reportTypeSchema>

// Sync Log
export const syncStatusSchema = z.enum(['running', 'completed', 'failed'])

export const syncLogSchema = z.object({
    id: z.string().uuid(),
    integration_id: z.string().uuid(),
    status: syncStatusSchema,
    items_synced: z.number().int(),
    error_message: z.string().nullable(),
    started_at: z.date(),
    completed_at: z.date().nullable(),
})

export type SyncLog = z.infer<typeof syncLogSchema>
export type SyncStatus = z.infer<typeof syncStatusSchema>

// Dashboard Metrics
export const dashboardMetricsSchema = z.object({
    total_revenue_at_risk: z.number(),
    total_opportunities: z.number(),
    high_priority_opportunities: z.number(),
    avg_rps_score: z.number(),
    total_issues_analyzed: z.number(),
    total_clusters: z.number(),
    last_analysis_date: z.date().nullable(),
})

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>
