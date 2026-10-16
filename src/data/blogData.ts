export interface Author {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
}

export interface TocItem {
  id: string;
  title: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  trending?: boolean;
  author: Author;
  tags: string[];
  toc?: TocItem[];
  content: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  count: number;
  color: string;
  icon: string;
}

export const authors: Record<string, Author> = {
  kasun: {
    name: 'Kasun Perera',
    role: 'Principal Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    handle: '@kasunp',
    bio: 'Designs distributed storage engines, low-latency consensus protocols, and resilient multi-region infrastructure. Previously tech lead on edge data topologies.',
  },
  dilini: {
    name: 'Dilini Jayawardena',
    role: 'Staff AI Research Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    handle: '@dilinij',
    bio: 'Specializes in small language model quantization, speculative decoding, and deploying on-device neural reasoning engines on commodity hardware.',
  },
  nuwan: {
    name: 'Nuwan Senanayake',
    role: 'Lead Product Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    handle: '@nuwans',
    bio: 'Researches minimalist user interfaces, typographic density, and content-first web software. Advocate for durable design systems without cosmetic churn.',
  },
  amali: {
    name: 'Amali Fernando',
    role: 'Cloud Infrastructure Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    handle: '@amalif',
    bio: 'Directs cloud platform reliability, microVM security isolation, and developer experience for distributed engineering organizations.',
  },
};

