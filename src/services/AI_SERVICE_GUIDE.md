# AI Service Guide

## Overview

The `ai.ts` service provides robust knowledge graph data generation with anti-hallucination safeguards designed for integration with Claude API.

## Key Components

### 1. System Prompt (`KNOWLEDGE_GRAPH_SYSTEM_PROMPT`)

A comprehensive prompt that enforces strict JSON output from Claude, preventing hallucination and ensuring data integrity.

**Features:**
- Explicit instruction for JSON-only output (no markdown)
- Hierarchical structure specification (1 central + 5-7 primary + 15-28 secondary nodes)
- Strict categorization rules for consistent data
- Validation rules ensuring data integrity
- Clear expectations for link relationships

**When to Use:**
```typescript
// When connecting to real Claude API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': CLAUDE_API_KEY,
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: API_CONFIG.model,
    max_tokens: API_CONFIG.maxTokens,
    system: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a knowledge graph for: ${topic}`,
      },
    ],
  }),
})
```

### 2. Dummy Data Templates

Pre-built templates for common topics ensuring instant, validated data:

**Available Templates:**
- `machine-learning` - 33 nodes covering ML concepts, algorithms, and pioneers
- `web-development` - 28 nodes covering frontend, backend, DevOps, security
- `quantum-computing` - 20 nodes covering quantum theory and applications

**Structure Per Template:**
- 1 central topic node (val: 100)
- 5-7 primary concept nodes (val: 70-90)
- 15-28 secondary/tertiary nodes (val: 40-80)
- Comprehensive link relationships

### 3. Data Validation (`validateGraphData`)

Strict validation ensuring all data is safe for rendering:

```typescript
// Checks:
- nodes array exists and is non-empty
- links array exists
- All nodes have required fields: id, name, val, category
- All node values are between 0-100
- No duplicate node IDs
- All links reference existing nodes
```

### 4. API Functions

#### `fetchGraphData(topic: string): Promise<GraphData>`

Main entry point for getting graph data:

```typescript
// Usage:
const graphData = await fetchGraphData('machine learning')

// Returns either:
// 1. Pre-built template data (if exists)
// 2. Fallback generic data
// 3. Real Claude API data (when implemented)
```

**Features:**
- Automatic template matching
- Network delay simulation (500ms)
- Comprehensive validation
- Error handling with descriptive messages

#### `parseGraphDataResponse(response: string): GraphData`

Safely parses Claude API responses:

```typescript
// Usage:
const graphData = parseGraphDataResponse(claudeApiResponse)

// Validates:
- Valid JSON format
- Correct data structure
- All required fields present
- All values within ranges
```

### 5. Configuration (`API_CONFIG`)

Central configuration object for API integration:

```typescript
{
  systemPrompt: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
  endpoint: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  temperature: 0.7,
  timeout: 30000,
}
```

## Anti-Hallucination Strategy

### Problem
Claude can generate invalid JSON, missing fields, or malformed data structures that break the graph renderer.

### Solution
Multi-layered approach:

#### Layer 1: System Prompt
- Explicit JSON-only requirement
- Clear structure specification
- Validation rules in prompt
- Examples of correct format

#### Layer 2: Validation Function
- Runtime checks before rendering
- Descriptive error messages
- Catches missing/invalid fields
- Prevents type mismatches

#### Layer 3: Fallback Templates
- Pre-validated dummy data
- Instant fallback if API fails
- Consistent structure guarantee

#### Layer 4: Response Parsing
- JSON parsing with error handling
- Structure validation
- Field-level type checking

## Usage Examples

### Basic Usage

```typescript
import { fetchGraphData } from '@/services/ai'

// In a React component:
const [graphData, setGraphData] = useState<GraphData | null>(null)
const [loading, setLoading] = useState(false)

const loadGraph = async (topic: string) => {
  setLoading(true)
  try {
    const data = await fetchGraphData(topic)
    setGraphData(data)
  } catch (error) {
    console.error('Failed to load graph:', error)
    // Show error to user
  } finally {
    setLoading(false)
  }
}
```

### Using with Real API

```typescript
import { KNOWLEDGE_GRAPH_SYSTEM_PROMPT, API_CONFIG, parseGraphDataResponse } from '@/services/ai'

