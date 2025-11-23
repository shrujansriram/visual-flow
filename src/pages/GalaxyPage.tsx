/**
 * GalaxyPage - Example page showing how to use GalaxyViewer
 * Demonstrates integration with fetchGraphData
 */

import { useState, useEffect } from 'react'
import { GalaxyViewer } from '@/components/3d/GalaxyViewer'
import { fetchGraphData } from '@/services/ai'
import type { GraphData, GraphNode } from '@/types/graph'

export function GalaxyPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState('machine learning')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  /**
   * Load graph data on topic change
   */
  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true)
      setError(null)
      setSelectedNode(null)
      try {
        const data = await fetchGraphData(selectedTopic)
        setGraphData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph')
        setGraphData(null)
      } finally {
        setLoading(false)
      }
    }

    loadGraph()
  }, [selectedTopic])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-deep-space-black">
        <div className="text-center">
          <div className="text-neon-blue text-2xl mb-4 animate-pulse">Loading galaxy...</div>
          <div className="w-12 h-12 border-2 border-neon-blue border-t-neon-purple rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (error || !graphData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-deep-space-black">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">Error loading galaxy</div>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-neon-blue text-deep-space-black rounded-lg font-semibold hover:shadow-glow transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col bg-deep-space-black">
      {/* Galaxy viewer */}
      <div className="flex-1">
        <GalaxyViewer
          data={graphData}
          title={`${selectedTopic.toUpperCase()} Galaxy`}
          subtitle="Explore the knowledge constellation"
          autoRotate={true}
          showControls={true}
          onNodeSelect={setSelectedNode}
        />
      </div>

      {/* Topic selector panel */}
      <div className="absolute top-20 right-6 z-30 w-64">
        <div className="neon-card p-4">
          <h3 className="text-neon-blue font-semibold mb-3">Select Topic</h3>
          <div className="space-y-2">
            {['machine learning', 'web development', 'quantum computing'].map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                  selectedTopic === topic
                    ? 'bg-neon-blue/30 border border-neon-blue text-neon-blue'
                    : 'bg-gray-700/20 border border-gray-600 text-gray-400 hover:border-neon-blue/50'
                }`}
              >
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom topic input */}
          <div className="mt-4 pt-4 border-t border-neon-blue/20">
            <input
              type="text"
              placeholder="Enter custom topic..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setSelectedTopic(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
              className="w-full px-3 py-2 bg-deep-space-black border border-neon-blue/30 rounded-lg text-neon-blue placeholder-gray-600 focus:outline-none focus:border-neon-blue"
            />
          </div>
        </div>
      </div>

      {/* Selected node info panel */}
      {selectedNode && (
        <div className="absolute bottom-6 left-6 z-30 w-80">
          <div className="neon-card p-6">
            <h3 className="text-xl font-bold text-neon-blue mb-2">{selectedNode.name}</h3>
            <p className="text-xs text-neon-purple mb-4">{selectedNode.category.toUpperCase()}</p>

            {selectedNode.description && (
              <p className="text-gray-300 text-sm mb-4">{selectedNode.description}</p>
            )}

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono text-gray-300">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Importance:</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                    style={{ width: `${selectedNode.val}%` }}
                  />
                </div>
              </div>

              {/* Connected nodes count */}
              <div className="flex justify-between pt-2 border-t border-neon-blue/20">
                <span>Connections:</span>
                <span className="text-neon-blue font-semibold">
                  {graphData.links.filter(
                    (link) =>
                      (typeof link.source === 'string'
                        ? link.source
                        : link.source.id) === selectedNode.id ||
                      (typeof link.target === 'string'
                        ? link.target
                        : link.target.id) === selectedNode.id
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats footer */}
      <div className="absolute bottom-6 right-6 z-20 text-xs text-gray-500">
        <p>Nodes: {graphData.nodes.length} • Links: {graphData.links.length}</p>
      </div>
    </div>
  )
}