export const categories: Category[] = [
  {
    name: 'Technology & AI',
    slug: 'technology-ai',
    description: 'Artificial intelligence frontiers, autonomous systems, and compute foundations.',
    count: 18,
    color: 'bg-emerald-500',
    icon: 'cpu',
  },
  {
    name: 'Software Architecture',
    slug: 'architecture',
    description: 'Distributed systems, zero-trust infrastructure, and low-latency topologies.',
    count: 24,
    color: 'bg-blue-500',
    icon: 'git-merge',
  },
  {
    name: 'Product & Design',
    slug: 'design',
    description: 'Typographic balance, human-centered interfaces, and modern design systems.',
    count: 12,
    color: 'bg-purple-500',
    icon: 'paint-brush-broad',
  },
  {
    name: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'Kubernetes at edge, continuous delivery pipelines, and serverless architectures.',
    count: 15,
    color: 'bg-amber-500',
    icon: 'cloud-check',
  },
  {
    name: 'Engineering Culture',
    slug: 'culture',
    description: 'Software craftsmanship, deliberate thinking, and high-agency engineering teams.',
    count: 9,
    color: 'bg-rose-500',
    icon: 'users-three',
  },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    slug: 'future-of-multimodal-edge-ai-models',
    title: 'The Rise of Compact Multimodal Reasoning Models on Local Edge Hardware',
    excerpt: 'How sub-4-billion parameter language and vision models are outperforming massive centralized cloud clusters in latency, privacy, and contextual reasoning.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85',
    coverAlt: 'Abstract neural network and computational geometry representing next-generation AI',
    category: 'Technology & AI',
    categorySlug: 'technology-ai',
    categoryColor: 'bg-emerald-500',
    publishedAt: 'October 15, 2026',
    readTime: '8 min read',
    featured: true,
    author: authors.dilini,
    tags: ['Artificial Intelligence', 'Edge Compute', 'Transformers', 'Optimization'],
    toc: [
      { id: 'the-cloud-latency-bottleneck', title: 'The Cloud Latency Bottleneck' },
      { id: 'quantization-and-speculative-decoding', title: 'Quantization & Speculative Decoding' },
      { id: 'edge-hardware-benchmarks', title: 'Real-World Edge Hardware Benchmarks' },
      { id: 'architectural-patterns', title: 'Key Architectural Takeaways' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        For the past three years, the dominant paradigm in artificial intelligence has assumed that bigger is strictly better. Monolithic frontier models with hundreds of billions of parameters were hosted in centralized mega-clusters, requiring high-bandwidth fiber connections and imposing unavoidable network latency overheads.
      </p>

      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        However, in production environments where sub-50ms roundtrip interaction is imperative, roundtripping queries to a distant datacenter creates an inescapable physical barrier. Recent breakthroughs in synthetic curriculum pre-training, parameter pruning, and int4/int2 quantization are proving that compact 3B–7B parameter models can achieve reasoning parity for 85% of practical domain-specific tasks.
      </p>

      <h2 id="the-cloud-latency-bottleneck" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Cloud Latency Bottleneck
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        When an edge device transmits sensor or multimodal camera streams over cellular or wide-area networks to an API endpoint, the TCP handshake, TLS negotiation, queueing delay, and inference decoding stack up exponentially:
      </p>

      <div class="my-8 rounded-lg border border-neutral-200 bg-neutral-100/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/40">
        <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white mb-3">
          Latency Breakdown: Cloud API vs Local Edge
        </h4>
        <div class="space-y-3 text-xs font-mono">
          <div class="flex justify-between border-b border-neutral-200/80 pb-2 dark:border-neutral-800">
            <span class="text-neutral-600 dark:text-neutral-400">DNS & TCP / TLS Handshake</span>
            <span class="text-neutral-900 dark:text-white font-semibold">45ms – 120ms</span>
          </div>
          <div class="flex justify-between border-b border-neutral-200/80 pb-2 dark:border-neutral-800">
            <span class="text-neutral-600 dark:text-neutral-400">Payload Serialization & Transit</span>
            <span class="text-neutral-900 dark:text-white font-semibold">30ms – 80ms</span>
          </div>
          <div class="flex justify-between border-b border-neutral-200/80 pb-2 dark:border-neutral-800">
            <span class="text-neutral-600 dark:text-neutral-400">Cloud Batch Queueing & Scheduling</span>
            <span class="text-neutral-900 dark:text-white font-semibold">150ms – 400ms</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">Local Edge Unified Memory Inference</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 14ms Total</span>
          </div>
        </div>
      </div>

      <h2 id="quantization-and-speculative-decoding" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        2. Quantization & Speculative Decoding
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        The key unlocking edge deployment is structured weight quantization without perplexity degradation. By adopting group-wise AWQ (Activation-aware Weight Quantization), weights are stored in 4-bit precision while retaining FP16 for sensitive activation outliers.
      </p>

      <blockquote class="my-8 border-l-2 border-neutral-950 pl-6 italic text-neutral-800 dark:border-white dark:text-neutral-200">
        "Moving compute directly to the physical locus of data generation eliminates transmission costs, preserves customer privacy covenants, and delivers deterministic responsiveness."
      </blockquote>

      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Combined with speculative drafting—where a 0.5B draft model quickly predicts a sequence of tokens that is subsequently verified in a single forward pass by the 4B target model—token throughput on Apple Silicon and Snapdragon chips exceeds 65 tokens per second.
      </p>

      <h2 id="edge-hardware-benchmarks" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        3. Real-World Edge Hardware Benchmarks
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Below is a simplified architecture snippet in TypeScript showing an edge worker dispatching to a local ONNX runtime kernel:
      </p>

      <pre class="my-6 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-900 p-4 font-mono text-xs text-neutral-100 dark:border-neutral-800"><code>// Edge execution handler utilizing unified memory pipeline
import { Tensor, InferenceSession } from '@edge/runtime';

export async function processVisualInference(inputTensor: Tensor): Promise&lt;InferenceResult&gt; {
  const session = await InferenceSession.create('./models/compact-reasoner-q4.onnx', {
    executionProviders: ['coreml', 'nnapi'],
    enableMemPattern: true,
  });

  const startTime = performance.now();
  const output = await session.run({ input_ids: inputTensor });
  const latencyMs = performance.now() - startTime;

  return {
    tokens: output.logits.data,
    latencyMs,
    edgeDeterministic: true,
  };
}</code></pre>

      <h2 id="architectural-patterns" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        4. Key Architectural Takeaways
      </h2>
      <ul class="my-6 space-y-3 text-base leading-relaxed text-neutral-700 dark:text-neutral-300 list-disc pl-6">
        <li><strong>Data Gravity:</strong> Compute should always gravitate toward where user events and video frames originate, rather than backhauling petabytes to centralized storage.</li>
        <li><strong>Privacy by Default:</strong> Edge inference guarantees sensitive audio and visual biometric tokens never leave the user's hardware boundary.</li>
        <li><strong>Offline Survivability:</strong> Systems designed for local reasoning remain fully operational when cellular networks or undersea cables degrade.</li>
      </ul>
    `,
  },
  {
    id: 'post-2',
    slug: 'zero-latency-edge-sqlite-topologies',
    title: 'Designing Globally Replicated SQLite Clusters with Sub-5ms Read Latencies',
    excerpt: 'A practical deep-dive into embedded database replication across thirty global regions, resolving read replicas without cross-ocean RPC overhead.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'High-density enterprise server racks in a modern data center',
    category: 'Software Architecture',
    categorySlug: 'architecture',
    categoryColor: 'bg-blue-500',
    publishedAt: 'October 13, 2026',
    readTime: '11 min read',
    trending: true,
    author: authors.kasun,
    tags: ['Distributed SQL', 'SQLite', 'Edge Architecture', 'Replication'],
    toc: [
      { id: 'the-fallacy-of-central-databases', title: 'The Fallacy of Central Databases' },
      { id: 'wal-frame-shipping', title: 'WAL Frame Streaming Mechanics' },
      { id: 'read-your-own-writes', title: 'Guaranteeing Read-Your-Own-Writes' },
      { id: 'production-guidelines', title: 'Production Guidelines' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        For two decades, web software followed a standard three-tier pattern: stateless application workers talking over TCP to a single primary relational database cluster in us-east-1. As edge runtimes brought compute nodes to within 10ms of users worldwide, this database architecture became the single biggest bottleneck.
      </p>

      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        In this paper, we document our experience replacing centralized PostgreSQL query hops with locally embedded SQLite read replicas synchronized over a lightweight Raft consensus stream.
      </p>

      <h2 id="the-fallacy-of-central-databases" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Fallacy of Central Databases
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        When an end-user in Singapore hits a serverless edge node in Tokyo, and that worker has to execute five relational queries against a database in Northern Virginia, the speed of light in fiber dictates a minimum 180ms roundtrip per query. Even with connection pooling, latency accumulates mercilessly.
      </p>

      <h2 id="wal-frame-shipping" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        2. WAL Frame Streaming Mechanics
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        SQLite writes state sequentially to a Write-Ahead Log (WAL). Instead of distributing complex SQL AST statements, our replication orchestrator captures raw 4096-byte WAL page frames as they are committed on the write primary and pushes them down a persistent WebSocket mesh to all regional read replicas.
      </p>

      <blockquote class="my-8 border-l-2 border-neutral-950 pl-6 italic text-neutral-800 dark:border-white dark:text-neutral-200">
        "Because read queries touch an in-process file or shared memory segment via C-bindings, query latency drops from 120ms to 0.4 milliseconds."
      </blockquote>

      <h2 id="read-your-own-writes" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        3. Guaranteeing Read-Your-Own-Writes
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Eventual consistency is unacceptable for user profile updates or shopping cart actions. We resolved this by injecting the committed transaction sequence number (LSN) into the client's session cookie. If a replica has not yet caught up to the cookie's LSN, it awaits the microsecond frame sync or routes that single read to the primary.
      </p>
    `,
  },
  {
    id: 'post-3',
    slug: 'minimalist-design-systems-that-survive-scale',
    title: 'Content-First Typographic Hierarchy: Designing Interfaces That Outlast Redesigns',
    excerpt: 'Why eliminating excessive containers, nested card borders, and gratuitous motion elevates content legibility and reduces cognitive strain for power users.',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'Architectural drafting workspace with clean typography and layout books',
    category: 'Product & Design',
    categorySlug: 'design',
    categoryColor: 'bg-purple-500',
    publishedAt: 'October 10, 2026',
    readTime: '6 min read',
    trending: true,
    author: authors.nuwan,
    tags: ['Design Systems', 'Typography', 'Minimalism', 'Information Architecture'],
    toc: [
      { id: 'the-problem-of-card-fatigue', title: 'The Problem of Card Fatigue' },
      { id: 'structural-whitespace', title: 'Whitespace as Structural Architecture' },
      { id: 'durable-typography', title: 'Principles for Durable Design Systems' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        Modern web design suffers from an epidemic of over-containment. When every headline, metric, paragraph, and button is trapped inside nested boxes with thick borders and colored pills, the human eye spends more energy navigating visual barriers than assimilating ideas.
      </p>

      <h2 id="the-problem-of-card-fatigue" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Problem of Card Fatigue
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Cards were originally designed for standalone modular entities like playing cards or product listings on an e-commerce shelf. When applied indiscriminately to articles, FAQ items, and dashboards, they create visual fragmentation and wasted horizontal space.
      </p>

      <h2 id="structural-whitespace" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        2. Whitespace as Structural Architecture
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        By removing borders and using proportional vertical padding (such as 32px or 48px increments), content groups naturally delineate themselves through Gestalt proximity principles. The result is an unhurried, editorial reading experience reminiscent of classic physical journals.
      </p>
    `,
  },
  {
    id: 'post-4',
    slug: 'hardening-ephemeral-kubernetes-clusters',
    title: 'Ephemeral CI/CD Runners: Zero-Trust Isolation for Mission-Critical Builds',
    excerpt: 'How we transitioned from static build servers to single-use microVM clusters, preventing lateral credential leaks and cutting deployment times in half.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'Global digital network connectivity over illuminated planet earth',
    category: 'Cloud & DevOps',
    categorySlug: 'cloud-devops',
    categoryColor: 'bg-amber-500',
    publishedAt: 'October 6, 2026',
    readTime: '7 min read',
    trending: true,
    author: authors.amali,
    tags: ['Kubernetes', 'Zero Trust', 'DevOps', 'Security'],
    toc: [
      { id: 'the-static-runner-threat', title: 'The Vulnerability of Static Runners' },
      { id: 'microvm-orchestration', title: 'Single-Use MicroVM Architecture' },
      { id: 'measurable-security-gains', title: 'Measurable Security & Speed Gains' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        Build infrastructure is often the most privileged and least scrutinized attack surface in modern software enterprises. A compromised third-party npm or PyPI dependency executing in a continuous integration environment can extract long-lived production secrets if runners persist across builds.
      </p>

      <h2 id="the-static-runner-threat" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Vulnerability of Static Runners
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        When dozens of engineers run scripts on shared worker nodes, residual files in /tmp, Docker socket bindings, and memory dumps create avenues for cross-job exfiltration.
      </p>

      <h2 id="microvm-orchestration" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        2. Single-Use MicroVM Architecture
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        By utilizing Linux KVM and Firecracker microVMs booted in under 120ms with read-only root filesystems, every PR and build job runs in total hardware-enforced isolation and vanishes the instant the command returns.
      </p>
    `,
  },
  {
    id: 'post-5',
    slug: 'the-discipline-of-vanilla-web-craftsmanship',
    title: 'The Discipline of Vanilla-First Web Engineering in an Era of Framework Bloat',
    excerpt: 'Examining what happens when an engineering team drops runtime JS dependencies in favor of modern CSS, web standards, and server-rendered HTML.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'Clean developer workspace displaying modern code on screen',
    category: 'Software Architecture',
    categorySlug: 'architecture',
    categoryColor: 'bg-blue-500',
    publishedAt: 'October 1, 2026',
    readTime: '9 min read',
    author: authors.kasun,
    tags: ['Web Standards', 'Performance', 'HTML & CSS', 'Clean Code'],
    toc: [
      { id: 'framework-overhead', title: 'The Hidden Cost of Runtime Frameworks' },
      { id: 'modern-platform-power', title: 'The Expressive Power of the Modern Web Platform' },
      { id: 'sustainable-shipping', title: 'Sustainable Shipping Velocity' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        Browser engines in 2026 are extraordinarily capable execution environments. Features that previously required hundreds of kilobytes of third-party JavaScript libraries—such as CSS grid, subgrid, container queries, native dialogs, and popovers—are now universal baseline web standards.
      </p>

      <h2 id="framework-overhead" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Hidden Cost of Runtime Frameworks
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        When an application ships 500KB of vendor JavaScript before rendering a paragraph of text, users on mobile devices suffer high interaction-to-next-paint (INP) delays and significant battery drain.
      </p>

      <h2 id="modern-platform-power" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        2. The Expressive Power of the Modern Web Platform
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        By embracing server-rendered HTML via Astro and pure CSS styling, page load times plummet to under 150ms globally with perfect 100/100 Lighthouse performance scores.
      </p>
    `,
  },
  {
    id: 'post-6',
    slug: 'autonomous-agents-in-production-codebases',
    title: 'Lessons from Deploying Autonomous Coding Agents Across 50+ Internal Repos',
    excerpt: 'Real-world benchmarks, safety guardrails, and architectural guardrails when integrating generative agents into everyday development workflows.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'Digital matrix code and analytical data streaming in cyberspace',
    category: 'Technology & AI',
    categorySlug: 'technology-ai',
    categoryColor: 'bg-emerald-500',
    publishedAt: 'September 27, 2026',
    readTime: '10 min read',
    author: authors.dilini,
    tags: ['AI Agents', 'Automation', 'Developer Tooling', 'CI/CD'],
    toc: [
      { id: 'agent-capabilities', title: 'Current Autonomous Agent Capabilities' },
      { id: 'safety-guardrails', title: 'Determinism and Sandboxing' },
      { id: 'the-human-in-the-loop', title: 'The Human Architect in the Loop' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        Autonomous coding agents have moved from experimental curiosities to integral members of engineering teams. However, treating AI agents as autonomous committers without strict sandboxing and automated validation leads to subtle architectural degradation.
      </p>

      <h2 id="agent-capabilities" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. Current Autonomous Agent Capabilities
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Agents excel at mechanical refactoring, writing comprehensive unit tests, upgrading dependency schemas, and finding edge cases in concurrent logic.
      </p>
    `,
  },
  {
    id: 'post-7',
    slug: 'deliberate-engineering-culture-and-craft',
    title: 'The Lost Art of Deliberate Software Craftsmanship',
    excerpt: 'Why high-performing engineering teams prioritize deep, unhurried focus, architectural clarity, and lasting stability over frantic release sprints.',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80',
    coverAlt: 'Quiet workspace with notebook, laptop, and cup of coffee representing deliberate focus',
    category: 'Engineering Culture',
    categorySlug: 'culture',
    categoryColor: 'bg-rose-500',
    publishedAt: 'September 20, 2026',
    readTime: '5 min read',
    author: authors.nuwan,
    tags: ['Engineering Culture', 'Craftsmanship', 'Leadership', 'Focus'],
    toc: [
      { id: 'the-speed-trap', title: 'The Trap of Superficial Velocity' },
      { id: 'deep-work', title: 'Cultivating Uninterrupted Thinking Time' },
      { id: 'craft-principles', title: 'Principles of Software Craftsmanship' },
    ],
    content: `
      <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6 font-normal">
        The technology industry frequently conflates movement with progress. Teams celebrate ticket velocity and daily deployment counts while accumulating colossal architectural debt that eventually brings feature development to a crawl.
      </p>

      <h2 id="the-speed-trap" class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-12 mb-4">
        1. The Trap of Superficial Velocity
      </h2>
      <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
        Shipping quickly without deep understanding guarantees that the next team will spend five times as long debugging production incidents. True engineering excellence requires deliberate, contemplative design.
      </p>
    `,
  },
];
