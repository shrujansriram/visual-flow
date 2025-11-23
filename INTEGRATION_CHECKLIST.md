# AI Service Integration Checklist

## Phase 1: Current Setup (Development)

- [x] AI service implemented (`src/services/ai.ts`)
- [x] Multi-layer anti-hallucination safeguards
- [x] 3 complex dummy templates (ML, Web, Quantum)
- [x] Strict data validation
- [x] Generic fallback generation
- [x] Complete documentation
- [x] 10 usage examples
- [x] Production build passing
- [x] TypeScript strict mode passing
- [x] Zero errors, zero warnings

**Status:** ✅ READY TO USE

**How to test:**
```bash
# In Node console or test file
import { fetchGraphData } from '@/services/ai'

const data = await fetchGraphData('machine learning')
console.log(data)  // Guaranteed valid
```

---

## Phase 2: React Integration (Next)

### UI Component Setup

- [ ] Create GraphViewer component
  ```typescript
  // src/components/GraphViewer.tsx
  import { fetchGraphData } from '@/services/ai'

  export function GraphViewer({ topic }: { topic: string }) {
    const [data, setData] = useState<GraphData | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      setLoading(true)
      fetchGraphData(topic)
        .then(setData)
        .finally(() => setLoading(false))
    }, [topic])

    if (loading) return <div>Loading graph...</div>
    if (!data) return <div>No data</div>

    return <GraphCanvas data={data} />
  }
  ```

- [ ] Add error handling UI
  ```typescript
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGraphData(topic)
      .then(setData)
      .catch(err => setError(err.message))
  }, [topic])

  if (error) return <div className="error">{error}</div>
  ```

- [ ] Add retry button
  ```typescript
  <button onClick={() => refetch()}>
    Retry
  </button>
  ```

- [ ] Test with dummy data

---

## Phase 3: Claude API Integration

### 1. Environment Setup

- [ ] Create `.env.local` file
  ```
  REACT_APP_CLAUDE_API_KEY=sk-ant-...
  ```

- [ ] Verify key is loaded
  ```typescript
  console.log('API Key loaded:', !!process.env.REACT_APP_CLAUDE_API_KEY)
  ```

### 2. API Wrapper Implementation

- [ ] Create `src/services/claude-api.ts`
  ```typescript
  import { KNOWLEDGE_GRAPH_SYSTEM_PROMPT, API_CONFIG, parseGraphDataResponse } from './ai'

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
        messages: [{
          role: 'user',
          content: `Generate knowledge graph for: ${topic}`,
        }],
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return parseGraphDataResponse(data.content[0].text)
  }
  ```

- [ ] Modify `fetchGraphData()` to use real API
  ```typescript
  export async function fetchGraphData(topic: string) {
    try {
      // Try real API first
      return await generateWithClaude(topic)
    } catch (error) {
      // Fallback to dummy data
      const normalized = topic.toLowerCase().replace(/\s+/g, '-')
      const generator = DUMMY_DATA_TEMPLATES[normalized]
      if (generator) return generator()
      return generateGenericGraphData(topic)
    }
  }
  ```

### 3. Testing

- [ ] Test with single topic
  ```typescript
  const data = await generateWithClaude('machine learning')
  console.log(data)
  ```

- [ ] Verify system prompt is respected
  - Check response starts with `{`
  - Check response ends with `}`
  - No markdown or explanations

- [ ] Test error handling
  ```typescript
  try {
    await generateWithClaude('invalid:::topic')
  } catch (error) {
    console.log('Error caught:', error.message)
  }
  ```

- [ ] Test with multiple topics
  ```typescript
  const topics = ['blockchain', 'AI safety', 'climate science']
  for (const topic of topics) {
    const data = await generateWithClaude(topic)
    console.log(`${topic}: ${data.nodes.length} nodes`)
  }
  ```

### 4. Validation

- [ ] All responses pass `validateGraphData()`
- [ ] No runtime errors in GraphCanvas
- [ ] All nodes render correctly
- [ ] All links render correctly
- [ ] Colors and sizes appropriate

---

## Phase 4: Production Setup

### 1. Error Handling & Monitoring

- [ ] Set up error logging
  ```typescript
  import { captureException } from '@sentry/react'

  .catch(error => {
    captureException(error)
    setError('Failed to generate graph')
  })
  ```

- [ ] Add usage metrics
  ```typescript
  logEvent('graph_generated', { topic, nodeCount: data.nodes.length })
  ```

- [ ] Monitor API costs
  ```typescript
  // Track usage per user/topic
  const { usage } = apiResponse
  logUsage({ input_tokens: usage.input_tokens, output_tokens: usage.output_tokens })
  ```

