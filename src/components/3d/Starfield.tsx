/**
 * Starfield - Animated background for the galaxy visualization
 * Creates a beautiful star-filled space background
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface StarfieldProps {
  starCount?: number
  depth?: number
  width?: number
  height?: number
}

/**
 * Starfield Component
 * Renders an animated starfield using Three.js
 */
export function Starfield({
  starCount = 1000,
  depth = 100,
  width = 800,
  height = 600,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const starsRef = useRef<THREE.Points | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 0

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer

    // Create stars
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)

    // Star color palette
    const starColors = [
      { r: 1.0, g: 1.0, b: 1.0 }, // White
      { r: 0.8, g: 0.9, b: 1.0 }, // Blue-white
      { r: 1.0, g: 0.8, b: 0.6 }, // Yellow-orange
      { r: 0.0, g: 0.95, b: 1.0 }, // Cyan
      { r: 0.8, g: 0.2, b: 0.9 }, // Purple
    ]

    for (let i = 0; i < starCount * 3; i += 3) {
      // Position
      positions[i] = (Math.random() - 0.5) * width
      positions[i + 1] = (Math.random() - 0.5) * height
      positions[i + 2] = Math.random() * depth - depth / 2

      // Color
      const colorIndex = Math.floor(Math.random() * starColors.length)
      const color = starColors[colorIndex]
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b

      // Size
      sizes[i / 3] = Math.random() * 2 + 0.5
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Material
    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(geometry, material)
    starsRef.current = stars
    scene.add(stars)

    // Animation loop
    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.0001

      if (starsRef.current) {
        // Slight rotation
        starsRef.current.rotation.x += 0.00001
        starsRef.current.rotation.y += 0.00005

        // Twinkling effect
        const sizes = geometry.attributes.size.array as Float32Array

        for (let i = 0; i < starCount; i++) {
          // Make stars twinkle
          const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7
          sizes[i] = (Math.random() * 2 + 0.5) * twinkle
        }
        geometry.attributes.size.needsUpdate = true
      }

      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    // Handle window resize
    const handleResize = () => {
      const width = canvasRef.current?.clientWidth || 800
      const height = canvasRef.current?.clientHeight || 600
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [starCount, depth, width, height])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  )
}
