'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardMetrics } from '@/lib/db/types'

export function useDashboardMetrics(organizationId: string) {
    return useQuery<{ metrics: DashboardMetrics }>({
        queryKey: ['dashboard-metrics', organizationId],
        queryFn: async () => {
            const response = await fetch(
                `/api/dashboard/metrics?organizationId=${organizationId}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard metrics')
            }
            return response.json()
        },
        refetchInterval: 60000, // Refetch every minute
    })
}
