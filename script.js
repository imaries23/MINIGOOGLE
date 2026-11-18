/**
 * ============================================================================
 * MINIGOOGLE '98 — CORE SEARCH ENGINE ENGINE & VISUALIZER
 *
 * Implements two distinct generations of search engine algorithms:
 * 1. Mode A: Pre-Google (1997) Classic Keyword Search
 *    - Tokenization, Term Frequency (TF), Keyword Density, Zero Link Analysis.
 * 2. Mode B: Google (1998) PageRank Algorithm
 *    - Iterative Random Surfer Model: PR(A) = (1-d) + d * Σ(PR(T)/C(T))
 *    - Graph link authority combined with keyword relevance.
 *    - Zero-relevance exclusion rule.
 * 3. 1997 vs 1998 Side-by-Side Comparison Engine.
 * 4. Interactive SVG Link Network Graph & Step-by-Step Convergence.
 * 5. Vintage 1998 Web Browser Simulator.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. PREDEFINED WEBSITE DATASET
     (Kept strictly separate from ranking algorithms)
     ========================================================================== */
  const websites = [
    {
      page: 1,
      url: "http://pune-food-guide.com",
      text: "Where to eat in Pune - vada pav and biryani and pizza",
      links_to: [2]
    },
    {
      page: 2,
      url: "http://best-pizza-pune.com",
      text: "Fresh wood-fired pizza made daily - try our cheese pizza",
      links_to: [1, 3]
    },
    {
      page: 3,
      url: "http://college-canteen-blog.com",
      text: "Student reviews of canteen food and chai and Friday pizza",
      links_to: [2, 4]
    },
    {
      page: 4,
      url: "http://pizza-recipes-home.com",
      text: "Make pizza at home - pizza dough and pizza sauce",
      links_to: [2]
    },
    {
      page: 5,
      url: "http://cheap-eats-pune.com",
      text: "Good food under 100 rupees - misal and dosa and pizza slices",
      links_to: [2]
    },
    {
      page: 6,
      url: "http://pizza-pizza-pizza.com",
      text: "pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza",
      links_to: [1]
    }
  ];

  // Metadata mapping for titles and rich 1998 page simulation
  const websiteMetadata = {
    1: {
      title: "Pune Food Guide - Where to Eat in Pune",
      author: "Rahul's Pune Culinary Gazette",
      snippetPrefix: "The definitive guide to authentic street food and restaurants across Pune...",
      theme: "guide"
    },
    2: {
      title: "Best Pizza Pune - Wood-Fired Pizzeria",
      author: "Luigi & Anand Artisan Kitchen",
      snippetPrefix: "Handcrafted Italian sourdough pizzas baked in our authentic wood oven...",
      theme: "pizza-pro"
    },
    3: {
      title: "College Canteen Food Review Blog",
      author: "COEP Student Council Gazette '98",
      snippetPrefix: "Unfiltered hostel student reviews of local canteen breakfast, tea and Friday specials...",
      theme: "blog"
    },
    4: {
      title: "Make Pizza at Home - Dough & Sauce Secrets",
      author: "Auntie Maya's Home Cooking Tips",
      snippetPrefix: "Learn how to ferment the ultimate pizza dough and simmer rich herb tomato sauce...",
      theme: "recipes"
    },
    5: {
      title: "Cheap Eats Pune - Meals Under 100 Rupees",
      author: "Budget Backpacker India '98",
      snippetPrefix: "Pocket-friendly culinary wonders: spicy misal pav, crispy masala dosa, and budget slices...",
      theme: "budget"
    },
    6: {
      title: "PIZZA PIZZA PIZZA - The Ultimate Pizza Site!",
      author: "SpamMaster_98 Web Enterprises",
      snippetPrefix: "pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza...",
      theme: "spam"
    }
  };

  /* ==========================================================================
     2. GLOBAL APPLICATION STATE & SETTINGS
     ========================================================================== */
  const AppState = {
    currentQuery: '',
    searchMode: 'pagerank', // 'classic' (1997), 'pagerank' (1998), 'comparison'
    sortBy: 'score',        // 'score', 'pagerank', 'frequency', 'density', 'title'
    dampingFactor: 0.85,    // Standard Google 1998 damping factor d
    weightRelevance: 0.50,  // 50% keyword relevance
    weightPageRank: 0.50,   // 50% link authority PageRank
    maxIterations: 30,
    convergenceThreshold: 0.000001,
    history: [],
    selectedGraphNodeId: null,
    cachedPageRank: null,   // Will hold computed PR values & iteration trace
    browserHistory: [],
    browserHistoryIndex: -1
  };

  /* ==========================================================================
     3. TEXT PROCESSING & TOKENIZATION UTILITIES
     ========================================================================== */

  /**
   * Tokenizes text into lowercase alphanumeric words.
   * Strips out punctuation and symbols.
   * @param {string} text - Raw string
   * @returns {string[]} Array of token strings
   */
  function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    const matches = text.toLowerCase().match(/[a-z0-9]+/g);
    return matches || [];
  }

  /**
   * Highlights matched query keywords inside text using <mark> tags.
   * @param {string} text - Original snippet
   * @param {string[]} queryTokens - Query tokens to highlight
   * @returns {string} HTML string with highlights
   */
  function highlightMatches(text, queryTokens) {
    if (!queryTokens || queryTokens.length === 0) return escapeHTML(text);
    const escapedTokens = queryTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTokens.join('|')})\\b`, 'gi');
    return escapeHTML(text).replace(regex, '<mark>$1</mark>');
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     4. ALGORITHM 1: PRE-GOOGLE CLASSIC KEYWORD SEARCH (MODE A - 1997)
     ==========================================================================
     Simulates search engines of 1995-1997 (AltaVista, Lycos, WebCrawler).
     Ranking is solely driven by:
     - Keyword frequency (TF): how often terms repeat.
     - Keyword density: (TF / total words).
     - Distinct matching terms.
     Does NOT use incoming or outgoing hyperlinks.
     Vulnerable to keyword stuffing!
     ========================================================================== */

  /**
   * Computes Classic Keyword Search metrics and ranking for a query.
   * @param {string} query - Raw user search query
   * @param {Array} dataset - Array of website objects
   * @returns {Array} Ranked list of results with transparent metrics
   */
  function computeClassicKeywordSearch(query, dataset) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const results = [];

    dataset.forEach(site => {
      const pageTokens = tokenize(site.text);
      const totalWords = pageTokens.length;

      // Count term frequencies
      let totalKeywordFrequency = 0;
      let matchingKeywordsCount = 0;
      const termBreakdown = {};

      queryTokens.forEach(token => {
        let count = 0;
        for (let i = 0; i < pageTokens.length; i++) {
          if (pageTokens[i] === token) count++;
        }
        termBreakdown[token] = count;
        totalKeywordFrequency += count;
        if (count > 0) matchingKeywordsCount++;
      });

      // If page has zero matching keywords, it is not relevant
      if (totalKeywordFrequency === 0) {
        return;
      }

      // Keyword density calculation
      const keywordDensity = totalWords > 0 ? (totalKeywordFrequency / totalWords) : 0;

      // Transparent scoring formula:
      // - Frequency carries major weight
      // - Density rewards concise pages (or keyword stuffed pages!)
      // - Breadth bonus for pages containing multiple query words
      const rawScore = (totalKeywordFrequency * 10) +
                       (keywordDensity * 100) +
                       (matchingKeywordsCount * 5);

      results.push({
        page: site.page,
        url: site.url,
        title: websiteMetadata[site.page]?.title || site.url,
        text: site.text,
        links_to: site.links_to,
        totalWords: totalWords,
        keywordFrequency: totalKeywordFrequency,
        keywordDensity: keywordDensity,
        matchingKeywordsCount: matchingKeywordsCount,
        termBreakdown: termBreakdown,
        rawScore: rawScore,
        mode: 'classic'
      });
    });

    // Normalize scores to [0, 100] for display
    const maxScore = results.reduce((max, r) => Math.max(max, r.rawScore), 0);
    results.forEach(r => {
      r.normalizedScore = maxScore > 0 ? (r.rawScore / maxScore) * 100 : 0;
      r.finalScore = r.rawScore; // Classic mode uses raw formula score
    });

    // Sort descending by raw score
    results.sort((a, b) => b.rawScore - a.rawScore);

    // Assign ranking positions
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return results;
  }

  /* ==========================================================================
     5. ALGORITHM 2: GOOGLE PAGERANK COMPUTATION & HYBRID SEARCH (MODE B - 1998)
     ==========================================================================
     Iterative PageRank algorithm based on the 1998 Stanford paper:
     "The Anatomy of a Large-Scale Hypertextual Web Search Engine"
     by Sergey Brin and Lawrence Page.

     PR(A) = (1 - d) + d * Σ [ PR(T) / C(T) ]
     Where:
     - PR(A) = PageRank of page A
     - d     = damping factor (default 0.85)
     - PR(T) = PageRank of page T linking to A
     - C(T)  = Out-degree (number of outgoing links from T)
     ========================================================================== */

  /**
   * Computes PageRank across the entire web graph iteratively.
   * Runs for maxIterations or until convergence.
   * Records step-by-step iteration trace for visualization.
   * @param {Array} dataset - Full dataset of website objects
   * @param {number} damping - Damping factor d (0 to 1)
   * @returns {Object} { pageRankMap, normalizedMap, inLinksMap, outDegreesMap, iterationTrace }
   */
  function computePageRank(dataset, damping = 0.85) {
    const N = dataset.length;
    const inLinksMap = {};
    const outDegreesMap = {};
    const pageIds = dataset.map(s => s.page);

    // Initialize mapping structures
    pageIds.forEach(id => {
      inLinksMap[id] = [];
      outDegreesMap[id] = 0;
    });

    // Build incoming links graph and calculate out-degrees
    dataset.forEach(site => {
      const srcId = site.page;
      const targets = site.links_to || [];
      outDegreesMap[srcId] = targets.length;

      targets.forEach(targetId => {
        if (inLinksMap[targetId]) {
          inLinksMap[targetId].push(srcId);
        }
      });
    });

    // Initialize PageRank for all pages to 1.0 (standard 1998 research baseline)
    let currentPR = {};
    pageIds.forEach(id => {
      currentPR[id] = 1.0;
    });

    const iterationTrace = [];
    // Record Iteration 0
    iterationTrace.push({ iteration: 0, ranks: { ...currentPR } });

    // Iterative power method
    for (let it = 1; it <= AppState.maxIterations; it++) {
      const nextPR = {};
      let maxDelta = 0;

      pageIds.forEach(id => {
        // Compute sum of PR(T) / C(T) for all incoming pages T
        let incomingContribution = 0;
        const incomingPages = inLinksMap[id];

        incomingPages.forEach(srcId => {
          const outDegree = outDegreesMap[srcId];
          if (outDegree > 0) {
            incomingContribution += currentPR[srcId] / outDegree;
          }
        });

        // PR(A) = (1 - d) + d * Σ(PR(T) / C(T))
        const newRank = (1 - damping) + (damping * incomingContribution);
        nextPR[id] = newRank;

        const delta = Math.abs(newRank - currentPR[id]);
        if (delta > maxDelta) maxDelta = delta;
      });

      currentPR = nextPR;
      iterationTrace.push({ iteration: it, ranks: { ...currentPR }, maxDelta });

      if (maxDelta < AppState.convergenceThreshold) {
        break;
      }
    }

    // Normalize PageRank values relative to maximum (0 to 100 scale)
    const maxPR = Math.max(...Object.values(currentPR));
    const normalizedMap = {};
    pageIds.forEach(id => {
      normalizedMap[id] = maxPR > 0 ? (currentPR[id] / maxPR) * 100 : 0;
    });

    return {
      pageRankMap: currentPR,
      normalizedMap: normalizedMap,
      inLinksMap: inLinksMap,
      outDegreesMap: outDegreesMap,
      iterationTrace: iterationTrace,
      dampingFactor: damping
    };
  }

  /**
   * Computes Google PageRank Search (Mode B) for a query.
   * Combines keyword relevance score (e.g. 50%) and PageRank score (e.g. 50%).
   * CRITICAL REQUIREMENT:
   * "Important: Pages with zero keyword relevance should not rank merely because of backlinks."
   * @param {string} query - Raw search query
   * @param {Array} dataset - Website dataset
   * @param {Object} prData - Computed PageRank data
   * @returns {Array} Ranked list of results
   */
  function computeGooglePageRankSearch(query, dataset, prData) {
    // First, obtain keyword metrics using classic tokenization
    const classicResults = computeClassicKeywordSearch(query, dataset);
    if (classicResults.length === 0) return [];

    // Filtered already: classicResults ONLY contains pages with keywordFrequency > 0!
    // This strictly guarantees that pages with 0 keyword relevance never rank merely due to backlinks.

    // Find maximum keyword score among matched pages for normalization
    const maxKeywordScore = classicResults.reduce((max, r) => Math.max(max, r.rawScore), 0);

    const wRel = AppState.weightRelevance;
    const wPR = AppState.weightPageRank;

    const results = classicResults.map(item => {
      const pageId = item.page;
      const rawPR = prData.pageRankMap[pageId] || (1 - prData.dampingFactor);
      const normPR = prData.normalizedMap[pageId] || 0;

      // Normalize keyword relevance to [0, 100]
      const normKeyword = maxKeywordScore > 0 ? (item.rawScore / maxKeywordScore) * 100 : 0;

      // Combined formula:
      // Score = w_relevance * RelevanceNorm + w_PageRank * PageRankNorm
      const combinedScore = (wRel * normKeyword) + (wPR * normPR);

      return {
        ...item,
        rawPageRank: rawPR,
        normalizedPageRank: normPR,
        normalizedKeyword: normKeyword,
        finalScore: combinedScore,
        incomingLinksCount: (prData.inLinksMap[pageId] || []).length,
        incomingLinksSources: prData.inLinksMap[pageId] || [],
        mode: 'pagerank'
      };
    });

    // Sort descending by combined final score
    results.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return results;
  }

  /* ==========================================================================
     6. ALGORITHM 3: 1997 VS 1998 SIDE-BY-SIDE COMPARISON ENGINE
     ========================================================================== */

  /**
   * Computes both rankings simultaneously and calculates movement delta.
   * @param {string} query - User search query
   * @param {Array} dataset - Dataset
   * @param {Object} prData - PageRank data
   * @returns {Object} { classicResults, pageRankResults, comparisons, summary }
   */
  function computeComparison(query, dataset, prData) {
    const classicResults = computeClassicKeywordSearch(query, dataset);
    const pageRankResults = computeGooglePageRankSearch(query, dataset, prData);

    const rankMap1997 = {};
    classicResults.forEach(r => { rankMap1997[r.page] = r.rank; });

    const rankMap1998 = {};
    pageRankResults.forEach(r => { rankMap1998[r.page] = r.rank; });

    // Build diff annotations for each result
    const comparisonResults1997 = classicResults.map(item => {
      const rank1998 = rankMap1998[item.page];
      const rank1997 = item.rank;
      // Movement in 1998 relative to 1997:
      // rank1997 (e.g. 3) - rank1998 (e.g. 1) = +2 positions
      const shift = rank1998 ? (rank1997 - rank1998) : 0;
      return {
        ...item,
        rank1997,
        rank1998,
        shift,
        incomingCount: (prData.inLinksMap[item.page] || []).length,
        rawPR: prData.pageRankMap[item.page],
        normPR: prData.normalizedMap[item.page]
      };
    });

    const comparisonResults1998 = pageRankResults.map(item => {
      const rank1997 = rankMap1997[item.page];
      const rank1998 = item.rank;
      const shift = rank1997 ? (rank1997 - rank1998) : 0;
      return {
        ...item,
        rank1997,
        rank1998,
        shift
      };
    });

    return {
      classicList: comparisonResults1997,
      pageRankList: comparisonResults1998
    };
  }

  /* ==========================================================================
     7. SORTING ENGINE
     ========================================================================== */
  function applySorting(resultsList, sortBy) {
    const sorted = [...resultsList];
    switch (sortBy) {
      case 'pagerank':
        sorted.sort((a, b) => (b.rawPageRank || 0) - (a.rawPageRank || 0));
        break;
      case 'frequency':
        sorted.sort((a, b) => (b.keywordFrequency || 0) - (a.keywordFrequency || 0));
        break;
      case 'density':
        sorted.sort((a, b) => (b.keywordDensity || 0) - (a.keywordDensity || 0));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'score':
      default:
        sorted.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        break;
    }
    return sorted;
  }

  /* ==========================================================================
     8. INTERACTIVE SVG LINK NETWORK GRAPH COMPONENT
     ==========================================================================
     Renders a clean, interactive SVG directed network graph representing
     all 6 pages, their hyperlink directions, node authority sizes, and
     step-by-step formula breakdown upon inspection.
     ========================================================================== */

  // Explicit, balanced 2D node coordinates for optimal clarity
  const NODE_COORDINATES = {
    1: { x: 190, y: 80 },   // Pune Food Guide
    2: { x: 370, y: 195 },  // Best Pizza Pune (Center Authority Hub)
    3: { x: 550, y: 80 },   // College Canteen Blog
    4: { x: 570, y: 310 },  // Pizza Recipes Home
    5: { x: 170, y: 310 },  // Cheap Eats Pune
    6: { x: 50,  y: 195 }   // Pizza Spam (Isolated on far left)
  };

  function renderLinkGraph(prData) {
    const svg = document.getElementById('link-graph-svg');
    if (!svg) return;

    svg.innerHTML = ''; // Clear existing contents

    const width = 640;
    const height = 400;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Create SVG Defs for Arrowhead markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Default Gray Arrow
    defs.innerHTML = `
      <marker id="arrow-default" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#888888" />
      </marker>
      <marker id="arrow-incoming" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#1b8828" />
      </marker>
      <marker id="arrow-outgoing" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#e65100" />
      </marker>
    `;
    svg.appendChild(defs);

    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'graph-edges-layer');
    svg.appendChild(edgesGroup);

    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'graph-nodes-layer');
    svg.appendChild(nodesGroup);

    // Draw Edges
    const edgeElements = [];
    websites.forEach(site => {
      const u = site.page;
      const srcCoord = NODE_COORDINATES[u];

      (site.links_to || []).forEach(v => {
        const tgtCoord = NODE_COORDINATES[v];
        if (!srcCoord || !tgtCoord) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Slight curvature for bi-directional or overlapping lines
        const dx = tgtCoord.x - srcCoord.x;
        const dy = tgtCoord.y - srcCoord.y;
        const cx = (srcCoord.x + tgtCoord.x) / 2 - dy * 0.08;
        const cy = (srcCoord.y + tgtCoord.y) / 2 + dx * 0.08;

        const dStr = `M ${srcCoord.x} ${srcCoord.y} Q ${cx} ${cy} ${tgtCoord.x} ${tgtCoord.y}`;
        path.setAttribute('d', dStr);
        path.setAttribute('class', 'graph-edge');
        path.setAttribute('marker-end', 'url(#arrow-default)');
        path.dataset.source = u;
        path.dataset.target = v;

        edgesGroup.appendChild(path);
        edgeElements.push(path);
      });
    });

    // Draw Nodes
    const nodeElements = {};
    websites.forEach(site => {
      const id = site.page;
      const coord = NODE_COORDINATES[id];
      const normPR = prData.normalizedMap[id] || 0;
      const rawPR = prData.pageRankMap[id] || 0;

      // Radius scales with PageRank authority (min 18px, max 36px)
      const radius = 18 + (normPR / 100) * 18;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'graph-node-group');
      g.dataset.pageId = id;
      g.setAttribute('transform', `translate(${coord.x}, ${coord.y})`);

      // Color coding:
      // Page 2 (Max Authority): Gold/Green tone
      // Page 6 (Spam): Coral/Red tone
      // Other standard nodes: Slate Blue tone
      let fillColor = '#4a90e2';
      let strokeColor = '#2156ce';
      if (id === 2) {
        fillColor = '#34a853';
        strokeColor = '#1b8828';
      } else if (id === 6) {
        fillColor = '#ea4335';
        strokeColor = '#b31412';
      }

      // Outer circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', radius);
      circle.setAttribute('class', 'node-bg');
      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);

      // Node Label (Page #)
      const textId = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textId.setAttribute('text-anchor', 'middle');
      textId.setAttribute('dy', '-2');
      textId.setAttribute('fill', '#ffffff');
      textId.setAttribute('font-size', '12px');
      textId.setAttribute('font-weight', 'bold');
      textId.textContent = `P${id}`;

      // PR Subtext
      const textPR = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textPR.setAttribute('text-anchor', 'middle');
      textPR.setAttribute('dy', '11');
      textPR.setAttribute('fill', '#ffffff');
      textPR.setAttribute('font-size', '9px');
      textPR.textContent = `PR:${rawPR.toFixed(2)}`;

      // URL Underneath Node
      const textURL = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textURL.setAttribute('text-anchor', 'middle');
      textURL.setAttribute('dy', radius + 14);
      textURL.setAttribute('fill', '#222222');
      textURL.setAttribute('font-size', '9px');
      textURL.setAttribute('font-family', 'var(--font-sans)');
      const shortUrl = site.url.replace('http://', '').replace('.com', '');
      textURL.textContent = shortUrl;

      g.appendChild(circle);
      g.appendChild(textId);
      g.appendChild(textPR);
      g.appendChild(textURL);

      // Node Event Listeners
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        selectGraphNode(id, prData);
      });

      g.addEventListener('mouseenter', () => {
        highlightGraphConnections(id);
      });

      g.addEventListener('mouseleave', () => {
        if (!AppState.selectedGraphNodeId) {
          clearGraphHighlights();
        } else {
          highlightGraphConnections(AppState.selectedGraphNodeId);
        }
      });

      nodesGroup.appendChild(g);
      nodeElements[id] = g;
    });

    // Background click clears selection
    svg.addEventListener('click', () => {
      AppState.selectedGraphNodeId = null;
      clearGraphHighlights();
      updateNodeInspector(null, prData);
    });

    // Initial state: default select Page 2 to immediately demonstrate authority
    selectGraphNode(2, prData);
  }

  function highlightGraphConnections(nodeId) {
    const svg = document.getElementById('link-graph-svg');
    if (!svg) return;

    const edges = svg.querySelectorAll('.graph-edge');
    const nodes = svg.querySelectorAll('.graph-node-group');

    edges.forEach(edge => {
      const src = parseInt(edge.dataset.source, 10);
      const tgt = parseInt(edge.dataset.target, 10);

      edge.classList.remove('edge-incoming', 'edge-outgoing', 'edge-dimmed');

      if (tgt === nodeId) {
        // Incoming link to hovered/selected node
        edge.classList.add('edge-incoming');
        edge.setAttribute('marker-end', 'url(#arrow-incoming)');
      } else if (src === nodeId) {
        // Outgoing link from hovered/selected node
        edge.classList.add('edge-outgoing');
        edge.setAttribute('marker-end', 'url(#arrow-outgoing)');
      } else {
        edge.classList.add('edge-dimmed');
        edge.setAttribute('marker-end', 'url(#arrow-default)');
      }
    });

    nodes.forEach(node => {
      const id = parseInt(node.dataset.pageId, 10);
      if (id === nodeId) {
        node.classList.remove('node-dimmed');
        node.classList.add('node-selected');
      } else {
        node.classList.remove('node-selected');
        // Keep connected neighbors lit
        const site = websites.find(s => s.page === nodeId);
        const inLinks = AppState.cachedPageRank.inLinksMap[nodeId] || [];
        const outLinks = site ? site.links_to : [];
        if (inLinks.includes(id) || outLinks.includes(id)) {
          node.classList.remove('node-dimmed');
        } else {
          node.classList.add('node-dimmed');
        }
      }
    });
  }

  function clearGraphHighlights() {
    const svg = document.getElementById('link-graph-svg');
    if (!svg) return;

    svg.querySelectorAll('.graph-edge').forEach(edge => {
      edge.classList.remove('edge-incoming', 'edge-outgoing', 'edge-dimmed');
      edge.setAttribute('marker-end', 'url(#arrow-default)');
    });

    svg.querySelectorAll('.graph-node-group').forEach(node => {
      node.classList.remove('node-dimmed', 'node-selected');
    });
  }

  function selectGraphNode(nodeId, prData) {
    AppState.selectedGraphNodeId = nodeId;
    highlightGraphConnections(nodeId);
    updateNodeInspector(nodeId, prData);
  }

  /**
   * Updates the inspector card next to the SVG graph with exact math
   */
  function updateNodeInspector(nodeId, prData) {
    const panel = document.getElementById('node-inspector-panel');
    if (!panel) return;

    if (!nodeId) {
      panel.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <em>Click any node in the network to inspect its incoming links, outgoing links, and PageRank formula breakdown.</em>
        </div>
      `;
      return;
    }

    const site = websites.find(s => s.page === nodeId);
    if (!site) return;

    const meta = websiteMetadata[nodeId] || {};
    const inLinks = prData.inLinksMap[nodeId] || [];
    const outLinks = site.links_to || [];
    const rawPR = prData.pageRankMap[nodeId] || 0;
    const normPR = prData.normalizedMap[nodeId] || 0;
    const d = prData.dampingFactor;

    // Build the exact mathematical contribution breakdown:
    // PR(A) = (1 - d) + d * [ PR(T1)/C(T1) + PR(T2)/C(T2) + ... ]
    let formulaSumTerms = [];
    inLinks.forEach(srcId => {
      const srcPR = prData.pageRankMap[srcId];
      const srcOutDegree = prData.outDegreesMap[srcId];
      const termVal = srcPR / srcOutDegree;
      formulaSumTerms.push(`(PR(${srcId}) / ${srcOutDegree}) = (${srcPR.toFixed(3)} / ${srcOutDegree}) = ${termVal.toFixed(3)}`);
    });

    const sumStr = formulaSumTerms.length > 0 ? formulaSumTerms.join('<br>+ ') : '0 (No incoming links)';

    panel.innerHTML = `
      <div class="inspector-header">
        <span class="page-id-badge">PAGE ${nodeId}</span>
        <h4>${escapeHTML(meta.title || site.url)}</h4>
        <div class="inspector-url">${escapeHTML(site.url)}</div>
      </div>

      <div class="inspector-stats-grid">
        <div class="stat-box">
          <div class="lbl">PageRank (Raw)</div>
          <div class="val">${rawPR.toFixed(4)}</div>
        </div>
        <div class="stat-box">
          <div class="lbl">PageRank (Norm)</div>
          <div class="val" style="color: #1b8828;">${normPR.toFixed(1)}%</div>
        </div>
        <div class="stat-box">
          <div class="lbl">Incoming Links</div>
          <div class="val">${inLinks.length}</div>
        </div>
        <div class="stat-box">
          <div class="lbl">Outgoing Links</div>
          <div class="val">${outLinks.length}</div>
        </div>
      </div>

      <div class="inspector-links-list">
        <div><b>Incoming from:</b> ${inLinks.length > 0 ? inLinks.map(id => `<a href="javascript:void(0)" onclick="window.MiniGoogle.selectNode(${id})">Page ${id}</a>`).join(', ') : '<em>None</em>'}</div>
        <div style="margin-top: 3px;"><b>Links to:</b> ${outLinks.length > 0 ? outLinks.map(id => `<a href="javascript:void(0)" onclick="window.MiniGoogle.selectNode(${id})">Page ${id}</a>`).join(', ') : '<em>None</em>'}</div>
      </div>

      <div class="formula-card-wrap">
        <div style="font-weight: bold; margin-bottom: 4px; color: #000080;">PageRank Formula for Page ${nodeId}:</div>
        <div>PR(${nodeId}) = (1 - ${d}) + ${d} × Σ [ PR(T) / C(T) ]</div>
        <div style="margin-top: 4px; padding-left: 8px; border-left: 2px solid #000080; color: #444;">
          Base jump: ${(1 - d).toFixed(2)}<br>
          + ${d} × [<br>
          &nbsp;&nbsp;${sumStr}<br>
          ] = <b>${rawPR.toFixed(4)}</b>
        </div>
      </div>

      <div style="margin-top: 10px; text-align: right;">
        <button class="retro-btn btn-sm" onclick="window.MiniGoogle.openBrowserModal(${nodeId})">
          Preview Webpage in 1998 Browser &raquo;
        </button>
      </div>
    `;
  }

  /**
   * Renders the 30-iteration convergence trace table
   */
  function renderConvergenceTable(prData) {
    const tbody = document.getElementById('convergence-tbody');
    if (!tbody) return;

    const iterationsToShow = [0, 1, 2, 3, 5, 10, 15, 20, 25, 30];
    const trace = prData.iterationTrace;

    let html = '';
    iterationsToShow.forEach(itNum => {
      const record = trace.find(r => r.iteration === itNum) || trace[trace.length - 1];
      if (!record && itNum > 0) return;

      const deltaStr = record.maxDelta !== undefined ? record.maxDelta.toFixed(6) : '-';
      html += `
        <tr>
          <td style="font-weight: bold; text-align: center;">#${record.iteration}</td>
          <td>${record.ranks[1]?.toFixed(4)}</td>
          <td style="font-weight: bold; color: #1b8828;">${record.ranks[2]?.toFixed(4)}</td>
          <td>${record.ranks[3]?.toFixed(4)}</td>
          <td>${record.ranks[4]?.toFixed(4)}</td>
          <td>${record.ranks[5]?.toFixed(4)}</td>
          <td style="color: #d8281f;">${record.ranks[6]?.toFixed(4)}</td>
          <td style="color: #666; font-size: 10px;">${deltaStr}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  /* ==========================================================================
     9. SEARCH EXECUTION & RESULTS RENDERING
     ========================================================================== */

  /**
   * Primary entry point for search execution
   */
  function performSearch(query, options = {}) {
    query = (query !== undefined ? query : AppState.currentQuery).trim();
    if (!query) {
      alert("Please enter a query (try 'pizza', 'pune food', or 'biryani').");
      return;
    }

    AppState.currentQuery = query;

    // Record in search history
    addToHistory(query);

    // Ensure PageRank is computed
    if (!AppState.cachedPageRank) {
      AppState.cachedPageRank = computePageRank(websites, AppState.dampingFactor);
    }

    const startTime = performance.now();

    // Switch views: hide homepage, show results page
    const homeView = document.getElementById('home-view');
    const resultsView = document.getElementById('results-view');
    if (homeView) homeView.style.display = 'none';
    if (resultsView) resultsView.style.display = 'flex';

    // Sync input fields
    const navInput = document.getElementById('results-search-input');
    const homeInput = document.getElementById('home-search-input');
    if (navInput) navInput.value = query;
    if (homeInput) homeInput.value = query;

    // Branch based on active mode
    if (AppState.searchMode === 'comparison') {
      renderComparisonView(query, startTime);
    } else {
      renderSingleModeView(query, startTime);
    }

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Renders Standard Single Mode (Pre-1998 or 1998 PageRank)
   */
  function renderSingleModeView(query, startTime) {
    const resultsContainer = document.getElementById('results-container');
    const compContainer = document.getElementById('comparison-container');
    const compBanner = document.getElementById('comparison-banner');
    if (!resultsContainer) return;

    if (compContainer) compContainer.style.display = 'none';
    if (compBanner) compBanner.style.display = 'none';
    resultsContainer.style.display = 'block';

    let rawResults = [];
    if (AppState.searchMode === 'classic') {
      rawResults = computeClassicKeywordSearch(query, websites);
    } else {
      rawResults = computeGooglePageRankSearch(query, websites, AppState.cachedPageRank);
    }

    // Apply active sort
    const results = applySorting(rawResults, AppState.sortBy);
    const duration = ((performance.now() - startTime) / 1000).toFixed(3);

    // Update stats bar
    updateStatsBar(results.length, query, duration);

    if (results.length === 0) {
      resultsContainer.innerHTML = renderEmptyState(query);
      return;
    }

    const queryTokens = tokenize(query);
    let html = '';

    results.forEach((r, idx) => {
      const meta = websiteMetadata[r.page] || {};
      const snippet = highlightMatches(r.text, queryTokens);
      const isGoogle = AppState.searchMode === 'pagerank';

      html += `
        <div class="result-card ${r.page === 6 ? 'spam-penalized' : ''} ${r.page === 2 ? 'authority-boosted' : ''}">
          <div class="result-card-header">
            <div>
              <a class="result-title-link" href="javascript:void(0)" onclick="window.MiniGoogle.openBrowserModal(${r.page})">
                ${escapeHTML(r.title)}
              </a>
            </div>
            <span class="result-rank-pill">#${idx + 1}</span>
          </div>

          <div>
            <span class="result-url" onclick="window.MiniGoogle.openBrowserModal(${r.page})">
              ${escapeHTML(r.url)}
            </span>
          </div>

          <div class="result-snippet">
            ${meta.snippetPrefix ? `<span style="color:#666;">${escapeHTML(meta.snippetPrefix)}</span> ` : ''}
            ${snippet}
          </div>

          <div class="result-metrics-bar">
            <span class="metric-pill pill-score">
              Score: <b>${r.finalScore.toFixed(1)}</b>
            </span>
            <span class="metric-pill">
              Matches: <b>${r.matchingKeywordsCount} words</b>
            </span>
            <span class="metric-pill">
              Frequency: <b>${r.keywordFrequency}x</b>
            </span>
            <span class="metric-pill pill-density">
              Density: <b>${(r.keywordDensity * 100).toFixed(1)}%</b>
            </span>
            ${isGoogle ? `
              <span class="metric-pill pill-pr">
                PageRank: <b>${r.rawPageRank.toFixed(3)}</b> (${r.normalizedPageRank.toFixed(0)}%)
              </span>
              <span class="metric-pill">
                Backlinks: <b>${r.incomingLinksCount}</b>
              </span>
            ` : `
              <span class="metric-pill" style="color: #777;">
                Links: <em>Ignored (Pre-1998)</em>
              </span>
            `}
          </div>

          <div class="result-details-toggle" onclick="window.MiniGoogle.toggleCardDetails(${r.page})">
            <span>&#9656; Why this ranked #${idx + 1} (Score calculation breakdown)</span>
          </div>

          <div class="result-details-content" id="details-content-${r.page}">
            ${renderScoreExplanation(r, isGoogle)}
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
  }

  /**
   * Renders Side-by-Side 1997 vs 1998 Comparison Mode
   */
  function renderComparisonView(query, startTime) {
    const resultsContainer = document.getElementById('results-container');
    const compContainer = document.getElementById('comparison-container');
    const compBanner = document.getElementById('comparison-banner');
    if (!compContainer) return;

    if (resultsContainer) resultsContainer.style.display = 'none';
    if (compBanner) compBanner.style.display = 'flex';
    compContainer.style.display = 'grid';

    const compData = computeComparison(query, websites, AppState.cachedPageRank);
    const duration = ((performance.now() - startTime) / 1000).toFixed(3);

    const totalCount = Math.max(compData.classicList.length, compData.pageRankList.length);
    updateStatsBar(totalCount, query, duration);

    const col1997 = document.getElementById('comparison-col-1997');
    const col1998 = document.getElementById('comparison-col-1998');

    if (totalCount === 0) {
      compContainer.style.display = 'none';
      if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = renderEmptyState(query);
      }
      return;
    }

    const queryTokens = tokenize(query);

    // Render Left Column (1997 Classic Search)
    let html1997 = '';
    compData.classicList.forEach((r, idx) => {
      const snippet = highlightMatches(r.text, queryTokens);
      html1997 += `
        <div class="result-card ${r.page === 6 ? 'spam-penalized' : ''}">
          <div class="result-card-header">
            <a class="result-title-link" href="javascript:void(0)" onclick="window.MiniGoogle.openBrowserModal(${r.page})">
              ${escapeHTML(r.title)}
            </a>
            <span class="result-rank-pill">1997 Rank: #${r.rank}</span>
          </div>
          <div class="result-url" onclick="window.MiniGoogle.openBrowserModal(${r.page})">${escapeHTML(r.url)}</div>
          <div class="result-snippet">${snippet}</div>
          <div class="result-metrics-bar">
            <span class="metric-pill pill-score">Score: <b>${r.rawScore.toFixed(1)}</b></span>
            <span class="metric-pill">Freq: <b>${r.keywordFrequency}x</b></span>
            <span class="metric-pill pill-density">Density: <b>${(r.keywordDensity * 100).toFixed(1)}%</b></span>
          </div>
          ${r.page === 6 ? `
            <div style="margin-top:6px; font-size:11px; color:#d8281f; font-weight:bold;">
              &#9888; 1997 Vulnerability: Blatant keyword stuffing (10 repetitions) catapults spam to top!
            </div>
          ` : ''}
        </div>
      `;
    });
    if (col1997) col1997.innerHTML = html1997;

    // Render Right Column (1998 Google PageRank Search)
    let html1998 = '';
    compData.pageRankList.forEach((r, idx) => {
      const snippet = highlightMatches(r.text, queryTokens);
      let diffBadge = '';
      if (r.shift > 0) {
        diffBadge = `<span class="rank-diff-badge diff-up">&#9650; Moved UP ${r.shift} spot${r.shift > 1 ? 's' : ''} (from #${r.rank1997})</span>`;
      } else if (r.shift < 0) {
        diffBadge = `<span class="rank-diff-badge diff-down">&#9660; Dropped ${Math.abs(r.shift)} spot${Math.abs(r.shift) > 1 ? 's' : ''} (from #${r.rank1997})</span>`;
      } else {
        diffBadge = `<span class="rank-diff-badge diff-same">&#8212; Unchanged (#${r.rank})</span>`;
      }

      html1998 += `
        <div class="result-card ${r.page === 2 ? 'authority-boosted' : ''} ${r.page === 6 ? 'spam-penalized' : ''}">
          <div class="result-card-header">
            <a class="result-title-link" href="javascript:void(0)" onclick="window.MiniGoogle.openBrowserModal(${r.page})">
              ${escapeHTML(r.title)}
            </a>
            <span class="result-rank-pill" style="background:#d4edda; color:#155724;">1998 Rank: #${r.rank}</span>
          </div>
          <div class="result-url" onclick="window.MiniGoogle.openBrowserModal(${r.page})">${escapeHTML(r.url)}</div>
          <div style="margin-bottom: 6px;">${diffBadge}</div>
          <div class="result-snippet">${snippet}</div>
          <div class="result-metrics-bar">
            <span class="metric-pill pill-score">Combined: <b>${r.finalScore.toFixed(1)}</b></span>
            <span class="metric-pill pill-pr">PR: <b>${r.rawPageRank.toFixed(3)}</b></span>
            <span class="metric-pill">Backlinks: <b>${r.incomingLinksCount}</b></span>
          </div>
          ${r.page === 2 ? `
            <div style="margin-top:6px; font-size:11px; color:#1b8828; font-weight:bold;">
              &#10004; Google Advantage: 4 authoritative incoming backlinks propel genuine content to #1!
            </div>
          ` : ''}
          ${r.page === 6 ? `
            <div style="margin-top:6px; font-size:11px; color:#666;">
              &#128065; Spam Penalized: Zero backlinks leave PageRank at rock bottom (${r.rawPageRank.toFixed(2)}), cutting spam dominance.
            </div>
          ` : ''}
        </div>
      `;
    });
    if (col1998) col1998.innerHTML = html1998;
  }

  function renderEmptyState(query) {
    return `
      <div class="empty-results-box">
        <h3>Your search - <b>${escapeHTML(query)}</b> - did not match any documents.</h3>
        <p style="margin-bottom: 8px; color: #555;">Suggestions:</p>
        <ul>
          <li>Make sure all words are spelled correctly.</li>
          <li>Try different keywords.</li>
          <li>Try more general keywords like <b>pizza</b>, <b>pune</b>, <b>food</b>, or <b>canteen</b>.</li>
          <li>Try fewer keywords.</li>
        </ul>
        <div style="margin-top: 16px;">
          <button class="retro-btn" onclick="window.MiniGoogle.searchWithQuery('pizza')">Search "pizza"</button>
          <button class="retro-btn" onclick="window.MiniGoogle.searchWithQuery('pune food')">Search "pune food"</button>
          <button class="retro-btn" onclick="window.MiniGoogle.searchWithQuery('biryani')">Search "biryani"</button>
        </div>
      </div>
    `;
  }

  function renderScoreExplanation(r, isGoogle) {
    if (!isGoogle) {
      return `
        <strong>Classic 1997 Keyword Ranking Formula:</strong><br>
        <code>Raw Score = (Frequency × 10) + (Density × 100) + (Distinct Matches × 5)</code><br>
        = (${r.keywordFrequency} × 10) + (${r.keywordDensity.toFixed(4)} × 100) + (${r.matchingKeywordsCount} × 5)<br>
        = <strong>${r.finalScore.toFixed(2)}</strong><br>
        <span style="color:#666;">Notice: No hyperlinks or web graph authority are analyzed in this mode.</span>
      `;
    }

    const wRel = (AppState.weightRelevance * 100).toFixed(0);
    const wPR = (AppState.weightPageRank * 100).toFixed(0);

    return `
      <strong>Google 1998 PageRank Hybrid Ranking Formula:</strong><br>
      <code>Final Score = (${wRel}% × Keyword Relevance Norm) + (${wPR}% × PageRank Norm)</code><br>
      = (${AppState.weightRelevance} × ${r.normalizedKeyword.toFixed(1)}) + (${AppState.weightPageRank} × ${r.normalizedPageRank.toFixed(1)})<br>
      = <strong>${r.finalScore.toFixed(2)}</strong><br>
      <span style="color:#333;">PageRank Authority: Raw PR = <strong>${r.rawPageRank.toFixed(4)}</strong> (from ${r.incomingLinksCount} incoming backlinks).</span>
    `;
  }

  function updateStatsBar(count, query, duration) {
    const statsElem = document.getElementById('results-stats-text');
    if (statsElem) {
      statsElem.innerHTML = `Searched 6 web pages for <b>${escapeHTML(query)}</b>. Found ${count} matching result${count === 1 ? '' : 's'} (${duration} seconds)`;
    }

    const badgeElem = document.getElementById('results-mode-badge');
    if (badgeElem) {
      if (AppState.searchMode === 'classic') {
        badgeElem.className = 'mode-badge badge-mode-a';
        badgeElem.innerHTML = '&#9881; MODE A: Classic Keyword Search (Pre-1998)';
      } else if (AppState.searchMode === 'pagerank') {
        badgeElem.className = 'mode-badge badge-mode-b';
        badgeElem.innerHTML = '&#10024; MODE B: Google PageRank Search (1998)';
      } else {
        badgeElem.className = 'mode-badge badge-mode-comp';
        badgeElem.innerHTML = '&#9878; 1997 vs 1998 Comparison Mode';
      }
    }
  }

  /* ==========================================================================
     10. "I'M FEELING LUCKY" & RANDOM SEARCH
     ========================================================================== */

  function handleLuckySearch(query) {
    query = (query || AppState.currentQuery || 'pizza').trim();
    if (!query) {
      alert("Please enter a search term first!");
      return;
    }

    // Run search to determine top result
    if (!AppState.cachedPageRank) {
      AppState.cachedPageRank = computePageRank(websites, AppState.dampingFactor);
    }

    let topResults = [];
    if (AppState.searchMode === 'classic') {
      topResults = computeClassicKeywordSearch(query, websites);
    } else {
      topResults = computeGooglePageRankSearch(query, websites, AppState.cachedPageRank);
    }

    if (topResults.length === 0) {
      alert(`No results found for "${query}". Try searching for 'pizza' or 'pune'.`);
      return;
    }

    const luckyPage = topResults[0].page;
    // Launch simulated 1998 browser directly to the #1 ranked page!
    openBrowserModal(luckyPage);
  }

  const SAMPLE_QUERIES = [
    'pizza',
    'pune food',
    'biryani',
    'canteen chai',
    'pizza dough',
    'misal dosa',
    'cheap eats',
    'cheese pizza'
  ];

  function handleRandomSearch() {
    const randomIndex = Math.floor(Math.random() * SAMPLE_QUERIES.length);
    const chosenQuery = SAMPLE_QUERIES[randomIndex];
    const homeInput = document.getElementById('home-search-input');
    const resultsInput = document.getElementById('results-search-input');
    if (homeInput) homeInput.value = chosenQuery;
    if (resultsInput) resultsInput.value = chosenQuery;
    performSearch(chosenQuery);
  }

  /* ==========================================================================
     11. SIMULATED 1998 BROWSER MODAL (NETSCAPE / IE 4.0)
     ========================================================================== */

  function openBrowserModal(pageId) {
    const modal = document.getElementById('browser-modal');
    if (!modal) return;

    AppState.browserHistory.push(pageId);
    AppState.browserHistoryIndex = AppState.browserHistory.length - 1;

    renderBrowserPage(pageId);
    modal.classList.add('active');
  }

  function closeBrowserModal() {
    const modal = document.getElementById('browser-modal');
    if (modal) modal.classList.remove('active');
  }

  function renderBrowserPage(pageId) {
    const site = websites.find(s => s.page === pageId);
    if (!site) return;

    const meta = websiteMetadata[pageId] || {};
    const titleElem = document.getElementById('browser-win-title');
    const addressInput = document.getElementById('browser-address-input');
    const viewport = document.getElementById('browser-viewport');

    if (titleElem) titleElem.textContent = `Netscape Navigator - [${meta.title || site.url}]`;
    if (addressInput) addressInput.value = site.url;

    // Render vintage 1998 website content with authentic styling and internal links
    let outgoingLinksHTML = '';
    (site.links_to || []).forEach(targetId => {
      const targetSite = websites.find(s => s.page === targetId);
      if (targetSite) {
        const targetMeta = websiteMetadata[targetId] || {};
        outgoingLinksHTML += `
          <li>
            <a href="javascript:void(0)" onclick="window.MiniGoogle.browserNavigate(${targetId})">
              ${escapeHTML(targetMeta.title || targetSite.url)}
            </a> (${escapeHTML(targetSite.url)})
          </li>
        `;
      }
    });

    let bodyHTML = '';
    if (pageId === 6) {
      // The hilarious keyword-stuffed spam site
      bodyHTML = `
        <div class="site-1998-spam">
          <marquee scrollamount="8" style="background:#000; color:#ffff00; font-family:monospace; padding:4px;">
            ★★★ WELCOME TO THE #1 BEST PIZZA EMPORIUM ON THE WORLD WIDE WEB 1998 ★★★
          </marquee>
          <h2 style="font-size:24px; color:#ff0000; text-align:center; margin:15px 0;">
            PIZZA PIZZA PIZZA PIZZA PIZZA
          </h2>
          <p style="font-size: 15px; text-align:center; line-height: 2;">
            ${site.text}
          </p>
          <div style="text-align:center; margin-top:20px;">
            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='30'><rect width='120' height='30' fill='%23000'/><text x='10' y='20' fill='%23ff0' font-family='sans-serif' font-size='11'>UNDER CONSTRUCTION</text></svg>" alt="Under Construction">
          </div>
        </div>
      `;
    } else {
      bodyHTML = `
        <div class="site-1998-header">
          <h1>${escapeHTML(meta.title)}</h1>
          <div style="font-size: 11px; color: #555;">Published: October 1998 &bull; Author: ${escapeHTML(meta.author || 'Webmaster')}</div>
        </div>
        <div class="site-1998-body">
          <p style="font-size: 15px; margin-bottom: 12px; color: #111;">
            "${escapeHTML(site.text)}"
          </p>
          <p style="color: #444; font-size: 13px;">
            ${escapeHTML(meta.snippetPrefix || '')}
          </p>
        </div>
      `;
    }

    if (viewport) {
      viewport.innerHTML = `
        ${bodyHTML}
        <div class="site-1998-links-section" style="margin-top: 20px;">
          <h4>Hyperlinks Recommended by this Website (${(site.links_to || []).length}):</h4>
          ${outgoingLinksHTML ? `<ul>${outgoingLinksHTML}</ul>` : '<p style="color:#777; font-size:11px;"><em>No outgoing links on this page.</em></p>'}
        </div>
        <div class="site-1998-footer">
          Optimized for Netscape Communicator 4.0 &bull; Best viewed in 800x600 resolution &bull; MiniGoogle '98 Index
        </div>
      `;
    }
  }

  function browserNavigate(pageId) {
    AppState.browserHistory.push(pageId);
    AppState.browserHistoryIndex = AppState.browserHistory.length - 1;
    renderBrowserPage(pageId);
  }

  function browserGoBack() {
    if (AppState.browserHistoryIndex > 0) {
      AppState.browserHistoryIndex--;
      renderBrowserPage(AppState.browserHistory[AppState.browserHistoryIndex]);
    }
  }

  function browserGoForward() {
    if (AppState.browserHistoryIndex < AppState.browserHistory.length - 1) {
      AppState.browserHistoryIndex++;
      renderBrowserPage(AppState.browserHistory[AppState.browserHistoryIndex]);
    }
  }

  /* ==========================================================================
     12. SEARCH SUGGESTIONS & AUTOCOMPLETE
     ========================================================================== */

  // Vocabulary extracted from dataset
  const DATASET_KEYWORDS = [
    'pizza', 'pune', 'food', 'biryani', 'vada pav', 'cheese', 'wood-fired',
    'fresh', 'canteen', 'chai', 'friday', 'recipes', 'home', 'dough',
    'sauce', 'cheap', 'eats', 'rupees', 'misal', 'dosa', 'slices', 'reviews'
  ];

  function setupAutocomplete() {
    const input = document.getElementById('home-search-input');
    const dropdown = document.getElementById('home-suggestions');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      if (!val) {
        dropdown.style.display = 'none';
        return;
      }

      const matches = DATASET_KEYWORDS.filter(k => k.toLowerCase().includes(val));
      if (matches.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      let html = '';
      matches.slice(0, 6).forEach(m => {
        html += `
          <div class="suggestion-item" data-query="${escapeHTML(m)}">
            <span>&#128269; <b>${escapeHTML(m)}</b></span>
            <span class="sugg-meta">in dataset</span>
          </div>
        `;
      });

      dropdown.innerHTML = html;
      dropdown.style.display = 'block';

      dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const q = item.dataset.query;
          input.value = q;
          dropdown.style.display = 'none';
          performSearch(q);
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  /* ==========================================================================
     13. SEARCH HISTORY MANAGEMENT
     ========================================================================== */

  function loadHistory() {
    try {
      const saved = localStorage.getItem('minigoogle_history');
      if (saved) {
        AppState.history = JSON.parse(saved);
      }
    } catch (e) {
      AppState.history = [];
    }
    renderHistoryUI();
  }

  function addToHistory(query) {
    if (!query) return;
    AppState.history = AppState.history.filter(h => h.toLowerCase() !== query.toLowerCase());
    AppState.history.unshift(query);
    if (AppState.history.length > 8) AppState.history.pop();
    try {
      localStorage.setItem('minigoogle_history', JSON.stringify(AppState.history));
    } catch (e) {}
    renderHistoryUI();
  }

  function clearHistory() {
    AppState.history = [];
    try {
      localStorage.removeItem('minigoogle_history');
    } catch (e) {}
    renderHistoryUI();
  }

  function renderHistoryUI() {
    const list = document.getElementById('history-list');
    const wrap = document.getElementById('history-section');
    if (!list || !wrap) return;

    if (AppState.history.length === 0) {
      wrap.style.display = 'none';
      return;
    }

    wrap.style.display = 'block';
    let html = '';
    AppState.history.forEach(item => {
      html += `
        <div class="history-item" onclick="window.MiniGoogle.searchWithQuery('${escapeHTML(item)}')">
          <span>&#8634;</span> ${escapeHTML(item)}
        </div>
      `;
    });
    list.innerHTML = html;
  }

  /* ==========================================================================
     14. EVENT LISTENERS & INITIALIZATION
     ========================================================================== */

  function setMode(newMode) {
    AppState.searchMode = newMode;

    // Update active state in homepage radio cards
    document.querySelectorAll('.mode-option-card').forEach(card => {
      if (card.dataset.mode === newMode) {
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      } else {
        card.classList.remove('active');
      }
    });

    // Update header toggle buttons in results page
    document.querySelectorAll('.btn-mode-toggle').forEach(btn => {
      if (btn.dataset.mode === newMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Re-render current search if already on results page
    if (AppState.currentQuery) {
      performSearch(AppState.currentQuery);
    }
  }

  function navigateToHome() {
    const homeView = document.getElementById('home-view');
    const resultsView = document.getElementById('results-view');
    if (homeView) homeView.style.display = 'flex';
    if (resultsView) resultsView.style.display = 'none';
    const homeInput = document.getElementById('home-search-input');
    if (homeInput) {
      homeInput.focus();
      homeInput.select();
    }
  }

  function toggleCardDetails(pageId) {
    const content = document.getElementById(`details-content-${pageId}`);
    if (content) {
      content.classList.toggle('open');
    }
  }

  function resetSimulation() {
    AppState.dampingFactor = 0.85;
    AppState.weightRelevance = 0.50;
    AppState.weightPageRank = 0.50;

    const dampingSlider = document.getElementById('damping-slider');
    const dampingVal = document.getElementById('damping-val');
    const weightSlider = document.getElementById('weight-slider');
    const weightVal = document.getElementById('weight-val');

    if (dampingSlider) dampingSlider.value = 0.85;
    if (dampingVal) dampingVal.textContent = '0.85';
    if (weightSlider) weightSlider.value = 50;
    if (weightVal) weightVal.textContent = '50% / 50%';

    // Recompute PageRank
    AppState.cachedPageRank = computePageRank(websites, AppState.dampingFactor);
    renderLinkGraph(AppState.cachedPageRank);
    renderConvergenceTable(AppState.cachedPageRank);

    if (AppState.currentQuery) {
      performSearch(AppState.currentQuery);
    }
  }

  function initializeApp() {
    // Initial PageRank calculation
    AppState.cachedPageRank = computePageRank(websites, AppState.dampingFactor);

    // Initial render of Network Graph & Convergence Table
    renderLinkGraph(AppState.cachedPageRank);
    renderConvergenceTable(AppState.cachedPageRank);

    // Load Search History
    loadHistory();

    // Autocomplete setup
    setupAutocomplete();

    // Search Buttons (Home)
    const homeSearchBtn = document.getElementById('btn-home-search');
    const homeLuckyBtn = document.getElementById('btn-home-lucky');
    const homeRandomBtn = document.getElementById('btn-home-random');
    const homeInput = document.getElementById('home-search-input');

    if (homeSearchBtn && homeInput) {
      homeSearchBtn.addEventListener('click', () => performSearch(homeInput.value));
      homeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(homeInput.value);
      });
    }

    if (homeLuckyBtn) {
      homeLuckyBtn.addEventListener('click', () => handleLuckySearch(homeInput ? homeInput.value : ''));
    }

    if (homeRandomBtn) {
      homeRandomBtn.addEventListener('click', handleRandomSearch);
    }

    // Results Bar Search Form
    const resultsSearchBtn = document.getElementById('btn-results-search');
    const resultsLuckyBtn = document.getElementById('btn-results-lucky');
    const resultsInput = document.getElementById('results-search-input');

    if (resultsSearchBtn && resultsInput) {
      resultsSearchBtn.addEventListener('click', () => performSearch(resultsInput.value));
      resultsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(resultsInput.value);
      });
    }

    if (resultsLuckyBtn) {
      resultsLuckyBtn.addEventListener('click', () => handleLuckySearch(resultsInput ? resultsInput.value : ''));
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sort-selector');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        AppState.sortBy = sortSelect.value;
        if (AppState.currentQuery) {
          performSearch(AppState.currentQuery);
        }
      });
    }

    // Mode Option Cards (Homepage)
    document.querySelectorAll('.mode-option-card').forEach(card => {
      card.addEventListener('click', () => {
        setMode(card.dataset.mode);
      });
    });

    // Mode Toggle Buttons (Results Bar)
    document.querySelectorAll('.btn-mode-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        setMode(btn.dataset.mode);
      });
    });

    // Quick Chips (Home)
    document.querySelectorAll('.query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (homeInput) homeInput.value = query;
        performSearch(query);
      });
    });

    // Damping factor slider
    const dampingSlider = document.getElementById('damping-slider');
    const dampingVal = document.getElementById('damping-val');
    if (dampingSlider) {
      dampingSlider.addEventListener('input', () => {
        const val = parseFloat(dampingSlider.value);
        AppState.dampingFactor = val;
        if (dampingVal) dampingVal.textContent = val.toFixed(2);
        // Recalculate PageRank live
        AppState.cachedPageRank = computePageRank(websites, AppState.dampingFactor);
        renderLinkGraph(AppState.cachedPageRank);
        renderConvergenceTable(AppState.cachedPageRank);
        if (AppState.currentQuery) performSearch(AppState.currentQuery);
      });
    }

    // Weight slider
    const weightSlider = document.getElementById('weight-slider');
    const weightVal = document.getElementById('weight-val');
    if (weightSlider) {
      weightSlider.addEventListener('input', () => {
        const val = parseInt(weightSlider.value, 10);
        AppState.weightPageRank = val / 100;
        AppState.weightRelevance = (100 - val) / 100;
        if (weightVal) weightVal.textContent = `${100 - val}% Rel / ${val}% PR`;
        if (AppState.currentQuery) performSearch(AppState.currentQuery);
      });
    }

    // Tuning Modal Controls
    const btnOpenTuning = document.getElementById('btn-open-tuning');
    const tuningModal = document.getElementById('config-modal');
    const btnCloseTuning = document.getElementById('btn-close-tuning');
    const btnResetTuning = document.getElementById('btn-reset-tuning');

    if (btnOpenTuning && tuningModal) {
      btnOpenTuning.addEventListener('click', () => tuningModal.classList.add('active'));
    }
    if (btnCloseTuning && tuningModal) {
      btnCloseTuning.addEventListener('click', () => tuningModal.classList.remove('active'));
    }
    if (btnResetTuning) {
      btnResetTuning.addEventListener('click', resetSimulation);
    }

    // How Search Works Toggle / Scroll
    const graphSection = document.getElementById('how-search-works-section');
    const btnHowItWorks = document.getElementById('link-how-it-works');
    if (btnHowItWorks && graphSection) {
      btnHowItWorks.addEventListener('click', (e) => {
        e.preventDefault();
        graphSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Browser Simulator Back / Forward
    const btnBrowserBack = document.getElementById('btn-browser-back');
    const btnBrowserForward = document.getElementById('btn-browser-forward');
    if (btnBrowserBack) btnBrowserBack.addEventListener('click', browserGoBack);
    if (btnBrowserForward) btnBrowserForward.addEventListener('click', browserGoForward);

    // About & Archive Modal triggers
    const aboutModal = document.getElementById('about-modal');
    const archiveModal = document.getElementById('archive-modal');

    document.querySelectorAll('.trigger-about-modal').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (aboutModal) aboutModal.classList.add('active');
      });
    });

    document.querySelectorAll('.trigger-archive-modal').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (archiveModal) archiveModal.classList.add('active');
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });
  }

  // Expose global controller for inline HTML callbacks
  window.MiniGoogle = {
    searchWithQuery: function (q) {
      performSearch(q);
    },
    goHome: navigateToHome,
    openBrowserModal: openBrowserModal,
    closeBrowserModal: closeBrowserModal,
    browserNavigate: browserNavigate,
    selectNode: function (nodeId) {
      selectGraphNode(nodeId, AppState.cachedPageRank);
    },
    toggleCardDetails: toggleCardDetails,
    clearHistory: clearHistory,
    setMode: setMode,
    resetSimulation: resetSimulation
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})();
