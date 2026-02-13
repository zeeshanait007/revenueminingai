'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Opportunity } from '@/lib/db/types'
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { OpportunityDetailModal } from '@/components/dashboard/opportunity-detail-modal'

interface ImpactEffortMatrixProps {
    opportunities: Opportunity[]
}

export function ImpactEffortMatrix({ opportunities }: ImpactEffortMatrixProps) {
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

    const data = opportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        impact: opp.revenue_impact_arr || 0,
        effort: opp.effort_hours || 0,
        rps: opp.rps_score,
        original: opp,
    }))

    const getQuadrantColor = (impact: number, effort: number) => {
        if (data.length === 0) return '#3b82f6'
        const avgImpact =
            data.reduce((sum, d) => sum + d.impact, 0) / data.length
        const avgEffort =
            data.reduce((sum, d) => sum + d.effort, 0) / data.length

        if (impact >= avgImpact && effort <= avgEffort) {
            return '#22c55e' // High impact, low effort - green (quick wins)
        } else if (impact >= avgImpact && effort > avgEffort) {
            return '#3b82f6' // High impact, high effort - blue (major projects)
        } else if (impact < avgImpact && effort <= avgEffort) {
            return '#eab308' // Low impact, low effort - yellow (fill-ins)
        } else {
            return '#ef4444' // Low impact, high effort - red (avoid)
        }
    }

    const handlePointClick = (point: any) => {
        if (point && point.original) {
            setSelectedOpp(point.original)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Impact vs Effort Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="effort"
                            name="Effort (hours)"
                            label={{
                                value: 'Effort (hours)',
                                position: 'insideBottom',
                                offset: -10,
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="impact"
                            name="Revenue Impact"
                            label={{
                                value: 'Revenue Impact ($)',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                            <p className="font-semibold">
                                                {data.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Impact: $
                                                {data.impact.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Effort: {data.effort}h
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                RPS: {data.rps.toFixed(0)}
                                            </p>
                                            <p className="text-[10px] text-primary mt-1 font-bold">
                                                CLICK TO VIEW DETAILS
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Scatter
                            data={data}
                            onClick={handlePointClick}
                            className="cursor-pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getQuadrantColor(
                                        entry.impact,
                                        entry.effort
                                    )}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                <Dialog
                    open={!!selectedOpp}
                    onOpenChange={(open) => !open && setSelectedOpp(null)}
                >
                    {selectedOpp && (
                        <OpportunityDetailModal opportunity={selectedOpp} />
                    )}
                </Dialog>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Quick Wins (High Impact, Low Effort)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Major Projects (High Impact, High Effort)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Fill-ins (Low Impact, Low Effort)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Avoid (Low Impact, High Effort)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
