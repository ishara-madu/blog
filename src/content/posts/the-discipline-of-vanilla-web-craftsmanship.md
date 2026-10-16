---
title: "The Discipline of Vanilla-First Web Engineering in an Era of Framework Bloat"
excerpt: "Examining what happens when an engineering team drops runtime JS dependencies in favor of modern CSS, web standards, and server-rendered HTML."
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80"
coverAlt: "Clean developer workspace displaying modern code on screen"
category: "Software Architecture"
categorySlug: "architecture"
categoryColor: "bg-blue-500"
publishedAt: "October 1, 2026"
readTime: "9 min read"
author:
  name: "Kasun Perera"
  role: "Principal Systems Architect"
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  handle: "@kasunp"
  bio: "Designs distributed storage engines, low-latency consensus protocols, and resilient multi-region infrastructure. Previously tech lead on edge data topologies."
tags:
  - "Web Standards"
  - "Performance"
  - "HTML & CSS"
  - "Clean Code"
---

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
