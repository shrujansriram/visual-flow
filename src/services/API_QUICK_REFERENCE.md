# AI Service API Quick Reference

## Main Export: `fetchGraphData(topic: string): Promise<GraphData>`

The only function you need to get started.

```typescript
import { fetchGraphData } from '@/services/ai'

// Usage
const graphData = await fetchGraphData('machine learning')

// Returns
{
  nodes: [
    { id: 'ml', name: 'Machine Learning', val: 100, category: 'topic', description: '...' },
    // ... more nodes
  ],
  links: [
    { source: 'ml', target: 'supervised-learning', value: 15, label: 'includes' },
    // ... more links
  ]
}
```

**What it does:**
1. Checks if topic has pre-built template
2. Returns template if exists (< 1ms)
3. Generates generic data if not (< 100ms)
4. Always validates before returning
5. Throws descriptive error if invalid

**Topics with templates:**
- "machine learning"
- "web development"
- "quantum computing"

**Unknown topics:**
- Auto-generates valid generic data
- Same structure as templates
- Safe for immediate rendering

---

## System Prompt: `KNOWLEDGE_GRAPH_SYSTEM_PROMPT`

Use when connecting real Claude API.

```typescript
import { KNOWLEDGE_GRAPH_SYSTEM_PROMPT } from '@/services/ai'

const response = await fetch(apiEndpoint, {
  system: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
  // ... other config
})
```

**Key features:**
- Forces JSON-only output
- Requires specific structure
- Defines validation rules
- Prevents hallucination

---

## API Config: `API_CONFIG`

Pre-configured settings for Claude API.

```typescript
import { API_CONFIG } from '@/services/ai'

// Ready to use values
API_CONFIG.model        // 'claude-3-5-sonnet-20241022'
API_CONFIG.maxTokens    // 4096
API_CONFIG.temperature  // 0.7
API_CONFIG.timeout      // 30000
API_CONFIG.endpoint     // 'https://api.anthropic.com/v1/messages'
```

**Customize as needed:**
```typescript
const customConfig = {
  ...API_CONFIG,
  temperature: 0.5,  // More deterministic
  maxTokens: 8000,   // For larger graphs
}
```

---

## Response Parser: `parseGraphDataResponse(json: string): GraphData`

Safely parse Claude API responses.

```typescript
import { parseGraphDataResponse } from '@/services/ai'

try {
  const graphData = parseGraphDataResponse(claudeResponse)
  // Safe to render
} catch (error) {
  // Handle invalid response
  console.error(error.message)
}
```

**Validates:**
- Valid JSON syntax
- Required fields present
- Value ranges correct
- Link endpoints exist
- No duplicate IDs

---

## Error Messages

Common errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid JSON response` | Malformed JSON | Ensure system prompt enforces JSON-only |
| `Invalid node: missing id` | Node without ID | Add unique string IDs to all nodes |
| `val must be 0-100` | Wrong value range | Use numbers between 0-100 |
| `source node X not found` | Broken link | Verify all link endpoints exist |
| `nodes array is empty` | No nodes generated | Check topic or template |

---

## Basic Integration

### Step 1: Import
```typescript
import { fetchGraphData } from '@/services/ai'
```

### Step 2: Use in Hook/Component
```typescript
const [data, setData] = useState<GraphData | null>(null)
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetchGraphData('machine learning')
    .then(setData)
    .finally(() => setLoading(false))
}, [])
```

### Step 3: Render
```typescript
if (loading) return <div>Loading...</div>
if (!data) return <div>No data</div>

return <GraphCanvas data={data} />
```

---

## Real API Integration

### Step 1: Set Environment Variable
```bash
# .env.local
REACT_APP_CLAUDE_API_KEY=sk-ant-...
```

### Step 2: Create API Wrapper
```typescript
import { KNOWLEDGE_GRAPH_SYSTEM_PROMPT, API_CONFIG, parseGraphDataResponse } from '@/services/ai'

