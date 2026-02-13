import OpenAI from 'openai'
import { Issue } from '@/lib/db/types'
import { supabaseAdmin } from '@/lib/db/client'

// Initialize OpenAI client lazily to avoid build-time errors when API key is missing
let openaiInstance: OpenAI | null = null

function getOpenAIClient(): OpenAI {
    if (!openaiInstance) {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is missing')
        }
        openaiInstance = new OpenAI({ apiKey })
    }
    return openaiInstance
}

interface ClusterResult {
    clusterId: string
    name: string
    description: string
    theme: string
    issueIds: string[]
    issueCount: number
}

/**
 * Generate embedding for issue text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const openai = getOpenAIClient()
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    })

    return response.data[0].embedding
}

/**
 * Create text representation of issue for embedding
 */
function issueToText(issue: Issue): string {
    const parts = [
        issue.title,
        issue.description || '',
        issue.labels.join(' '),
        issue.type || '',
    ]
    return parts.filter(Boolean).join(' ')
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * DBSCAN clustering algorithm
 */
function dbscan(
    embeddings: { issueId: string; embedding: number[] }[],
    eps: number = 0.3,
    minPoints: number = 3
): Map<number, string[]> {
    const clusters = new Map<number, string[]>()
    const visited = new Set<string>()
    const noise = new Set<string>()
    let clusterId = 0

    function regionQuery(issueId: string, embedding: number[]): string[] {
        const neighbors: string[] = []
        for (const item of embeddings) {
            const similarity = cosineSimilarity(embedding, item.embedding)
            if (1 - similarity <= eps) {
                // Convert similarity to distance
                neighbors.push(item.issueId)
            }
        }
        return neighbors
    }

    function expandCluster(
        issueId: string,
        neighbors: string[],
        clusterId: number
    ): void {
        if (!clusters.has(clusterId)) {
            clusters.set(clusterId, [])
        }
        clusters.get(clusterId)!.push(issueId)

        let i = 0
        while (i < neighbors.length) {
            const neighborId = neighbors[i]

            if (!visited.has(neighborId)) {
                visited.add(neighborId)
                const neighborEmbedding = embeddings.find(
                    (e) => e.issueId === neighborId
                )!.embedding
                const neighborNeighbors = regionQuery(neighborId, neighborEmbedding)

                if (neighborNeighbors.length >= minPoints) {
                    neighbors.push(
                        ...neighborNeighbors.filter((n) => !neighbors.includes(n))
                    )
                }
            }

            if (!Array.from(clusters.values()).some((c) => c.includes(neighborId))) {
                clusters.get(clusterId)!.push(neighborId)
            }

            i++
        }
    }

    for (const item of embeddings) {
        if (visited.has(item.issueId)) continue

        visited.add(item.issueId)
        const neighbors = regionQuery(item.issueId, item.embedding)

        if (neighbors.length < minPoints) {
            noise.add(item.issueId)
        } else {
            expandCluster(item.issueId, neighbors, clusterId)
            clusterId++
        }
    }

    return clusters
}

/**
 * Generate cluster summary using GPT-4
 */
async function generateClusterSummary(
    issues: Issue[]
): Promise<{ name: string; description: string; theme: string }> {
    const issueTexts = issues
        .slice(0, 10)
        .map((issue, i) => `${i + 1}. ${issue.title}\n${issue.description || ''}`)
        .join('\n\n')

    const prompt = `Analyze these related issues and provide:
1. A concise cluster name (max 5 words)
2. A brief description (1-2 sentences)
3. The recurring theme/pattern

Issues:
${issueTexts}

Respond in JSON format:
{
  "name": "...",
  "description": "...",
  "theme": "..."
}`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content:
                    'You are an expert at analyzing product issues and identifying patterns.',
            },
            { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
        name: result.name || 'Unnamed Cluster',
        description: result.description || '',
        theme: result.theme || '',
    }
}

/**
 * Main clustering function
 */
export async function clusterIssues(
    organizationId: string,
    issueIds?: string[]
): Promise<ClusterResult[]> {
    // Fetch issues
    let query = supabaseAdmin
        .from('issues')
        .select('*')
        .eq('organization_id', organizationId)

    if (issueIds && issueIds.length > 0) {
        query = query.in('id', issueIds)
    }

    const { data: issues, error } = await query

    if (error || !issues) {
        throw new Error(`Failed to fetch issues: ${error?.message}`)
    }

    if (issues.length === 0) {
        return []
    }

    // Generate embeddings for issues that don't have them
    const embeddings: { issueId: string; embedding: number[] }[] = []

    for (const issue of issues) {
        // Check if embedding exists
        const { data: existingEmbedding } = await supabaseAdmin
            .from('issue_embeddings')
            .select('embedding')
            .eq('issue_id', issue.id)
            .single()

        let embedding: number[]

        if (existingEmbedding) {
            embedding = existingEmbedding.embedding
        } else {
            // Generate new embedding
            const text = issueToText(issue as Issue)
            embedding = await generateEmbedding(text)

            // Store embedding
            await supabaseAdmin.from('issue_embeddings').insert({
                issue_id: issue.id,
                embedding,
            })
        }

        embeddings.push({ issueId: issue.id, embedding })
    }

    // Perform clustering
    const clusterMap = dbscan(embeddings)

    // Create cluster results
    const clusterResults: ClusterResult[] = []

    for (const [clusterIdx, issueIds] of clusterMap.entries()) {
        const clusterIssues = issues.filter((i: any) => issueIds.includes(i.id))

        // Generate cluster summary
        const summary = await generateClusterSummary(clusterIssues as Issue[])

        // Calculate total time spent (estimate from issue count and metadata)
        const totalTimeSpent = clusterIssues.reduce((sum: number, issue: any) => {
            const timeEstimate = (issue.metadata as any)?.timeEstimateHours || 2
            return sum + timeEstimate
        }, 0)

        // Insert cluster into database
        const { data: cluster, error: clusterError } = await supabaseAdmin
            .from('clusters')
            .insert({
                organization_id: organizationId,
                name: summary.name,
                description: summary.description,
                theme: summary.theme,
                issue_count: issueIds.length,
                total_time_spent_hours: totalTimeSpent,
            })
            .select()
            .single()

        if (clusterError || !cluster) {
            console.error('Failed to create cluster:', clusterError)
            continue
        }

        // Insert cluster members
        const members = issueIds.map((issueId) => {
            const issueEmbedding = embeddings.find((e) => e.issueId === issueId)!
            const clusterCentroid = calculateCentroid(
                embeddings.filter((e) => issueIds.includes(e.issueId))
            )
            const similarity = cosineSimilarity(
                issueEmbedding.embedding,
                clusterCentroid
            )

            return {
                cluster_id: cluster.id,
                issue_id: issueId,
                similarity_score: similarity,
            }
        })

        await supabaseAdmin.from('cluster_members').insert(members)

        clusterResults.push({
            clusterId: cluster.id,
            name: summary.name,
            description: summary.description,
            theme: summary.theme,
            issueIds,
            issueCount: issueIds.length,
        })
    }

    return clusterResults
}

/**
 * Calculate centroid of embeddings
 */
function calculateCentroid(
    embeddings: { issueId: string; embedding: number[] }[]
): number[] {
    const dimension = embeddings[0].embedding.length
    const centroid = new Array(dimension).fill(0)

    for (const item of embeddings) {
        for (let i = 0; i < dimension; i++) {
            centroid[i] += item.embedding[i]
        }
    }

    for (let i = 0; i < dimension; i++) {
        centroid[i] /= embeddings.length
    }

    return centroid
}
