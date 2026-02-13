'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Opportunity } from '@/lib/db/types'
import { formatCurrency, formatNumber } from '@/lib/utils/formatting'
import { ArrowRight, TrendingUp, Eye, Target, Users, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import {
    Dialog,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OpportunityDetailModal } from '@/components/dashboard/opportunity-detail-modal'

interface OpportunitiesListProps {
    opportunities: Opportunity[]
    limit?: number
}

export function OpportunitiesList({
    opportunities,
    limit = 5,
}: OpportunitiesListProps) {
    const topOpportunities = opportunities.slice(0, limit)

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'missing_feature':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'automation_gap':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            case 'bug_fix':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'roadmap_misalignment':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        }
    }

    const getRPSColor = (score: number) => {
        if (score >= 80) return 'text-red-600 dark:text-red-400'
        if (score >= 60) return 'text-orange-600 dark:text-orange-400'
        if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-green-600 dark:text-green-400'
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Opportunities</CardTitle>
                <Link
                    href="/opportunities"
                    className="text-sm text-primary hover:underline flex items-center"
                >
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topOpportunities.map((opp, index) => (
                        <div
                            key={opp.id}
                            className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 group"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold text-muted-foreground">
                                        #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {opp.title}
                                        </span>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </DialogTrigger>
                                            <OpportunityDetailModal
                                                opportunity={opp}
                                            />
                                        </Dialog>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(opp.category || 'other')}`}
                                    >
                                        {opp.category?.replace('_', ' ')}
                                    </span>
                                    {opp.affected_customers.length > 0 && (
                                        <span className="text-muted-foreground">
                                            {opp.affected_customers.length} customer
                                            {opp.affected_customers.length > 1
                                                ? 's'
                                                : ''}{' '}
                                            affected
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>
                                        Impact:{' '}
                                        {formatCurrency(
                                            opp.revenue_impact_arr || 0
                                        )}
                                    </span>
                                    <span>
                                        Effort:{' '}
                                        {formatNumber(opp.effort_hours || 0)}h
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <span
                                        className={`text-2xl font-bold ${getRPSColor(opp.rps_score)}`}
                                    >
                                        {opp.rps_score.toFixed(0)}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    RPS Score
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
