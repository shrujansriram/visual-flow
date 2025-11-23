/**
 * AI Service for generating knowledge graph data
 * Includes anti-hallucination safeguards and structured data generation
 */

import type { GraphData, GraphNode, GraphLink } from '@/types/graph'

/**
 * System prompt for Claude to enforce strict JSON output
 * This will be used when connecting to the real API
 * It prevents hallucination and ensures valid data structure
 */
export const KNOWLEDGE_GRAPH_SYSTEM_PROMPT = `You are a Knowledge Graph Architect specializing in creating structured knowledge representations.

Your task is to generate a comprehensive knowledge graph for any given topic.

OUTPUT REQUIREMENTS:
1. Output ONLY valid JSON - NO markdown, NO explanations, NO extra text
2. Structure: Central node (the main topic) connected to 5-7 primary sub-nodes
3. Each primary sub-node should have 3-4 child nodes for granular detail
4. Total expected: 1 central + 5-7 primary + 15-28 child nodes = 21-36 nodes

DATA STRUCTURE:
{
  "nodes": [
    {
      "id": "unique-string-id",
      "name": "Node display name",
      "val": 30,
      "category": "concept|person|topic|resource|skill|project|other",
      "description": "Clear, concise description of the concept"
    }
  ],
  "links": [
    {
      "source": "node-id-1",
      "target": "node-id-2",
      "value": 10,
      "label": "relationship description"
    }
  ]
}

CATEGORIZATION RULES:
- Central topic: category = "topic", val = 100
- Primary concepts: category = "concept", val = 70-80
- Sub-concepts: category = "concept", val = 40-60
- Skills/Techniques: category = "skill", val = 50-70
- People/Authors: category = "person", val = 60-80
- Resources/References: category = "resource", val = 40-60
- Projects/Applications: category = "project", val = 50-70

VALIDATION RULES:
- All IDs must be unique and lowercase with hyphens (no spaces)
- All names should be 2-5 words
- All descriptions should be 10-30 words
- Val (importance/size) ranges from 10-100
- Only use predefined categories
- No circular links at depth 1 (central to primary nodes must not link back)
- Links should represent meaningful relationships
- Ensure at least 30 links connecting the graph

START YOUR RESPONSE WITH { (NO markdown, NO code blocks)
END YOUR RESPONSE WITH } (ONLY JSON)

Generate the knowledge graph now.`

/**
 * Comprehensive dummy data generator for different topics
 * Uses hierarchical structure: Central -> Primary -> Secondary nodes
 */
