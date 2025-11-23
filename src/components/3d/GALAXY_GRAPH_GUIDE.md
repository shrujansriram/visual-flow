# Galaxy Graph - 3D Knowledge Visualization Guide

## Overview

The Galaxy Graph is a stunning 3D visualization component that transforms knowledge graphs into an interactive, animated galaxy. It combines ForceGraph3D physics simulation with custom Three.js rendering for a truly spectacular "WOW factor".

## Components

### 1. GalaxyGraph

The core visualization engine using react-force-graph-3d.

**Features:**
- Custom Three.js node rendering (glowing spheres for primary nodes, stars for leaf nodes)
- Faint, semi-transparent constellation-like links
- Interactive node hover with connection highlighting
- Click-to-focus camera animation
- Automatic graph rotation for a living galaxy feel
- Physics simulation with quick stabilization

**Props:**
```typescript
interface GalaxyGraphProps {
  data: GraphData                    // Graph data with nodes and links
  onNodeClick?: (node: GraphNode) => void  // Callback on node selection
  autoRotate?: boolean               // Enable auto-rotation (default: true)
  cameraDistance?: number            // Initial camera distance (default: 300)
}
```

**Usage:**
```typescript
import { GalaxyGraph } from '@/components/3d/GalaxyGraph'

<GalaxyGraph
  data={graphData}
  onNodeClick={(node) => console.log(node)}
  autoRotate={true}
  cameraDistance={300}
/>
```

### 2. Starfield

An animated background component that creates a beautiful star-filled space environment.

**Features:**
- 1500 procedurally generated stars
- Realistic star colors (white, blue-white, yellow-orange, cyan, purple)
- Twinkling animation for lifelike effect
- Slight rotation for depth perception
- Responsive to window resize

**Props:**
```typescript
interface StarfieldProps {
  starCount?: number     // Number of stars (default: 1000)
  depth?: number         // Depth of starfield (default: 100)
  width?: number         // Canvas width (default: 800)
  height?: number        // Canvas height (default: 600)
}
```

**Usage:**
```typescript
import { Starfield } from '@/components/3d/Starfield'

<Starfield starCount={1500} width={window.innerWidth} height={window.innerHeight} />
```

### 3. GalaxyViewer

A complete, production-ready viewer that combines everything together.

**Features:**
- Integrated starfield background
- Galaxy graph with physics simulation
- Interactive controls (zoom, pause/resume rotation)
- Node detail panel on click
- Statistics display (node count, connection count)
- Responsive design with Framer Motion animations
- Header with instructions
- Keyboard shortcuts

**Props:**
```typescript
interface GalaxyViewerProps {
  data: GraphData                      // Graph data
  title?: string                       // Viewer title
  subtitle?: string                    // Subtitle text
  showControls?: boolean               // Show control buttons (default: true)
  autoRotate?: boolean                 // Auto-rotate galaxy (default: true)
  onNodeSelect?: (node: GraphNode) => void  // Node selection callback
}
```

**Usage:**
```typescript
import { GalaxyViewer } from '@/components/3d/GalaxyViewer'

<GalaxyViewer
  data={graphData}
  title="Knowledge Galaxy"
  subtitle="Explore the connections"
  onNodeSelect={(node) => console.log(node)}
/>
```

## Visual Design

### Node Styling

**Primary Nodes (val ≥ 70):**
- Glowing icosahedron mesh
- Emissive neon color matching category
- Glow layer for enhanced depth
- Custom color per category

**Leaf Nodes (val < 70):**
- Smaller octahedron geometry
- Same color scheme as primary
- Efficient rendering

**Category Color Map:**
```
topic:    #00f3ff (neon-blue)
concept:  #bc13fe (neon-purple)
skill:    #00ff88 (neon-green)
person:   #ff006e (neon-pink)
resource: #ffbe0b (neon-yellow)
project:  #8338ec (neon-violet)
other:    #00d9ff (cyan)
```

### Link Styling

- **Width:** 0.5 units (very thin, like constellation lines)
- **Opacity:** 0.3 (semi-transparent fading effect)
- **Color:** Dynamic based on link strength
- **Effect:** Creates constellation-like connections

### Background

- **Starfield:** 1500 twinkling stars for depth
- **Gradient:** Dark radial gradient from light to black
- **Effect:** Deep space atmosphere

## Interactions

### Mouse Hover
- Hover over a node to highlight it
- Connected nodes highlight with increased emissive intensity
- Non-connected nodes dim to 30% intensity
- Shows node name in tooltip

### Mouse Click
- Click a node to focus the camera on it
- 1-second smooth camera animation
- Opens node detail panel
- Camera distance scales with node importance

### Controls (GalaxyViewer)
- **Zoom In (+):** 20% zoom increase
- **Zoom Out (-):** 20% zoom decrease
- **Reset:** Return to original zoom
- **Pause/Resume:** Toggle auto-rotation

