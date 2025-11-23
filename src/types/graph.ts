/**
 * Types for Knowledge Graph visualization
 */

export interface GraphNode {
  id: string
  name: string
  val: number // Size/value indicator for visualization
  category: string // Node category for coloring and filtering
  description?: string
  color?: string // Optional custom color
  metadata?: Record<string, unknown> // Additional metadata
}

export interface GraphLink {
  source: string | GraphNode // Can be ID or full node object
  target: string | GraphNode // Can be ID or full node object
  value?: number // Link strength
  label?: string // Optional link label
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type NodeCategory =
  | 'concept'
  | 'person'
  | 'topic'
  | 'resource'
  | 'skill'
  | 'project'
  | 'other'

export interface GraphFilterOptions {
  categories?: NodeCategory[]
  minValue?: number
  maxValue?: number
  searchQuery?: string
}

export interface GraphViewState {
  zoom: number
  center: [number, number, number]
  rotation: [number, number, number]
}
