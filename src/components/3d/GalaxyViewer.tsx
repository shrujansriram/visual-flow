/**
 * GalaxyViewer - Complete 3D Galaxy Graph Visualization
 * Combines starfield background with interactive graph
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { GalaxyGraph } from './GalaxyGraph'
import { Starfield } from './Starfield'
import type { GraphData, GraphNode } from '@/types/graph'

export interface GalaxyViewerProps {
  data: GraphData
  title?: string
  subtitle?: string
  showControls?: boolean
  autoRotate?: boolean
  onNodeSelect?: (node: GraphNode) => void
}

/**
 * Node detail panel shown when a node is clicked
 */
interface NodeDetail {
  node: GraphNode
  x: number
  y: number
}

/**
 * Main Galaxy Viewer Component
 */
export function GalaxyViewer({
  data,
  title = 'Knowledge Galaxy',
  subtitle,
  showControls = true,
  autoRotate = true,
  onNodeSelect,
}: GalaxyViewerProps) {
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isPaused, setIsPaused] = useState(false)

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      // Get mouse position for panel placement
      const x = window.innerWidth / 2
      const y = window.innerHeight / 2

      setSelectedNode({ node, x, y })
      onNodeSelect?.(node)
    },
    [onNodeSelect]
  )

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2
      return Math.max(0.5, Math.min(3, newZoom))
    })
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-deep-space-black">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield starCount={1500} width={window.innerWidth} height={window.innerHeight} />
      </div>

      {/* Galaxy graph */}
      <div className="absolute inset-0 z-10" style={{ transform: `scale(${zoom})` }}>
        <GalaxyGraph
          data={data}
          onNodeClick={handleNodeClick}
          autoRotate={autoRotate && !isPaused}
          cameraDistance={300}
        />
      </div>

      {/* Header */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-deep-space-black/80 to-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold neon-text">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
        <div className="mt-4 text-sm text-gray-500">
          <p>🖱️ Click nodes to focus • Hover to explore • Scroll to zoom</p>
        </div>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <motion.div
          className="absolute bottom-6 right-6 z-20 flex flex-col gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Zoom controls */}
          <div className="flex gap-2 bg-deep-space-black/50 border border-neon-blue/30 rounded-lg p-2 backdrop-blur">
            <button
              onClick={() => handleZoom('in')}
              className="p-2 hover:bg-neon-blue/20 rounded transition-colors text-neon-blue"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-px bg-neon-blue/30" />
            <button
              onClick={() => handleZoom('out')}
              className="p-2 hover:bg-neon-blue/20 rounded transition-colors text-neon-blue"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <div className="w-px bg-neon-blue/30" />
            <button
              onClick={() => setZoom(1)}
              className="p-2 hover:bg-neon-blue/20 rounded transition-colors text-neon-blue"
              title="Reset Zoom"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Rotation toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/50 rounded-lg text-neon-purple hover:bg-neon-purple/30 transition-colors"
            title={isPaused ? 'Resume rotation' : 'Pause rotation'}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </motion.div>
      )}

      {/* Stats panel */}
      <motion.div
        className="absolute bottom-6 left-6 z-20 bg-deep-space-black/50 border border-neon-blue/30 rounded-lg p-4 backdrop-blur text-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="text-gray-400 space-y-1">
          <p>
            Nodes: <span className="text-neon-blue font-semibold">{data.nodes.length}</span>
          </p>
          <p>
            Connections: <span className="text-neon-blue font-semibold">{data.links.length}</span>
          </p>
          <p className="mt-3 text-xs text-gray-500">Zoom: {(zoom * 100).toFixed(0)}%</p>
        </div>
      </motion.div>

      {/* Node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute z-30 max-w-sm"
            style={{
              left: `${selectedNode.x - 200}px`,
              top: `${selectedNode.y - 100}px`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="neon-card p-6">
              {/* Header with close button */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-neon-blue">{selectedNode.node.name}</h3>
                  <p className="text-xs text-neon-purple mt-1">{selectedNode.node.category}</p>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Description */}
              {selectedNode.node.description && (
                <p className="text-gray-300 text-sm mb-4">{selectedNode.node.description}</p>
              )}

              {/* Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-gray-300 font-mono">{selectedNode.node.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Importance:</span>
                  <span className="text-neon-blue font-semibold">{selectedNode.node.val}/100</span>
                </div>

                {/* Connected nodes */}
                <div className="mt-4 pt-4 border-t border-neon-blue/20">
                  <p className="text-gray-400 mb-2">Connected to:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.links
                      .filter(
                        (link) =>
                          (typeof link.source === 'string'
                            ? link.source
                            : link.source.id) === selectedNode.node.id ||
                          (typeof link.target === 'string'
                            ? link.target
                            : link.target.id) === selectedNode.node.id
                      )
                      .slice(0, 5)
                      .map((link, idx) => {
                        const targetId =
                          typeof link.target === 'string'
                            ? link.target
                            : link.target.id
                        const isTarget =
                          (typeof link.source === 'string'
                            ? link.source
                            : link.source.id) === selectedNode.node.id
                        const connectedId = isTarget ? targetId : link.source
                        const connectedNode = data.nodes.find((n) => n.id === connectedId)

                        return (
                          <div
                            key={idx}
                            className="px-2 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded text-xs text-neon-blue"
                          >
                            {connectedNode?.name || 'Unknown'}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette effect */}
      <div className="absolute inset-0 z-20 pointer-events-none rounded-lg shadow-inner" />
    </div>
  )
}