### Keyboard
- **Scroll:** Zoom in/out
- **Drag:** Rotate view (if rotation enabled)
- **Pan:** Click and drag (if pan enabled)

## Physics Configuration

The graph uses d3-force physics simulation:

```typescript
cooldownTicks={100}        // Stabilize after 100 iterations
d3AlphaDecay={0.03}       // Temperature decay (faster convergence)
d3VelocityDecay={0.3}     // Velocity damping (more stable positioning)
```

This creates:
- Quick stabilization (< 5 seconds)
- Natural, organic layout
- Stable with user interaction

## Animation

### Auto-Rotation
- Continuous slow rotation around Y-axis
- Speed: 0.0003 radians per frame (~10 seconds per full rotation)
- Pausable via controls
- Creates "living galaxy" effect

### Starfield
- Rotation on X and Y axes
- Twinkling particles
- Smooth animation loop

### Camera Animation
- 1-second fly-to animation on node click
- Distance scales with node importance
- Smooth easing

## Integration Example

```typescript
import { useState, useEffect } from 'react'
import { GalaxyViewer } from '@/components/3d/GalaxyViewer'
import { fetchGraphData } from '@/services/ai'
import type { GraphData, GraphNode } from '@/types/graph'

export function MyGalaxyPage() {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGraphData('machine learning')
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>Error loading data</div>

  return (
    <GalaxyViewer
      data={data}
      title="Machine Learning Galaxy"
      onNodeSelect={(node) => console.log('Selected:', node.name)}
    />
  )
}
```

## Performance Tips

1. **Starfield Count:** Default 1500 stars. Increase for more detail, decrease for better performance on low-end devices.

2. **Node Count:** Optimized for 20-100 nodes. Works with more, but may slow down.

3. **Physics Cooldown:** Increase from 100 to 200 for slower stabilization (more accurate). Decrease to 50 for faster (less accurate).

4. **Auto-Rotation:** Disable on low-end devices to improve FPS.

5. **Camera Distance:** Adjust based on graph size. Larger graphs need larger distance.

## Customization

### Change Rotation Speed
```typescript
// In GalaxyGraph.tsx, modify in animate() function:
rotationRef.current.y += 0.0005  // Faster rotation
// or
rotationRef.current.y += 0.00015 // Slower rotation
```

### Change Node Colors
```typescript
// In getCategoryColor() function:
const colorMap: Record<string, string> = {
  topic: '#your-color',
  // ...
}
```

### Change Glow Intensity
```typescript
// In createGlowingSphere():
emissiveIntensity: 1.5  // Brighter glow
// or
emissiveIntensity: 0.8  // Dimmer glow
```

### Adjust Physics
```typescript
cooldownTicks={150}      // Slower stabilization
d3AlphaDecay={0.05}     // Faster decay
d3VelocityDecay={0.4}   // More damping
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (uses WebGL 2)

## Known Limitations

1. **Mobile Performance:** Works but may be slower on mobile devices
2. **Large Graphs:** 500+ nodes may experience slowdown
3. **Starfield Twinkling:** Uses requestAnimationFrame, CPU intensive
4. **Link Labels:** Currently not rendered (can be added)

## Future Enhancements

1. Link labels and descriptions
2. Edge labels on hover
3. Multi-select nodes
4. Graph filtering UI
5. Export to PNG/Video
6. VR/AR support
7. Real-time graph updates
8. Particle effects on interaction
9. Sound effects on interaction
10. Search and highlight functionality

## Troubleshooting

### Graph not rotating
- Check `autoRotate={true}` is set
- Check rotation is not paused via controls
- Verify `requestAnimationFrame` is supported

### Nodes not rendering
- Check `data.nodes` is not empty
- Verify node structure matches GraphNode interface
- Check console for Three.js errors

### Stars not visible
- Check starfield `starCount` > 0
- Verify canvas size is correct
- Check opacity is not 0

### Performance issues
- Reduce `starCount` in Starfield
- Reduce `cooldownTicks` in GalaxyGraph
- Disable `autoRotate`
- Reduce node count

### Links too faint
- Increase `linkOpacity` from 0.3
- Increase link color alpha values
- Change link color to brighter values

## API Reference

### GalaxyGraph Methods (via ref)

```typescript
const graphRef = useRef<any>(null)

// Access the underlying ForceGraph3D instance
graphRef.current.scene()              // Get Three.js scene
graphRef.current.postProcessingObject() // Get effect composer
```

### Data Types

```typescript
interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface GraphNode {
  id: string
  name: string
  val: number              // 0-100 (importance)
  category: string         // Node category
  description?: string
  color?: string          // Optional custom color
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value?: number          // Link strength
  label?: string
}
```

## Files

- `GalaxyGraph.tsx` - Core visualization component
- `Starfield.tsx` - Background starfield
- `GalaxyViewer.tsx` - Complete viewer with controls
- `GALAXY_GRAPH_GUIDE.md` - This documentation

## Examples

See `src/pages/GalaxyPage.tsx` for a complete working example.
