'use client'

import { useQuery } from '@tanstack/react-query'
import { Opportunity } from '@/lib/db/types'

export function useOpportunities(organizationId: string, status?: string) {
    return useQuery<{ opportunities: Opportunity[] }>({
        queryKey: ['opportunities', organizationId, status],
        queryFn: async () => {
            const params = new URLSearchParams({
                organizationId,
                ...(status && { status }),
            })
            const response = await fetch(`/api/analysis/opportunities?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch opportunities')
            }
            return response.json()
        },
    })
}