### 2. Performance Optimization

- [ ] Implement caching
  ```typescript
  const cache = new Map<string, GraphData>()

  export async function getCachedGraph(topic: string) {
    if (cache.has(topic)) return cache.get(topic)!
    const data = await fetchGraphData(topic)
    cache.set(topic, data)
    return data
  }
  ```

- [ ] Add request debouncing
  ```typescript
  const debouncedFetch = debounce(fetchGraphData, 300)
  ```

- [ ] Implement response streaming for large graphs
  ```typescript
  // For graphs > 50 nodes
  ```

### 3. Security Hardening

- [ ] Never log API keys
- [ ] Validate all user input
- [ ] Rate limit API calls per user
- [ ] Sanitize error messages before displaying
- [ ] Use HTTPS only for API calls

### 4. Documentation

- [ ] Document API costs
- [ ] Create runbook for common errors
- [ ] Document rate limits
- [ ] Create troubleshooting guide for users

---

## Phase 5: Advanced Features (Future)

- [ ] Batch generation for multiple topics
- [ ] Custom system prompts per domain
- [ ] Graph pruning and optimization
- [ ] Interactive graph editing with Claude
- [ ] Export generated graphs to JSON/JSON-LD
- [ ] Share generated graphs as links
- [ ] Compare graphs across different prompts
- [ ] Generate from documents/PDFs
- [ ] Real-time collaborative editing

---

## Testing Checklist

### Unit Tests

- [ ] `validateGraphData()` catches invalid data
- [ ] `parseGraphDataResponse()` rejects malformed JSON
- [ ] `fetchGraphData()` returns valid data
- [ ] Error messages are descriptive
- [ ] Templates match expected structure

### Integration Tests

- [ ] Component renders with dummy data
- [ ] Component renders with Claude API data
- [ ] Error UI shows on API failure
- [ ] Retry button works
- [ ] Loading state displays correctly

### E2E Tests

- [ ] User can select topic and view graph
- [ ] Graph is interactive (zoom, pan)
- [ ] Node details show on click
- [ ] Search/filter works
- [ ] Export works

---

## Performance Benchmarks

### Targets to Meet

- [x] Dummy data load: < 1ms
- [ ] Claude API response: < 30s (timeout)
- [ ] Validation: < 100ms
- [ ] Rendering: < 500ms
- [ ] Total user experience: < 32s (network + processing)

### Monitor

- [ ] API response time distribution
- [ ] Error rate percentage
- [ ] Validation failures
- [ ] Cache hit rate

---

## Rollout Plan

### Stage 1: Dev Environment
- [x] Code complete
- [ ] Internal testing
- [ ] Demo with team

### Stage 2: Staging
- [ ] Deploy to staging
- [ ] Load testing
- [ ] Security review
- [ ] User acceptance testing

### Stage 3: Production
- [ ] Canary rollout (10% users)
- [ ] Monitor error rates
- [ ] Expand to 50% users
- [ ] Full rollout
- [ ] Monitoring dashboard

---

## Troubleshooting Guide

### Common Issues

**Issue: "Invalid JSON response from Claude"**
- Check system prompt is in request
- Verify API key is valid
- Log raw response for inspection
- Fallback to dummy data

**Issue: "source node X not found"**
- Check template for broken links
- Run validation test separately
- Review Claude prompt

**Issue: API Timeout**
- Reduce maxTokens in API_CONFIG
- Use simpler topics
- Check API rate limits
- Increase timeout

**Issue: Empty Graph**
- Check topic matches template
- Verify API response received
- Check node generation logic

---

## Success Criteria

✅ Phase 1 (Current): COMPLETE
- AI service fully implemented
- Comprehensive dummy data
- Anti-hallucination safeguards
- Full documentation
- Production build passing

✅ Phase 2 (Integration): IN PROGRESS
- [ ] Connected to React components
- [ ] Error handling working
- [ ] User testing

⏳ Phase 3 (API): NEXT
- [ ] Claude API calls working
- [ ] Validation catching errors
- [ ] Monitoring in place

⏳ Phase 4 (Production): COMING
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation complete
- [ ] Team trained

---

## Contact & Support

For questions:
- See [AI_SERVICE_GUIDE.md](./src/services/AI_SERVICE_GUIDE.md)
- See [API_QUICK_REFERENCE.md](./src/services/API_QUICK_REFERENCE.md)
- Check [ai.example.ts](./src/services/ai.example.ts)
- Review [ai.ts](./src/services/ai.ts) implementation

---

## Last Updated

- Phase 1 Complete: November 22, 2024
- Next Update: When Phase 2 begins
