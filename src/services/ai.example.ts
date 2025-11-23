/**
 * Example usage of the AI service for graph generation
 * This file demonstrates how to use fetchGraphData and handle responses
 */

import {
  fetchGraphData,
  KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
  API_CONFIG,
  parseGraphDataResponse,
} from './ai'

/**
 * Example 1: Basic usage with pre-built templates
 */
export async function example_fetchTemplate() {
  try {
    const graphData = await fetchGraphData('machine learning')
    console.log('Graph loaded successfully')
    console.log(`Nodes: ${graphData.nodes.length}`)
    console.log(`Links: ${graphData.links.length}`)
    return graphData
  } catch (error) {
    console.error('Failed to fetch graph:', error)
    throw error
  }
}

/**
 * Example 2: Fetch data for topic without template (generates generic)
 */
export async function example_fetchGeneric() {
  try {
    const graphData = await fetchGraphData('blockchain technology')
    console.log('Generic graph generated for unknown topic')
    console.log(`Nodes: ${graphData.nodes.length}`)
    return graphData
  } catch (error) {
    console.error('Failed to generate graph:', error)
    throw error
  }
}

/**
 * Example 3: React hook integration
 * Shows how to use fetchGraphData in a React component
 */
export function example_reactHook() {
  // This is pseudo-code showing the pattern
  /*
  import { useState, useEffect } from 'react'
  import { fetchGraphData } from '@/services/ai'
  import type { GraphData } from '@/types/graph'

  export function GraphViewer({ topic }: { topic: string }) {
    const [graphData, setGraphData] = useState<GraphData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      const loadGraph = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchGraphData(topic)
          setGraphData(data)
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
          setLoading(false)
        }
      }

      loadGraph()
    }, [topic])

    if (loading) return <div>Loading graph...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!graphData) return <div>No data</div>

    return <GraphCanvas data={graphData} />
  }
  */
}

/**
 * Example 4: Integration with Claude API (when ready)
 * Shows how to connect the real API
 */
export async function example_claudeAPI(topic: string) {
  // This example shows the pattern for real Claude integration

  const requestBody = {
    model: API_CONFIG.model,
    max_tokens: API_CONFIG.maxTokens,
    temperature: API_CONFIG.temperature,
    system: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user' as const,
        content: `Generate a comprehensive knowledge graph for: "${topic}". Include the central topic, primary concepts, and detailed sub-concepts with all relationships.`,
      },
    ],
  }

  console.log('API Config:', {
    model: API_CONFIG.model,
    maxTokens: API_CONFIG.maxTokens,
    endpoint: API_CONFIG.endpoint,
  })

  console.log('Request body structure:', JSON.stringify({
    model: requestBody.model,
    max_tokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    message_count: requestBody.messages.length,
  }))

  console.log('System Prompt (first 200 chars):', KNOWLEDGE_GRAPH_SYSTEM_PROMPT.substring(0, 200))

  // In real implementation:
  /*
  try {
    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const apiResponse = await response.json()
    const jsonText = apiResponse.content[0].text

    // Parse and validate the response
    const graphData = parseGraphDataResponse(jsonText)

    console.log('Successfully generated graph from Claude')
    console.log(`Nodes: ${graphData.nodes.length}, Links: ${graphData.links.length}`)

    return graphData
  } catch (error) {
    console.error('Claude API Error:', error)
    throw error
  }
  */
}

/**
 * Example 5: Chaining with graph hook
 */
export async function example_withHook() {
  /*
  import { useGraphData } from '@/hooks/useGraphData'

  export function GraphExplorer() {
    const { graphData, filteredData, filterGraph, updateGraphData } = useGraphData()

    const handleTopicSelect = async (topic: string) => {
      const newData = await fetchGraphData(topic)
      updateGraphData(newData)
    }

    const handleFilter = (categories: string[]) => {
      filterGraph({ categories: categories as any })
    }

    return (
      <div>
        <input
          type="text"
          placeholder="Enter topic..."
          onInput={(e) => handleTopicSelect(e.currentTarget.value)}
        />
        <GraphCanvas data={filteredData} />
      </div>
    )
  }
  */
}

/**
 * Example 6: Error handling patterns
 */
export async function example_errorHandling() {
  try {
    const graphData = await fetchGraphData('machine learning')
    console.log('Success:', graphData.nodes.length, 'nodes')
  } catch (error) {
    if (error instanceof Error) {
      // Validation errors
      if (error.message.includes('Invalid')) {
        console.error('Data validation failed:', error.message)
        // Fallback to generic data or user message
      }

      // API errors
      if (error.message.includes('API')) {
        console.error('API failed:', error.message)
        // Retry logic or fallback
      }

      // JSON parse errors
      if (error.message.includes('JSON')) {
        console.error('Response was not valid JSON:', error.message)
        // Check system prompt
      }
    }

    throw error
  }
}

/**
 * Example 7: Testing different topics
 */
export async function example_testMultipleTopics() {
  const topics = ['machine learning', 'web development', 'quantum computing', 'unknown topic']

  for (const topic of topics) {
    try {
      const graphData = await fetchGraphData(topic)
      console.log(`✓ ${topic}: ${graphData.nodes.length} nodes, ${graphData.links.length} links`)
    } catch (error) {
      console.error(`✗ ${topic}:`, error instanceof Error ? error.message : error)
    }
  }
}

/**
 * Example 8: Analyzing graph structure
 */
export async function example_analyzeGraph() {
  const graphData = await fetchGraphData('machine learning')

  // Analyze nodes
  const nodesByCategory = new Map<string, number>()
  for (const node of graphData.nodes) {
    nodesByCategory.set(node.category, (nodesByCategory.get(node.category) || 0) + 1)
  }

  console.log('Nodes by category:')
  for (const [category, count] of nodesByCategory) {
    console.log(`  ${category}: ${count}`)
  }

  // Analyze link distribution
  const nodeIds = new Set(graphData.nodes.map((n) => n.id))
  let validLinks = 0

  for (const link of graphData.links) {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
      validLinks++
    }
  }

  console.log(`Valid links: ${validLinks}/${graphData.links.length}`)

  // Find most important nodes
  const sorted = [...graphData.nodes].sort((a, b) => b.val - a.val)
  console.log('Top 5 nodes by importance:')
  sorted.slice(0, 5).forEach((node) => {
    console.log(`  ${node.name}: ${node.val}`)
  })
}

/**
 * Example 9: System prompt inspection
 */
export function example_systemPrompt() {
  console.log('=== System Prompt ===')
  console.log(KNOWLEDGE_GRAPH_SYSTEM_PROMPT)
  console.log('=== End System Prompt ===')

  // Show configuration
  console.log('\n=== API Configuration ===')
  console.log(JSON.stringify(API_CONFIG, null, 2))
}

/**
 * Example 10: Validation testing
 */
export async function example_testValidation() {
  try {
    // This should succeed
    await fetchGraphData('machine learning')
    console.log('✓ Valid data passed validation')

    // Try to manually create invalid data and parse
    const invalidJSON = '{"nodes": []}'
    try {
      parseGraphDataResponse(invalidJSON)
      console.log('✗ Should have failed validation')
    } catch (error) {
      console.log('✓ Invalid data correctly rejected:', error instanceof Error ? error.message : error)
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Uncomment to run examples:
// example_fetchTemplate()
// example_testMultipleTopics()
// example_analyzeGraph()
// example_systemPrompt()
// example_testValidation()