const DUMMY_DATA_TEMPLATES: Record<string, () => GraphData> = {
  'machine-learning': () => ({
    nodes: [
      // Central node
      {
        id: 'machine-learning',
        name: 'Machine Learning',
        val: 100,
        category: 'topic',
        description: 'Computational field enabling systems to learn from data and make predictions',
      },
      // Primary concepts
      {
        id: 'supervised-learning',
        name: 'Supervised Learning',
        val: 85,
        category: 'concept',
        description: 'Training algorithms using labeled examples to predict outcomes',
      },
      {
        id: 'unsupervised-learning',
        name: 'Unsupervised Learning',
        val: 80,
        category: 'concept',
        description: 'Finding patterns in unlabeled data without predefined targets',
      },
      {
        id: 'neural-networks',
        name: 'Neural Networks',
        val: 90,
        category: 'concept',
        description: 'Interconnected layers of nodes inspired by biological neurons',
      },
      {
        id: 'deep-learning',
        name: 'Deep Learning',
        val: 88,
        category: 'concept',
        description: 'Using multi-layer neural networks for complex pattern recognition',
      },
      {
        id: 'reinforcement-learning',
        name: 'Reinforcement Learning',
        val: 82,
        category: 'concept',
        description: 'Training agents to make sequential decisions through reward systems',
      },
      {
        id: 'nlp',
        name: 'Natural Language Processing',
        val: 78,
        category: 'concept',
        description: 'Techniques for machines to understand and generate human language',
      },
      // Secondary nodes for supervised learning
      {
        id: 'regression',
        name: 'Regression',
        val: 65,
        category: 'skill',
        description: 'Predicting continuous numerical values from input features',
      },
      {
        id: 'classification',
        name: 'Classification',
        val: 70,
        category: 'skill',
        description: 'Categorizing data into predefined discrete classes or labels',
      },
      {
        id: 'decision-trees',
        name: 'Decision Trees',
        val: 60,
        category: 'concept',
        description: 'Tree-structured models for making decisions based on feature splits',
      },
      {
        id: 'svm',
        name: 'Support Vector Machines',
        val: 62,
        category: 'skill',
        description: 'Finding optimal hyperplanes to separate classes in high dimensions',
      },
      // Secondary nodes for unsupervised learning
      {
        id: 'clustering',
        name: 'Clustering',
        val: 68,
        category: 'skill',
        description: 'Grouping similar data points into clusters based on similarity metrics',
      },
      {
        id: 'dimensionality-reduction',
        name: 'Dimensionality Reduction',
        val: 64,
        category: 'skill',
        description: 'Reducing data features while preserving important information',
      },
      {
        id: 'pca',
        name: 'Principal Component Analysis',
        val: 58,
        category: 'concept',
        description: 'Statistical technique for linear dimensionality reduction',
      },
      {
        id: 'anomaly-detection',
        name: 'Anomaly Detection',
        val: 61,
        category: 'skill',
        description: 'Identifying unusual patterns or outliers in datasets',
      },
      // Secondary nodes for neural networks
      {
        id: 'convolutional-networks',
        name: 'Convolutional Networks',
        val: 75,
        category: 'concept',
        description: 'Neural networks using convolutional layers for image processing',
      },
      {
        id: 'recurrent-networks',
        name: 'Recurrent Networks',
        val: 72,
        category: 'concept',
        description: 'Neural networks with feedback connections for sequential data',
      },
      {
        id: 'backpropagation',
        name: 'Backpropagation',
        val: 68,
        category: 'skill',
        description: 'Algorithm for computing gradients in neural network training',
      },
      {
        id: 'activation-functions',
        name: 'Activation Functions',
        val: 55,
        category: 'concept',
        description: 'Non-linear functions introducing expressiveness to neural networks',
      },
      // Secondary nodes for deep learning
      {
        id: 'transformers',
        name: 'Transformers',
        val: 88,
        category: 'concept',
        description: 'Architecture using attention mechanisms for sequence processing',
      },
      {
        id: 'attention-mechanisms',
        name: 'Attention Mechanisms',
        val: 80,
        category: 'skill',
        description: 'Allowing models to focus on relevant parts of input data',
      },
      {
        id: 'gpu-computing',
        name: 'GPU Computing',
        val: 70,
        category: 'skill',
        description: 'Leveraging graphics processors for accelerating computations',
      },
      {
        id: 'batch-normalization',
        name: 'Batch Normalization',
        val: 58,
        category: 'concept',
        description: 'Technique stabilizing training and improving convergence',
      },
      // Secondary nodes for reinforcement learning
      {
        id: 'q-learning',
        name: 'Q-Learning',
        val: 68,
        category: 'skill',
        description: 'Model-free algorithm for learning optimal action values',
      },
      {
        id: 'policy-gradient',
        name: 'Policy Gradient',
        val: 65,
        category: 'skill',
        description: 'Methods directly optimizing the policy function',
      },
      {
        id: 'markov-decisions',
        name: 'Markov Decision Process',
        val: 62,
        category: 'concept',
        description: 'Mathematical framework for sequential decision making',
      },
      // Secondary nodes for NLP
      {
        id: 'word-embeddings',
        name: 'Word Embeddings',
        val: 72,
        category: 'skill',
        description: 'Representing words as dense vectors in continuous space',
      },
      {
        id: 'language-models',
        name: 'Language Models',
        val: 80,
        category: 'concept',
        description: 'Models predicting probability distributions over text sequences',
      },
      {
        id: 'tokenization',
        name: 'Tokenization',
        val: 55,
        category: 'skill',
        description: 'Breaking text into meaningful units for processing',
      },
      // People/Researchers
      {
        id: 'yann-lecun',
        name: 'Yann LeCun',
        val: 75,
        category: 'person',
        description: 'Pioneer in convolutional neural networks and deep learning',
      },
      {
        id: 'yoshua-bengio',
        name: 'Yoshua Bengio',
        val: 73,
        category: 'person',
        description: 'Leading researcher in deep learning and neural networks',
      },
      {
        id: 'geoffrey-hinton',
        name: 'Geoffrey Hinton',
        val: 76,
        category: 'person',
        description: 'Pioneering work in backpropagation and neural networks',
      },
    ],
    links: [
      // Central to primary concepts
      { source: 'machine-learning', target: 'supervised-learning', value: 15, label: 'includes' },
      { source: 'machine-learning', target: 'unsupervised-learning', value: 15, label: 'includes' },
      { source: 'machine-learning', target: 'neural-networks', value: 16, label: 'uses' },
      { source: 'machine-learning', target: 'deep-learning', value: 14, label: 'advances' },
      { source: 'machine-learning', target: 'reinforcement-learning', value: 12, label: 'includes' },
      { source: 'machine-learning', target: 'nlp', value: 13, label: 'applies-to' },

      // Supervised learning connections
      { source: 'supervised-learning', target: 'regression', value: 12, label: 'technique' },
      { source: 'supervised-learning', target: 'classification', value: 13, label: 'technique' },
      { source: 'supervised-learning', target: 'decision-trees', value: 10, label: 'algorithm' },
      { source: 'supervised-learning', target: 'svm', value: 11, label: 'algorithm' },

      // Unsupervised learning connections
      { source: 'unsupervised-learning', target: 'clustering', value: 12, label: 'technique' },
      { source: 'unsupervised-learning', target: 'dimensionality-reduction', value: 11, label: 'technique' },
      { source: 'unsupervised-learning', target: 'pca', value: 9, label: 'algorithm' },
      { source: 'unsupervised-learning', target: 'anomaly-detection', value: 10, label: 'technique' },

      // Neural networks connections
      { source: 'neural-networks', target: 'convolutional-networks', value: 13, label: 'architecture' },
      { source: 'neural-networks', target: 'recurrent-networks', value: 13, label: 'architecture' },
      { source: 'neural-networks', target: 'backpropagation', value: 14, label: 'training-method' },
      { source: 'neural-networks', target: 'activation-functions', value: 11, label: 'component' },

      // Deep learning connections
      { source: 'deep-learning', target: 'transformers', value: 14, label: 'modern-architecture' },
      { source: 'deep-learning', target: 'attention-mechanisms', value: 13, label: 'technique' },
      { source: 'deep-learning', target: 'gpu-computing', value: 12, label: 'requires' },
      { source: 'deep-learning', target: 'batch-normalization', value: 10, label: 'technique' },

      // Reinforcement learning connections
      { source: 'reinforcement-learning', target: 'q-learning', value: 12, label: 'algorithm' },
      { source: 'reinforcement-learning', target: 'policy-gradient', value: 11, label: 'method' },
      { source: 'reinforcement-learning', target: 'markov-decisions', value: 12, label: 'foundation' },

      // NLP connections
      { source: 'nlp', target: 'word-embeddings', value: 12, label: 'technique' },
      { source: 'nlp', target: 'language-models', value: 14, label: 'primary-approach' },
      { source: 'nlp', target: 'tokenization', value: 10, label: 'preprocessing' },

      // Cross-domain connections
      { source: 'neural-networks', target: 'deep-learning', value: 15, label: 'foundation' },
      { source: 'convolutional-networks', target: 'deep-learning', value: 12, label: 'breakthrough' },
      { source: 'transformers', target: 'attention-mechanisms', value: 14, label: 'uses' },
      { source: 'transformers', target: 'nlp', value: 13, label: 'powers' },
      { source: 'language-models', target: 'transformers', value: 12, label: 'architecture' },
      { source: 'backpropagation', target: 'gradient-descent', value: 11, label: 'enables' },
      { source: 'classification', target: 'convolutional-networks', value: 10, label: 'task' },

      // Researcher connections
      { source: 'yann-lecun', target: 'convolutional-networks', value: 14, label: 'pioneered' },
      { source: 'yann-lecun', target: 'deep-learning', value: 12, label: 'contributed-to' },
      { source: 'yoshua-bengio', target: 'deep-learning', value: 13, label: 'advanced' },
      { source: 'yoshua-bengio', target: 'backpropagation', value: 11, label: 'developed' },
      { source: 'geoffrey-hinton', target: 'backpropagation', value: 13, label: 'pioneered' },
      { source: 'geoffrey-hinton', target: 'neural-networks', value: 12, label: 'founded' },
    ],
  }),

  'web-development': () => ({
    nodes: [
      // Central node
      {
        id: 'web-development',
        name: 'Web Development',
        val: 100,
        category: 'topic',
        description: 'Creating interactive applications and websites for the internet',
      },
      // Primary concepts
      {
        id: 'frontend',
        name: 'Frontend Development',
        val: 85,
        category: 'concept',
        description: 'Building user interfaces and client-side applications',
      },
      {
        id: 'backend',
        name: 'Backend Development',
        val: 83,
        category: 'concept',
        description: 'Server-side logic, databases, and business logic implementation',
      },
      {
        id: 'devops',
        name: 'DevOps',
        val: 75,
        category: 'concept',
        description: 'Infrastructure, deployment, and operations automation',
      },
      {
        id: 'mobile-web',
        name: 'Mobile Web Development',
        val: 72,
        category: 'concept',
        description: 'Building responsive and mobile-optimized web applications',
      },
      {
        id: 'web-performance',
        name: 'Web Performance',
        val: 70,
        category: 'concept',
        description: 'Optimizing speed, efficiency, and user experience metrics',
      },
      {
        id: 'security',
        name: 'Web Security',
        val: 76,
        category: 'concept',
        description: 'Protecting applications and users from vulnerabilities',
      },
      // Frontend sub-nodes
      {
        id: 'html-css',
        name: 'HTML & CSS',
        val: 78,
        category: 'skill',
        description: 'Markup and styling languages for web pages',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        val: 82,
        category: 'skill',
        description: 'Primary programming language for client-side interactivity',
      },
      {
        id: 'react',
        name: 'React',
        val: 75,
        category: 'concept',
        description: 'Library for building dynamic user interfaces with components',
      },
      {
        id: 'vue',
        name: 'Vue.js',
        val: 68,
        category: 'concept',
        description: 'Progressive framework for building user interfaces',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        val: 72,
        category: 'skill',
        description: 'Type-safe superset of JavaScript for large-scale projects',
      },
      // Backend sub-nodes
      {
        id: 'nodejs',
        name: 'Node.js',
        val: 80,
        category: 'concept',
        description: 'JavaScript runtime for server-side development',
      },
      {
        id: 'databases',
        name: 'Databases',
        val: 77,
        category: 'concept',
        description: 'Systems for storing and retrieving structured data',
      },
      {
        id: 'rest-api',
        name: 'REST APIs',
        val: 76,
        category: 'skill',
        description: 'Standard architecture for building web service endpoints',
      },
      {
        id: 'graphql',
        name: 'GraphQL',
        val: 68,
        category: 'concept',
        description: 'Query language for flexible API data fetching',
      },
      {
        id: 'sql',
        name: 'SQL',
        val: 74,
        category: 'skill',
        description: 'Language for querying and managing relational databases',
      },
      // DevOps sub-nodes
      {
        id: 'docker',
        name: 'Docker',
        val: 72,
        category: 'concept',
        description: 'Containerization platform for application deployment',
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        val: 68,
        category: 'concept',
        description: 'Orchestration system for managing containerized applications',
      },
      {
        id: 'ci-cd',
        name: 'CI/CD Pipelines',
        val: 70,
        category: 'skill',
        description: 'Automated testing and deployment workflows',
      },
      // Mobile web sub-nodes
      {
        id: 'responsive-design',
        name: 'Responsive Design',
        val: 66,
        category: 'skill',
        description: 'Adapting layouts to different screen sizes',
      },
      {
        id: 'pwa',
        name: 'Progressive Web Apps',
        val: 65,
        category: 'concept',
        description: 'Web apps with app-like capabilities offline support',
      },
      // Performance sub-nodes
      {
        id: 'optimization',
        name: 'Performance Optimization',
        val: 68,
        category: 'skill',
        description: 'Techniques for improving application speed and efficiency',
      },
      {
        id: 'caching',
        name: 'Caching Strategies',
        val: 62,
        category: 'skill',
        description: 'Storing frequently accessed data for faster retrieval',
      },
      // Security sub-nodes
      {
        id: 'authentication',
        name: 'Authentication',
        val: 70,
        category: 'skill',
        description: 'Verifying user identity through secure mechanisms',
      },
      {
        id: 'encryption',
        name: 'Encryption',
        val: 68,
        category: 'skill',
        description: 'Protecting sensitive data through cryptographic techniques',
      },
      // Tools and frameworks
      {
        id: 'vite',
        name: 'Vite',
        val: 60,
        category: 'concept',
        description: 'Next-generation build tool for fast development',
      },
      {
        id: 'webpack',
        name: 'Webpack',
        val: 58,
        category: 'concept',
        description: 'Module bundler for JavaScript applications',
      },
      {
        id: 'git',
        name: 'Git',
        val: 72,
        category: 'skill',
        description: 'Version control system for code collaboration',
      },
    ],
    links: [
      // Central to primary
      { source: 'web-development', target: 'frontend', value: 15, label: 'includes' },
      { source: 'web-development', target: 'backend', value: 15, label: 'includes' },
      { source: 'web-development', target: 'devops', value: 12, label: 'requires' },
      { source: 'web-development', target: 'mobile-web', value: 11, label: 'includes' },
      { source: 'web-development', target: 'web-performance', value: 12, label: 'prioritizes' },
      { source: 'web-development', target: 'security', value: 13, label: 'requires' },

      // Frontend connections
      { source: 'frontend', target: 'html-css', value: 13, label: 'foundation' },
      { source: 'frontend', target: 'javascript', value: 14, label: 'core-language' },
      { source: 'frontend', target: 'react', value: 12, label: 'popular-framework' },
      { source: 'frontend', target: 'vue', value: 10, label: 'alternative-framework' },
      { source: 'frontend', target: 'typescript', value: 11, label: 'enhances' },
      { source: 'javascript', target: 'typescript', value: 12, label: 'extends' },
      { source: 'react', target: 'vite', value: 10, label: 'uses' },
      { source: 'vue', target: 'vite', value: 9, label: 'integrates-with' },

      // Backend connections
      { source: 'backend', target: 'nodejs', value: 13, label: 'popular-runtime' },
      { source: 'backend', target: 'databases', value: 13, label: 'uses' },
      { source: 'backend', target: 'rest-api', value: 12, label: 'builds' },
      { source: 'backend', target: 'graphql', value: 10, label: 'alternative-to' },
      { source: 'rest-api', target: 'graphql', value: 9, label: 'compared-to' },
      { source: 'databases', target: 'sql', value: 12, label: 'uses' },

      // DevOps connections
      { source: 'devops', target: 'docker', value: 12, label: 'uses' },
      { source: 'devops', target: 'kubernetes', value: 11, label: 'orchestrates-with' },
      { source: 'devops', target: 'ci-cd', value: 13, label: 'automates' },
      { source: 'docker', target: 'kubernetes', value: 11, label: 'works-with' },

      // Mobile web connections
      { source: 'mobile-web', target: 'responsive-design', value: 12, label: 'requires' },
      { source: 'mobile-web', target: 'pwa', value: 11, label: 'emerging-pattern' },

      // Performance connections
      { source: 'web-performance', target: 'optimization', value: 12, label: 'technique' },
      { source: 'web-performance', target: 'caching', value: 11, label: 'strategy' },

      // Security connections
      { source: 'security', target: 'authentication', value: 12, label: 'method' },
      { source: 'security', target: 'encryption', value: 11, label: 'technique' },

      // Build tools
      { source: 'frontend', target: 'webpack', value: 10, label: 'uses' },
      { source: 'nodejs', target: 'git', value: 10, label: 'version-control' },

      // Cross-domain
      { source: 'nodejs', target: 'devops', value: 11, label: 'deployed-via' },
      { source: 'javascript', target: 'nodejs', value: 13, label: 'runtime' },
      { source: 'backend', target: 'ci-cd', value: 10, label: 'automated-by' },
    ],
  }),

  'quantum-computing': () => ({
    nodes: [
      {
        id: 'quantum-computing',
        name: 'Quantum Computing',
        val: 100,
        category: 'topic',
        description: 'Computational systems leveraging quantum mechanical phenomena',
      },
      {
        id: 'quantum-mechanics',
        name: 'Quantum Mechanics',
        val: 88,
        category: 'concept',
        description: 'Physics of matter and energy at atomic and subatomic scales',
      },
      {
        id: 'qubits',
        name: 'Qubits',
        val: 85,
        category: 'concept',
        description: 'Quantum bits that exist in superposition of 0 and 1',
      },
      {
        id: 'quantum-gates',
        name: 'Quantum Gates',
        val: 80,
        category: 'skill',
        description: 'Operations manipulating qubit states in quantum circuits',
      },
      {
        id: 'quantum-algorithms',
        name: 'Quantum Algorithms',
        val: 82,
        category: 'concept',
        description: 'Computational procedures designed for quantum computers',
      },
      {
        id: 'error-correction',
        name: 'Quantum Error Correction',
        val: 75,
        category: 'concept',
        description: 'Protecting quantum information from decoherence errors',
      },
      {
        id: 'quantum-applications',
        name: 'Quantum Applications',
        val: 70,
        category: 'project',
        description: 'Real-world problems solved using quantum computing',
      },
      {
        id: 'superposition',
        name: 'Superposition',
        val: 78,
        category: 'concept',
        description: 'Property of qubits existing in multiple states simultaneously',
      },
      {
        id: 'entanglement',
        name: 'Entanglement',
        val: 76,
        category: 'concept',
        description: 'Correlation between qubits independent of distance',
      },
      {
        id: 'shors-algorithm',
        name: 'Shor Algorithm',
        val: 72,
        category: 'skill',
        description: 'Quantum algorithm for integer factorization efficiently',
      },
      {
        id: 'grovers-algorithm',
        name: 'Grover Algorithm',
        val: 68,
        category: 'skill',
        description: 'Quantum search algorithm providing quadratic speedup',
      },
      {
        id: 'quantum-simulation',
        name: 'Quantum Simulation',
        val: 65,
        category: 'skill',
        description: 'Simulating quantum systems on quantum computers',
      },
      {
        id: 'ibm-quantum',
        name: 'IBM Quantum',
        val: 60,
        category: 'resource',
        description: 'Cloud-based quantum computing platform and services',
      },
      {
        id: 'google-sycamore',
        name: 'Google Sycamore',
        val: 62,
        category: 'resource',
        description: 'Google quantum processor demonstrating quantum supremacy',
      },
      {
        id: 'cryptography',
        name: 'Post-Quantum Cryptography',
        val: 70,
        category: 'skill',
        description: 'Encryption resistant to quantum computing attacks',
      },
      {
        id: 'drug-discovery',
        name: 'Drug Discovery',
        val: 58,
        category: 'project',
        description: 'Quantum simulations accelerating pharmaceutical research',
      },
      {
        id: 'optimization',
        name: 'Combinatorial Optimization',
        val: 64,
        category: 'skill',
        description: 'Solving complex optimization problems quantum speedup',
      },
      {
        id: 'variational-algorithms',
        name: 'Variational Algorithms',
        val: 66,
        category: 'concept',
        description: 'Hybrid quantum-classical algorithms for near-term devices',
      },
      {
        id: 'david-deutsch',
        name: 'David Deutsch',
        val: 70,
        category: 'person',
        description: 'Founder of quantum computing field theoretical physicist',
      },
      {
        id: 'richard-feynman',
        name: 'Richard Feynman',
        val: 72,
        category: 'person',
        description: 'Visionary proposing quantum computers could simulate nature',
      },
    ],
    links: [
      { source: 'quantum-computing', target: 'quantum-mechanics', value: 15, label: 'based-on' },
      { source: 'quantum-computing', target: 'qubits', value: 14, label: 'fundamental-unit' },
      { source: 'quantum-computing', target: 'quantum-gates', value: 13, label: 'uses' },
      { source: 'quantum-computing', target: 'quantum-algorithms', value: 14, label: 'implements' },
      { source: 'quantum-computing', target: 'error-correction', value: 12, label: 'requires' },
      { source: 'quantum-computing', target: 'quantum-applications', value: 11, label: 'enables' },

      { source: 'qubits', target: 'superposition', value: 13, label: 'exhibits' },
      { source: 'qubits', target: 'entanglement', value: 12, label: 'exhibits' },
      { source: 'quantum-gates', target: 'superposition', value: 11, label: 'manipulates' },
      { source: 'quantum-algorithms', target: 'shors-algorithm', value: 12, label: 'includes' },
      { source: 'quantum-algorithms', target: 'grovers-algorithm', value: 11, label: 'includes' },
      { source: 'quantum-algorithms', target: 'quantum-simulation', value: 10, label: 'includes' },
      { source: 'quantum-algorithms', target: 'variational-algorithms', value: 10, label: 'includes' },

      { source: 'shors-algorithm', target: 'cryptography', value: 12, label: 'threatens' },
      { source: 'grovers-algorithm', target: 'optimization', value: 10, label: 'enables' },
      { source: 'quantum-simulation', target: 'drug-discovery', value: 11, label: 'accelerates' },
      { source: 'variational-algorithms', target: 'optimization', value: 11, label: 'solves' },

      { source: 'david-deutsch', target: 'quantum-computing', value: 13, label: 'founded' },
      { source: 'richard-feynman', target: 'quantum-computing', value: 13, label: 'pioneered' },
      { source: 'richard-feynman', target: 'quantum-simulation', value: 11, label: 'proposed' },

      { source: 'ibm-quantum', target: 'quantum-gates', value: 10, label: 'provides' },
      { source: 'google-sycamore', target: 'quantum-supremacy', value: 11, label: 'demonstrates' },
      { source: 'error-correction', target: 'quantum-gates', value: 10, label: 'protects' },
    ],
  }),
}

