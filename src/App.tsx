import { useState, useEffect } from 'react'
import { GalaxyViewer } from '@/components/3d/GalaxyViewer'
import { fetchGraphData } from '@/services/ai'
import type { GraphData } from '@/types/graph'

export default function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInitialGraph = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchGraphData('machine learning')
        setGraphData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load galaxy')
        setGraphData(null)
      } finally {
        setLoading(false)
      }
    }

    loadInitialGraph()
  }, [])

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

  return <GalaxyViewer data={graphData} title="KnowledgeGalaxy" subtitle="Explore the knowledge constellation" autoRotate={true} showControls={true} />
}
