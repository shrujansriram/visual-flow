/**
 * GalaxyGraph - Stunning 3D Knowledge Graph Visualization
 * Uses react-force-graph-3d with custom Three.js rendering for a galaxy-like appearance
 */

import { useEffect, useRef, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import type { GraphData, GraphNode } from '@/types/graph'

export interface GalaxyGraphProps {
  data: GraphData
  onNodeClick?: (node: GraphNode) => void
  autoRotate?: boolean
  cameraDistance?: number
}

interface NodeObject extends GraphNode {
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
  fx?: number
  fy?: number
  fz?: number
}

/**
 * Creates a glowing sphere for primary nodes
 */
function createGlowingSphere(node: NodeObject, color: string): THREE.Mesh {
  // Create group for glow effect
  const group = new THREE.Group() as any

  // Main sphere
  const geometry = new THREE.IcosahedronGeometry(node.val / 5, 32)
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.2,
    metalness: 0.3,
    roughness: 0.4,
  })
  const mesh = new THREE.Mesh(geometry, material)
  group.add(mesh)

  // Glow layer (larger, semi-transparent)
  const glowGeometry = new THREE.IcosahedronGeometry(node.val / 4.5, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
  })
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  group.add(glowMesh)

  // Store original material for hover effects
  group.userData = {
    originalMaterial: material,
    originalGlowMaterial: glowMaterial,
    originalEmissiveIntensity: 1.2,
  }

  return group as THREE.Mesh
}

/**
 * Creates a small star for leaf nodes
 */
function createStar(node: NodeObject, color: string): THREE.Mesh {
  const geometry = new THREE.OctahedronGeometry(node.val / 8, 2)
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1,
    metalness: 0.5,
    roughness: 0.5,
  })
  const mesh = new THREE.Mesh(geometry, material)

  // Store userData for hover effects
  mesh.userData = {
    originalMaterial: material,
    originalEmissiveIntensity: 1,
  }

  return mesh
}

/**
 * Get color based on node category
 */
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    topic: '#00f3ff', // neon-blue
    concept: '#bc13fe', // neon-purple
    skill: '#00ff88', // neon-green
    person: '#ff006e', // neon-pink
    resource: '#ffbe0b', // neon-yellow
    project: '#8338ec', // neon-violet
    other: '#00d9ff', // cyan
  }
  return colorMap[category] || '#00f3ff'
}

/**
 * Main Galaxy Graph Component
 */
export function GalaxyGraph({
  data,
  onNodeClick,
  autoRotate = true,
  cameraDistance = 300,
}: GalaxyGraphProps) {
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const rotationRef = useRef({ x: 0, y: 0 })

  /**
   * Create custom Three.js objects for nodes
   */
  const nodeThreeObject = (node: NodeObject) => {
    const color = getCategoryColor(node.category)
    const isPrimary = node.val >= 70

    const mesh = isPrimary ? createGlowingSphere(node, color) : createStar(node, color)

    return mesh
  }

  /**
   * Handle node hover - highlight connected nodes
   */
  const handleNodeHover = (node: NodeObject | null) => {
    if (!graphRef.current) return

    setHoveredNodeId(node?.id || null)

    if (!node) {
      // Reset all nodes and links
      graphRef.current.scene().traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.userData.originalMaterial) {
            obj.material = obj.userData.originalMaterial
            obj.material.emissiveIntensity = obj.userData.originalEmissiveIntensity || 0.5
          }
          obj.visible = true
        }
      })
      return
    }

    // Get connected nodes
    const connectedNodeIds = new Set<string>()
    connectedNodeIds.add(node.id)

    data.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id

      if (sourceId === node.id) connectedNodeIds.add(targetId)
      if (targetId === node.id) connectedNodeIds.add(sourceId)
    })

    // Highlight connected nodes, dim others
    graphRef.current.scene().traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh && obj.userData.nodeId !== undefined) {
        const isConnected = connectedNodeIds.has(obj.userData.nodeId)

        if (obj.userData.originalMaterial) {
          if (isConnected) {
            obj.material.emissiveIntensity = (obj.userData.originalEmissiveIntensity || 0.5) * 2
          } else {
            obj.material.emissiveIntensity = (obj.userData.originalEmissiveIntensity || 0.5) * 0.3
          }
        }
        obj.visible = true
      }
    })
  }

  /**
   * Handle node click - fly camera to node
   */
  const handleNodeClick = (node: NodeObject) => {
    const distance = cameraDistance / (node.val / 50)
    const duration = 1000

    if (graphRef.current) {
      const nodeX = node.x ?? 0
      const nodeY = node.y ?? 0
      const nodeZ = node.z ?? 0
      graphRef.current.cameraPosition(
        { x: nodeX, y: nodeY, z: nodeZ },
        { x: nodeX, y: nodeY, z: nodeZ + distance },
        duration
      )
    }

    onNodeClick?.(node)
  }

  /**
   * Setup auto-rotation animation
   */
  useEffect(() => {
    if (!autoRotate || !containerRef.current) return

    let animationId: number

    const animate = () => {
      if (graphRef.current?.scene()) {
        rotationRef.current.y += 0.0003
        graphRef.current.scene().rotation.y = rotationRef.current.y
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [autoRotate])

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        graphRef.current.width(width)
        graphRef.current.height(height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-deep-space-black relative"
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,20,40,0.9) 0%, rgba(0,5,15,1) 100%)' }}
    >
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        // Node rendering
        nodeThreeObject={nodeThreeObject}
        nodeVal={(node) => (node.val ? node.val / 2 : 5)}
        nodeColor={() => '#00f3ff'}
        nodeOpacity={1}
        // Link styling
        linkWidth={0.5}
        linkOpacity={0.5}
        linkColor={() => '#ffffff'}
        // Physics
        cooldownTicks={100}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
        // Interaction
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        // Rendering
        backgroundColor="#000000"
        // Optimization
        enableNodeDrag={true}
        enableNavigationControls={true}
      />

      {/* Hover tooltip */}
      {hoveredNodeId && (
        <div className="absolute top-4 left-4 bg-deep-space-black/80 border border-neon-blue px-3 py-2 rounded text-neon-blue text-sm pointer-events-none">
          {data.nodes.find((n) => n.id === hoveredNodeId)?.name}
        </div>
      )}
    </div>
  )
}
