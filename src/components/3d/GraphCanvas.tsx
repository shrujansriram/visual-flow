import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export interface GraphCanvasProps {
  isLoading?: boolean
  children?: React.ReactNode
}

/**
 * 3D Canvas component for knowledge graph visualization
 * Renders the Three.js scene with physics-based graph layout
 */
export function GraphCanvas({ isLoading = false, children }: GraphCanvasProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-deep-space-black">
        <div className="text-center">
          <div className="animate-pulse-glow text-neon-blue text-2xl mb-4">Loading Graph...</div>
          <div className="w-12 h-12 border-2 border-neon-blue border-t-neon-purple rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <Canvas
      camera={{
        position: [0, 0, 100],
        fov: 75,
        far: 10000,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[100, 100, 100]} intensity={1.5} />
      <pointLight position={[-100, -100, 100]} intensity={1} color="#00f3ff" />

      {/* Controls */}
      <OrbitControls
        autoRotate={false}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        rotateSpeed={0.5}
        zoomSpeed={1}
        panSpeed={1}
      />

      {/* Effects */}
      <Suspense fallback={null}>
        {/* Post-processing effects will be added here */}
      </Suspense>

      {/* Children components (nodes, links, etc.) */}
      {children}
    </Canvas>
  )
}
