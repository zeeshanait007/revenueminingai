'use client'

import { useState } from 'react'
import { useDashboardMetrics } from '@/lib/hooks/use-dashboard-metrics'
import { useOpportunities } from '@/lib/hooks/use-opportunities'
import { RevenueAtRiskCard } from '@/components/dashboard/revenue-at-risk-card'
import { OpportunitiesList } from '@/components/dashboard/opportunities-list'
import { ImpactEffortMatrix } from '@/components/dashboard/impact-effort-matrix'
import { ExecutiveSummary } from '@/components/dashboard/executive-summary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, RefreshCw, FileText, TrendingUp, Monitor, Zap } from 'lucide-react'
import { formatNumber, formatRelativeTime } from '@/lib/utils/formatting'
import { MOCK_METRICS, MOCK_OPPORTUNITIES } from '@/lib/mock/dashboard-data'

// TODO: Replace with actual organization ID from auth
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000000'

export default function DashboardPage() {
    const [isDemoMode, setIsDemoMode] = useState(false)
    const { data: metricsData, isLoading: metricsLoading } =
        useDashboardMetrics(DEMO_ORG_ID)
    const { data: opportunitiesData, isLoading: opportunitiesLoading } =
        useOpportunities(DEMO_ORG_ID, 'identified')

    const metrics = isDemoMode ? MOCK_METRICS : metricsData?.metrics
    const opportunities = isDemoMode ? MOCK_OPPORTUNITIES : (opportunitiesData?.opportunities || [])

    if (metricsLoading || opportunitiesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ARRAlign
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Revenue Intelligence Platform
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant={isDemoMode ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIsDemoMode(!isDemoMode)}
                                className={isDemoMode ? 'bg-amber-500 hover:bg-amber-600' : ''}
                            >
                                <Monitor className="mr-2 h-4 w-4" />
                                {isDemoMode ? 'Exit Demo' : 'Demo Mode'}
                            </Button>
                            <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button size="sm">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Run Analysis
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {isDemoMode && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between dark:bg-amber-950/30 dark:border-amber-900">
                        <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                    Demo Mode Active
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    Viewing example data set for demonstration purposes.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDemoMode(false)}
                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        >
                            Switch to Live Data
                        </Button>
                    </div>
                )}
                {/* Metrics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <RevenueAtRiskCard
                        totalRevenue={metrics?.total_revenue_at_risk || 0}
                        opportunities={opportunities}
                    />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Opportunities
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatNumber(metrics?.total_opportunities || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatNumber(
                                            metrics?.high_priority_opportunities || 0
                                        )}{' '}
                                        high priority
                                    </p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Opportunities Overview</DialogTitle>
                                <DialogDescription>
                                    Breakdown of identified revenue opportunities.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {['missing_feature', 'bug_fix', 'automation_gap', 'roadmap_misalignment'].map(cat => {
                                    const count = opportunities.filter(o => o.category === cat).length;
                                    const totalImpact = opportunities.filter(o => o.category === cat).reduce((sum, o) => sum + (o.revenue_impact_arr || 0), 0);
                                    if (count === 0) return null;
                                    return (
                                        <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium capitalize">{cat.replace('_', ' ')}</p>
                                                <p className="text-xs text-muted-foreground">{count} opportunities</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">${totalImpact.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">Revenue Impact</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Avg RPS Score
                                    </CardTitle>
                                    <Sparkles className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {metrics?.avg_rps_score.toFixed(1) || '0.0'}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Revenue Potential Score
                                    </p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>RPS Analysis</DialogTitle>
                                <DialogDescription>
                                    Opportunities with the highest revenue potential.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-3">
                                {[...opportunities].sort((a, b) => b.rps_score - a.rps_score).slice(0, 5).map(opp => (
                                    <div key={opp.id} className="flex items-center justify-between p-2 border-b last:border-0">
                                        <div className="truncate pr-4">
                                            <p className="text-sm font-medium truncate">{opp.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${opp.rps_score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold w-8 text-right">{opp.rps_score.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Issues Analyzed
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatNumber(metrics?.total_issues_analyzed || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatNumber(metrics?.total_clusters || 0)} clusters
                                        identified
                                    </p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Analysis Statistics</DialogTitle>
                                <DialogDescription>
                                    Summary of the data processing and signal detection.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-950/20">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Issues</p>
                                    <p className="text-2xl font-bold">{formatNumber(metrics?.total_issues_analyzed || 0)}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-950/20">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Clusters</p>
                                    <p className="text-2xl font-bold">{metrics?.total_clusters || 0}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-950/20 col-span-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">High Intensity Signals</p>
                                    <p className="text-2xl font-bold text-red-600">{metrics?.high_priority_opportunities || 0}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Requiring immediate executive attention</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* AI Executive Summary */}
                <div className="mb-8">
                    <ExecutiveSummary isDemo={isDemoMode} />
                </div>

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    <OpportunitiesList opportunities={opportunities} limit={5} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {metrics?.last_analysis_date && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Analysis completed
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatRelativeTime(metrics.last_analysis_date)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {formatNumber(metrics?.total_clusters || 0)} clusters
                                            identified
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Recurring patterns detected
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {formatNumber(metrics?.total_opportunities || 0)}{' '}
                                            opportunities generated
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Ranked by Revenue Potential Score
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Impact vs Effort Matrix */}
                {opportunities.length > 0 && (
                    <ImpactEffortMatrix opportunities={opportunities} />
                )}
            </main>
        </div>
    )
}