/**
 * Validates GraphData structure to ensure it's safe for rendering
 * Throws error if validation fails, preventing rendering errors
 */
function validateGraphData(data: GraphData): boolean {
  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error('Invalid graph data: missing or invalid nodes array')
  }

  if (!data.links || !Array.isArray(data.links)) {
    throw new Error('Invalid graph data: missing or invalid links array')
  }

  if (data.nodes.length === 0) {
    throw new Error('Invalid graph data: nodes array is empty')
  }

  // Validate each node
  const nodeIds = new Set<string>()
  for (const node of data.nodes) {
    if (!node.id || typeof node.id !== 'string') {
      throw new Error(`Invalid node: missing or non-string id`)
    }
    if (!node.name || typeof node.name !== 'string') {
      throw new Error(`Invalid node ${node.id}: missing or non-string name`)
    }
    if (typeof node.val !== 'number' || node.val < 0 || node.val > 100) {
      throw new Error(`Invalid node ${node.id}: val must be a number between 0-100`)
    }
    if (!node.category || typeof node.category !== 'string') {
      throw new Error(`Invalid node ${node.id}: missing or non-string category`)
    }

    if (nodeIds.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`)
    }
    nodeIds.add(node.id)
  }

  // Validate each link
  for (const link of data.links) {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (!sourceId || !targetId) {
      throw new Error('Invalid link: source and target must be specified')
    }

    if (!nodeIds.has(sourceId)) {
      throw new Error(`Invalid link: source node ${sourceId} not found in nodes`)
    }

    if (!nodeIds.has(targetId)) {
      throw new Error(`Invalid link: target node ${targetId} not found in nodes`)
    }
  }

  return true
}

/**
 * Mocked API call to generate graph data for a given topic
 * In production, this will call Claude API with the system prompt
 *
 * @param topic - The main topic for the knowledge graph
 * @returns Promise resolving to validated GraphData
 */
export async function fetchGraphData(topic: string): Promise<GraphData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Normalize topic for template lookup
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '-')

  // Get template or generate fallback
  const generator = DUMMY_DATA_TEMPLATES[normalizedTopic]

  let graphData: GraphData
  if (generator) {
    graphData = generator()
  } else {
    // Generate fallback data for unknown topics
    graphData = generateGenericGraphData(topic)
  }

  // Validate before returning
  validateGraphData(graphData)

  return graphData
}

/**
 * Generates generic graph data for topics without specific templates
 * Ensures all data is valid and safe for rendering
 */
function generateGenericGraphData(topic: string): GraphData {
  const centralId = topic.toLowerCase().replace(/\s+/g, '-')

  const primaryConcepts = [
    'Fundamentals',
    'Core Concepts',
    'Applications',
    'Tools & Resources',
    'Advanced Topics',
    'Best Practices',
  ]

  const nodes: GraphNode[] = [
    {
      id: centralId,
      name: topic,
      val: 100,
      category: 'topic',
      description: `Comprehensive knowledge graph for ${topic}`,
    },
  ]

  const links: GraphLink[] = []
  let nodeCounter = 0

  // Create primary concepts
  for (const concept of primaryConcepts) {
    const conceptId = `${centralId}-concept-${nodeCounter}`
    nodeCounter++

    nodes.push({
      id: conceptId,
      name: concept,
      val: 70 + Math.random() * 20,
      category: 'concept',
      description: `${concept} related to ${topic}`,
    })

    links.push({
      source: centralId,
      target: conceptId,
      value: 12,
      label: 'includes',
    })

    // Create sub-concepts
    for (let i = 0; i < 3; i++) {
      const subConceptId = `${centralId}-sub-${nodeCounter}`
      nodeCounter++

      nodes.push({
        id: subConceptId,
        name: `${concept} Detail ${i + 1}`,
        val: 40 + Math.random() * 30,
        category: 'concept',
        description: `Specific aspect of ${concept}`,
      })

      links.push({
        source: conceptId,
        target: subConceptId,
        value: 10,
        label: 'includes',
      })
    }
  }

  return { nodes, links }
}

/**
 * Configuration object for API integration
 * Update these values when connecting to real Claude API
 */
export const API_CONFIG = {
  // System prompt to be used with Claude API
  systemPrompt: KNOWLEDGE_GRAPH_SYSTEM_PROMPT,

  // API endpoint (update when implementing real API)
  endpoint: 'https://api.anthropic.com/v1/messages',

  // Model to use with Claude
  model: 'claude-3-5-sonnet-20241022',

  // Maximum tokens for response
  maxTokens: 4096,

  // Temperature for response variety
  temperature: 0.7,

  // Timeout for API calls in milliseconds
  timeout: 30000,
}

/**
 * Type definition for Claude API response
 * Will be used when implementing real API integration
 */
export interface ClaudeAPIResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Parses JSON response from Claude ensuring validity
 * Implements anti-hallucination checks
 */
export function parseGraphDataResponse(response: string): GraphData {
  try {
    const data = JSON.parse(response)

    // Validate structure
    validateGraphData(data)

    return data as GraphData
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON response from Claude: ${error.message}. Ensure system prompt enforces strict JSON output.`
      )
    }
    throw error
  }
}
