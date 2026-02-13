'use client'

import { Opportunity } from '@/lib/db/types'
import { formatCurrency, formatNumber } from '@/lib/utils/formatting'
import { ArrowRight, Target, Users, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface OpportunityDetailModalProps {
    opportunity: Opportunity
}

export function OpportunityDetailModal({
    opportunity,
}: OpportunityDetailModalProps) {
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

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(opportunity.category || 'other')}`}
                    >
                        {opportunity.category?.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-red-600">
                        RPS: {opportunity.rps_score.toFixed(0)}
                    </span>
                </div>
                <DialogTitle className="text-2xl">
                    {opportunity.title}
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                    {opportunity.description}
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            Revenue Impact
                        </h4>
                        <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(opportunity.revenue_impact_arr || 0)}{' '}
                            ARR
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            Affected Customers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {opportunity.affected_customers.map((cust, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-muted rounded text-xs"
                                >
                                    {cust}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-amber-600" />
                            Recommended Actions
                        </h4>
                        <ul className="space-y-2">
                            {opportunity.recommended_actions.map(
                                (action, i) => (
                                    <li
                                        key={i}
                                        className="text-sm flex items-start gap-2"
                                    >
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {action}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Estimated Effort
                        </h4>
                        <p className="text-sm font-medium">
                            {opportunity.effort_hours} Engineering Hours
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Link
                    href={`/opportunities/${opportunity.id}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Full Analysis Page
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </div>
        </DialogContent>
    )
}