export async function generateWithClaude(topic: string) {
  const response = await fetch(API_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: API_CONFIG.maxTokens,
      temperature: API_CONFIG.temperature,
      system: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate knowledge graph for: ${topic}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(API_CONFIG.timeout),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  const data = await response.json()
  return parseGraphDataResponse(data.content[0].text)
}
```

### Step 3: Use Instead of fetchGraphData
```typescript
const graphData = await generateWithClaude(topic)
```

---

## Type Definitions

Use these types for type safety:

```typescript
import type { GraphData, GraphNode, GraphLink, NodeCategory } from '@/types/graph'

// Node type
interface GraphNode {
  id: string
  name: string
  val: number              // 0-100
  category: string         // topic, concept, skill, person, resource, project, other
  description?: string
  color?: string
  metadata?: Record<string, unknown>
}

// Link type
interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value?: number           // Strength
  label?: string           // Relationship
}

// Graph type
interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// Node categories
type NodeCategory = 'concept' | 'person' | 'topic' | 'resource' | 'skill' | 'project' | 'other'
```

---

## Debug Mode

### Log System Prompt
```typescript
import { KNOWLEDGE_GRAPH_SYSTEM_PROMPT } from '@/services/ai'

console.log(KNOWLEDGE_GRAPH_SYSTEM_PROMPT)
```

### Inspect API Config
```typescript
import { API_CONFIG } from '@/services/ai'

console.log(API_CONFIG)
```

### Test Validation
```typescript
import { parseGraphDataResponse } from '@/services/ai'

// This should fail
try {
  parseGraphDataResponse('{"nodes": []}')
} catch (e) {
  console.log('Validation working:', e.message)
}
```

---

## Performance Tips

1. **Cache Results**
   ```typescript
   const cache = new Map<string, GraphData>()

   async function cachedFetch(topic: string) {
     if (cache.has(topic)) return cache.get(topic)!
     const data = await fetchGraphData(topic)
     cache.set(topic, data)
     return data
   }
   ```

2. **Lazy Load**
   ```typescript
   <Suspense fallback={<Spinner />}>
     <GraphComponent topic={topic} />
   </Suspense>
   ```

3. **Memoize Validation**
   ```typescript
   const validData = useMemo(() => validateGraphData(data), [data])
   ```

---

## Supported Topics

### With Templates (Instant)
- ✓ "machine learning"
- ✓ "web development"
- ✓ "quantum computing"

### Without Templates (Generated)
- ✓ Any other topic
- Generates valid generic structure
- Same quality as templates

---

## Troubleshooting

### "Invalid JSON response"
**Problem:** API returned malformed JSON
**Solution:**
- Check system prompt is in API request
- Verify API response format
- Log raw response to debug

### "source node X not found"
**Problem:** Link references non-existent node
**Solution:**
- Check system prompt enforces all links valid
- Add missing nodes to template
- Test with validation function first

### "Empty nodes array"
**Problem:** No nodes generated
**Solution:**
- Topic has no template (use another)
- API error (check API response)
- Try with fallback generic data

### API Timeout
**Problem:** Took > 30 seconds
**Solution:**
- Reduce maxTokens
- Use simpler topics
- Increase timeout in API_CONFIG

---

## Next Steps

1. **Test Dummy Data**
   ```typescript
   const ml = await fetchGraphData('machine learning')
   console.log(`Loaded ${ml.nodes.length} nodes`)
   ```

2. **Set Up Claude API Key**
   ```bash
   echo "REACT_APP_CLAUDE_API_KEY=..." > .env.local
   ```

3. **Implement Real API Integration**
   - Use example from "Real API Integration" section
   - Test with parseGraphDataResponse()

4. **Add Error UI**
   - Show user-friendly messages
   - Provide retry mechanism
   - Log errors for debugging

5. **Monitor Usage**
   - Track API calls
   - Monitor costs
   - Set up alerts

---

## File Structure

```
src/services/
├── ai.ts                      # Main implementation
├── ai.example.ts              # 10 usage examples
├── API_QUICK_REFERENCE.md     # This file
└── AI_SERVICE_GUIDE.md        # Full documentation
```

Start with `ai.ts` for implementation details.
See `ai.example.ts` for real-world usage patterns.

---

## Support

For detailed documentation, see [AI_SERVICE_GUIDE.md](./AI_SERVICE_GUIDE.md)

For examples, see [ai.example.ts](./ai.example.ts)

For implementation details, see [ai.ts](./ai.ts)
