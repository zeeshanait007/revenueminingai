'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatting'
import { TrendingUp, TrendingDown, Info, ExternalLink } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Opportunity } from '@/lib/db/types'

interface RevenueAtRiskCardProps {
    totalRevenue: number
    trend?: number // percentage change
    opportunities?: Opportunity[]
}

export function RevenueAtRiskCard({
    totalRevenue,
    trend,
    opportunities = [],
}: RevenueAtRiskCardProps) {
    const isPositiveTrend = trend && trend > 0
    const trendColor = isPositiveTrend ? 'text-red-600' : 'text-green-600'

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 cursor-pointer hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Revenue at Risk
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-red-600"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                            {formatCurrency(totalRevenue)}
                        </div>
                        {trend !== undefined && (
                            <div className={`flex items-center text-xs ${trendColor} mt-2`}>
                                {isPositiveTrend ? (
                                    <TrendingUp className="mr-1 h-4 w-4" />
                                ) : (
                                    <TrendingDown className="mr-1 h-4 w-4" />
                                )}
                                <span>{Math.abs(trend)}% from last month</span>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Total ARR at risk from identified opportunities
                        </p>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Revenue at Risk Breakdown</DialogTitle>
                    <DialogDescription>
                        Detailed breakdown of revenue impact by identified
                        opportunities.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Total ARR at Risk
                            </p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                {formatCurrency(totalRevenue)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Total Opportunities
                            </p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {opportunities.length}
                            </p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="grid grid-cols-4 gap-4 p-3 font-medium border-b bg-muted/50">
                            <div className="col-span-2">Opportunity</div>
                            <div>Impact</div>
                            <div className="text-right">RPS</div>
                        </div>
                        <div className="divide-y max-h-[400px] overflow-auto">
                            {opportunities.length > 0 ? (
                                opportunities.map((opp) => (
                                    <div
                                        key={opp.id}
                                        className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="col-span-2 font-medium truncate">
                                            {opp.title}
                                        </div>
                                        <div className="text-red-600 font-medium">
                                            {formatCurrency(
                                                opp.revenue_impact_arr || 0
                                            )}
                                        </div>
                                        <div className="text-right flex items-center justify-end gap-1">
                                            <span className="font-bold">
                                                {opp.rps_score.toFixed(0)}
                                            </span>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    No opportunities found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
