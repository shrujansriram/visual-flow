import type { GraphData } from '../types/graph'

/**
 * Sample knowledge graph data for demonstration
 */
export const sampleGraphData: GraphData = {
  nodes: [
    {
      id: '1',
      name: 'React',
      val: 30,
      category: 'skill',
      description: 'A JavaScript library for building user interfaces',
      color: '#00f3ff',
    },
    {
      id: '2',
      name: 'Three.js',
      val: 28,
      category: 'skill',
      description: '3D JavaScript library',
      color: '#bc13fe',
    },
    {
      id: '3',
      name: 'Web Development',
      val: 40,
      category: 'topic',
      description: 'The art of building websites and web applications',
      color: '#00f3ff',
    },
    {
      id: '4',
      name: 'TypeScript',
      val: 25,
      category: 'skill',
      description: 'Typed JavaScript for large-scale applications',
      color: '#bc13fe',
    },
    {
      id: '5',
      name: 'Vite',
      val: 20,
      category: 'tool',
      description: 'Lightning fast build tool for modern web development',
      color: '#00f3ff',
    },
    {
      id: '6',
      name: '3D Graphics',
      val: 35,
      category: 'topic',
      description: 'Creating and rendering 3D visual content',
      color: '#bc13fe',
    },
    {
      id: '7',
      name: 'Data Visualization',
      val: 32,
      category: 'topic',
      description: 'Visual representation of complex data',
      color: '#00f3ff',
    },
    {
      id: '8',
      name: 'WebGL',
      val: 26,
      category: 'skill',
      description: 'Low-level graphics API for web browsers',
      color: '#bc13fe',
    },
  ],
  links: [
    { source: '1', target: '3', value: 10, label: 'used in' },
    { source: '2', target: '6', value: 15, label: 'enables' },
    { source: '3', target: '7', value: 12, label: 'includes' },
    { source: '4', target: '1', value: 8, label: 'improves' },
    { source: '5', target: '3', value: 9, label: 'speeds up' },
    { source: '2', target: '8', value: 11, label: 'uses' },
    { source: '8', target: '6', value: 14, label: 'powers' },
    { source: '1', target: '4', value: 7, label: 'compatible with' },
    { source: '7', target: '6', value: 13, label: 'includes' },
    { source: '5', target: '1', value: 10, label: 'accelerates' },
  ],
}

/**
 * Generate random graph data for testing
 */
export function generateRandomGraphData(nodeCount: number = 20, linkCount: number = 30) {
  const categories = ['concept', 'person', 'topic', 'resource', 'skill', 'project'] as const
  const colors = ['#00f3ff', '#bc13fe', '#00ff88', '#ff006e', '#ffbe0b']

  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: String(i),
    name: `Node ${i}`,
    val: Math.random() * 30 + 10,
    category: categories[Math.floor(Math.random() * categories.length)],
    description: `Description for node ${i}`,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))

  const links = Array.from({ length: linkCount }, () => ({
    source: String(Math.floor(Math.random() * nodeCount)),
    target: String(Math.floor(Math.random() * nodeCount)),
    value: Math.random() * 10 + 5,
  }))

  return { nodes, links }
}
