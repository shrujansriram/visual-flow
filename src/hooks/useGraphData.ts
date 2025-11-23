import { useState, useCallback } from 'react'
import type { GraphData, GraphFilterOptions } from '../types/graph'

/**
 * Hook for managing knowledge graph data and filtering
 */
export function useGraphData(initialData?: GraphData) {
  const [graphData, setGraphData] = useState<GraphData>(
    initialData || { nodes: [], links: [] }
  )
  const [filteredData, setFilteredData] = useState<GraphData>(graphData)

  const updateGraphData = useCallback((data: GraphData) => {
    setGraphData(data)
    setFilteredData(data)
  }, [])

  const filterGraph = useCallback(
    (options: GraphFilterOptions) => {
      let filtered = { ...graphData }

      // Filter by categories
      if (options.categories && options.categories.length > 0) {
        filtered.nodes = filtered.nodes.filter((node) =>
          options.categories?.includes(node.category as any)
        )
      }

      // Filter by value range
      if (options.minValue !== undefined) {
        filtered.nodes = filtered.nodes.filter((node) => node.val >= options.minValue!)
      }
      if (options.maxValue !== undefined) {
        filtered.nodes = filtered.nodes.filter((node) => node.val <= options.maxValue!)
      }

      // Filter by search query
      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase()
        filtered.nodes = filtered.nodes.filter(
          (node) =>
            node.name.toLowerCase().includes(query) ||
            node.description?.toLowerCase().includes(query)
        )
      }

      // Update links to only include connections between filtered nodes
      const nodeIds = new Set(filtered.nodes.map((n) => n.id))
      filtered.links = filtered.links.filter((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        const targetId = typeof link.target === 'string' ? link.target : link.target.id
        return nodeIds.has(sourceId) && nodeIds.has(targetId)
      })

      setFilteredData(filtered)
    },
    [graphData]
  )

  const addNode = useCallback(
    (node: any) => {
      const updated = {
        ...graphData,
        nodes: [...graphData.nodes, node],
      }
      updateGraphData(updated)
    },
    [graphData, updateGraphData]
  )

  const addLink = useCallback(
    (link: any) => {
      const updated = {
        ...graphData,
        links: [...graphData.links, link],
      }
      updateGraphData(updated)
    },
    [graphData, updateGraphData]
  )

  return {
    graphData,
    filteredData,
    updateGraphData,
    filterGraph,
    addNode,
    addLink,
  }
}
