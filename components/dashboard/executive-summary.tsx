import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

interface ExecutiveSummaryProps {
    summary?: string
    isDemo?: boolean
}

export function ExecutiveSummary({ summary, isDemo }: ExecutiveSummaryProps) {
    const demoSummary = `Based on current analysis, there is a significant $1.25M Revenue at Risk. The primary driver is a cluster of missing Enterprise SSO features affecting high-tier prospects. Recommended pivot: Accelerate Q3 Security roadmap into Q2 to unblock over $450k in immediate ARR.`

    const displaySummary = summary || (isDemo ? demoSummary : null)

    if (!displaySummary) return null

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900 border-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    AI Strategic Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {displaySummary}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-semibold">Priority: High</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-semibold">Churn Risk: Moderate</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
                            <Lightbulb className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-semibold">Action: Immediate</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