async function fetchFromClaude(topic: string) {
  const response = await fetch(API_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: API_CONFIG.maxTokens,
      temperature: API_CONFIG.temperature,
      system: API_CONFIG.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a knowledge graph for: ${topic}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  const apiResponse = await response.json()
  const jsonContent = apiResponse.content[0].text

  // This validates and parses safely
  return parseGraphDataResponse(jsonContent)
}
```

### Creating Custom Templates

```typescript
// Add to DUMMY_DATA_TEMPLATES:
'custom-topic': () => ({
  nodes: [
    {
      id: 'custom-central',
      name: 'Custom Topic',
      val: 100,
      category: 'topic',
      description: 'Central concept description',
    },
    // ... more nodes
  ],
  links: [
    {
      source: 'custom-central',
      target: 'sub-concept',
      value: 12,
      label: 'relationship',
    },
    // ... more links
  ],
})
```

## Data Structure Specification

### Node Structure
```typescript
{
  id: string              // Unique identifier (lowercase, no spaces)
  name: string            // 2-5 words display name
  val: number             // 10-100 (importance/size)
  category: string        // One of: concept, person, topic, resource, skill, project, other
  description: string     // 10-30 words explaining the node
  color?: string          // Optional hex color (#rrggbb)
  metadata?: Record       // Optional additional data
}
```

### Link Structure
```typescript
{
  source: string | GraphNode   // Source node ID or object
  target: string | GraphNode   // Target node ID or object
  value?: number               // 5-15 (link strength)
  label?: string               // Relationship description
}
```

## Extending the Service

### Adding a New Template

1. Add to `DUMMY_DATA_TEMPLATES`:
```typescript
'new-topic': () => ({
  nodes: [ /* nodes */ ],
  links: [ /* links */ ],
})
```

2. Template will automatically be used for that topic

### Adding Real API Integration

1. Create wrapper function:
```typescript
export async function fetchGraphDataFromClaude(topic: string): Promise<GraphData> {
  // Call API
  // Parse response with parseGraphDataResponse()
  // Return validated data
}
```

2. Modify `fetchGraphData` to call real API:
```typescript
export async function fetchGraphData(topic: string): Promise<GraphData> {
  try {
    return await fetchGraphDataFromClaude(topic)
  } catch (error) {
    // Fallback to template or generic data
  }
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid JSON response from Claude` | Malformed JSON in response | Check system prompt enforces JSON-only |
| `Invalid node: missing or non-string id` | Node without id field | Ensure all nodes have unique string IDs |
| `Invalid link: source node X not found` | Link references non-existent node | Verify all link endpoints exist |
| `val must be a number between 0-100` | Value out of range | Use val between 10-100 |

### Debugging

Enable detailed logging:

```typescript
function validateGraphData(data: GraphData): boolean {
  console.log('Validating graph data...')
  console.log(`Nodes: ${data.nodes.length}, Links: ${data.links.length}`)

  // Validation code...

  console.log('Validation successful')
  return true
}
```

## Performance Considerations

- Validation is O(n) where n = nodes + links
- Dummy templates load instantly (no network)
- API calls have 30-second timeout
- Mock API adds 500ms delay for testing

## Security

- No API keys stored in client code
- System prompt prevents prompt injection
- JSON parsing validates all input
- No eval() or unsafe operations

## Future Enhancements

1. Caching validated results
2. Streaming responses for large graphs
3. Batch generation for multiple topics
4. Graph optimization and pruning
5. Custom system prompts per domain
6. Analytics on generated graphs

## Testing

```typescript
// Test with different topics:
const data1 = await fetchGraphData('machine learning')
const data2 = await fetchGraphData('unknown-topic') // Generates generic
const data3 = await fetchGraphData('web development')

// Verify structure:
console.assert(data1.nodes.length > 0)
console.assert(data1.links.length > 0)
console.assert(data1.nodes[0].val <= 100)
```
