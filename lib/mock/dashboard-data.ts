import { DashboardMetrics, Opportunity } from '@/lib/db/types'

export const MOCK_METRICS: DashboardMetrics = {
    total_revenue_at_risk: 1250000,
    total_opportunities: 12,
    high_priority_opportunities: 5,
    avg_rps_score: 74.5,
    total_issues_analyzed: 1450,
    total_clusters: 24,
    last_analysis_date: new Date(),
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: 'mock-opp-1',
        organization_id: '00000000-0000-0000-0000-000000000000',
        cluster_id: 'cluster-1',
        title: 'Enterprise Single Sign-On (SSO) Support',
        description: 'Multiple enterprise customers are requesting SAML/OIDC integration to meet security compliance requirements. Currently a major blocker for 15+ deals.',
        category: 'missing_feature',
        rps_score: 92,
        revenue_impact_arr: 450000,
        frequency_score: 85,
        urgency_score: 95,
        effort_hours: 120,
        effort_score: 60,
        status: 'identified',
        affected_customers: ['Acme Corp', 'Global Tech', 'Nitro Systems'],
        recommended_actions: [
            'Prioritize SSO implementation in Next Sprint',
            'Update sales collateral with SSO roadmap',
            'Reach out to blocked prospects with ETA'
        ],
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'mock-opp-2',
        organization_id: '00000000-0000-0000-0000-000000000000',
        cluster_id: 'cluster-2',
        title: 'API Rate Limiting & Performance Bottlenecks',
        description: 'Frequent reports of slow API responses and rate limit errors causing integration failures for high-volume users.',
        category: 'automation_gap',
        rps_score: 78,
        revenue_impact_arr: 220000,
        frequency_score: 90,
        urgency_score: 70,
        effort_hours: 45,
        effort_score: 30,
        status: 'identified',
        affected_customers: ['DataStream Inc', 'ConnectFlow', 'Streamline'],
        recommended_actions: [
            'Implement Redis-based rate limiting',
            'Upgrade API gateway infrastructure',
            'Introduce tiered API pricing'
        ],
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'mock-opp-3',
        organization_id: '00000000-0000-0000-0000-000000000000',
        cluster_id: 'cluster-3',
        title: 'Bulk Data Export Capability',
        description: 'Support teams are spending 20+ hours weekly manually exporting data for customers. Automated CSV/JSON export is highly requested.',
        category: 'automation_gap',
        rps_score: 65,
        revenue_impact_arr: 120000,
        frequency_score: 75,
        urgency_score: 55,
        effort_hours: 30,
        effort_score: 20,
        status: 'identified',
        affected_customers: ['SmallBiz Solutions', 'TechStart', 'LocalNet'],
        recommended_actions: [
            'Build self-service export tool',
            'Add scheduled exports to Premium tier',
            'Reduce support ticket volume by automating manual tasks'
        ],
        created_at: new Date(),
        updated_at: new Date(),
    }
]
