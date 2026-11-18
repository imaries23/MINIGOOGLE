# MiniGoogle '98 — A Retro Search Engine & PageRank Simulator

A fully functional, visually attractive, retro-inspired search engine inspired by Google's original 1998 Stanford prototype. Built entirely with pure **HTML5, CSS3, and Vanilla JavaScript** with zero external libraries or frameworks.

---

## 📸 Overview & Educational Purpose

In 1998, search engines (AltaVista, Lycos, Excite) ranked web pages primarily through on-page keyword repetition and density. This led to pervasive **keyword stuffing**—spammers repeating words dozens of times to capture the #1 position.

**MiniGoogle '98** demonstrates the revolutionary breakthrough introduced by Larry Page and Sergey Brin: **PageRank**, which treats hyperlinks as authoritative citations.

With MiniGoogle '98, users can:
- Switch between **Mode A (Classic Keyword Search - 1997)** and **Mode B (Google PageRank Search - 1998)**.
- Use **"1997 vs 1998" Comparison Mode** to observe side-by-side how link authority defeats keyword stuffing (e.g., searching for `"pizza"`).
- Interact with an **interactive SVG directed network graph** of the link structure.
- Trace the **step-by-step mathematical convergence** over 30 iterations of the PageRank power method.
- Browse simulated 1998 websites in an authentic **Netscape/Windows 98 browser simulator**.
- Adjust the **damping factor ($d$)** and **Relevance vs. PageRank weighting** in real-time.

---

## 🗂 Project Structure

```
minigoogle/
├── index.html     # Semantic HTML5 retro 1998 layout, SVG canvas, and modals
├── style.css      # Authentic late-90s typography, beveled buttons, and responsive styles
├── script.js      # Clean, modular JavaScript containing both ranking engines and visualizers
└── README.md      # Comprehensive documentation and algorithmic explanation
```

---

## 🌐 Dataset & Web Graph

The search engine operates on the predefined 6-website corpus:

| Page | URL | Content Summary | Links To |
|:---:|:---|:---|:---:|
| **1** | `http://pune-food-guide.com` | Where to eat in Pune - vada pav and biryani and pizza | [2] |
| **2** | `http://best-pizza-pune.com` | Fresh wood-fired pizza made daily - try our cheese pizza | [1, 3] |
| **3** | `http://college-canteen-blog.com` | Student reviews of canteen food and chai and Friday pizza | [2, 4] |
| **4** | `http://pizza-recipes-home.com` | Make pizza at home - pizza dough and pizza sauce | [2] |
| **5** | `http://cheap-eats-pune.com` | Good food under 100 rupees - misal and dosa and pizza slices | [2] |
| **6** | `http://pizza-pizza-pizza.com` | pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza (Spam) | [1] |

### Graph Topology & Authority:
- **Page 2** is the central authority hub: it receives **4 incoming links** from Pages 1, 3, 4, and 5.
- **Page 6** is an isolated spam page: it mentions "pizza" 10 times (100% density) but receives **0 incoming links**.

---

## 🧮 Search Algorithms

### Mode A: Pre-Google (Before 1998) — "Classic Keyword Search"
Simulates early search engines that relied on keyword frequency and density.

1. **Tokenization:** Query and document texts are normalized to lowercase alphanumeric tokens.
2. **Keyword Frequency ($TF$):** Sum of occurrences of query words in the document.
3. **Keyword Density:** $TF / \text{Total Words in Document}$.
4. **Scoring Formula:**
   $$\text{Score} = (TF \times 10) + (\text{Density} \times 100) + (\text{Unique Matches} \times 5)$$
5. **Hyperlink Graph:** Completely ignored.
6. **Result for `"pizza"`:** Page 6 ranks **#1** (Score: ~205.0) due to 10 repetitions, exploiting keyword stuffing!

### Mode B: Google (1998 and After) — "Google PageRank Search"
Implements Larry Page's iterative random surfer model:

$$PR(A) = (1 - d) + d \sum_{T \in In(A)} \frac{PR(T)}{C(T)}$$

Where:
- $PR(A)$ = PageRank of page $A$.
- $d$ = Damping factor (default **0.85**, adjustable).
- $In(A)$ = Pages linking to $A$.
- $C(T)$ = Outgoing link count (out-degree) of page $T$.
- Initial condition: $PR(p) = 1.0$ for all pages.
- Power method runs for 30 iterations until convergence ($\Delta < 10^{-6}$).

#### Converged PageRank Values ($d = 0.85$):
- **Page 2:** **2.4912** (100.0% normalized) — Supreme authority hub
- **Page 1:** **1.3363** (53.6% normalized)
- **Page 3:** **1.2088** (48.5% normalized)
- **Page 4:** **0.6637** (26.6% normalized)
- **Page 5:** **0.1500** (6.0% normalized) — Base random jump $(1-d)$
- **Page 6:** **0.1500** (6.0% normalized) — Base random jump $(1-d)$

#### Hybrid Scoring:
$$\text{Final Score} = (w_{rel} \times \text{NormRelevance}) + (w_{PR} \times \text{NormPageRank})$$
Default weights: $50\%$ Keyword Relevance, $50\%$ PageRank Authority (adjustable via slider).

#### 🛡️ Zero-Relevance Guarantee:
> *Important:* Pages with zero keyword relevance are **strictly excluded** from search results. A page with high backlinks will never rank for a query it does not mention.

---

## ⚡ Key Features

1. **Authentic 1998 User Interface:**
   - Classic serif logo with primary colors (Blue, Red, Yellow, Green) and "BETA" badge.
   - Beveled Windows 98 button styles (`outset` / `inset`).
   - Classic blue clickable titles (`#0000cc`), green URLs (`#008000`), and dark snippet previews.
   - Retro Stanford CS announcement top bar.

2. **1997 vs 1998 Side-by-Side Comparison:**
   - Displays both algorithms side-by-side for the same query.
   - Highlights rank shifts (e.g. Page 2 leaps from #3 to #1; Page 6 spam gets heavily penalized).

3. **Interactive SVG Link Network Graph:**
   - Custom SVG canvas showing the 6 pages as nodes with directed arrows.
   - Node radius dynamically scales with PageRank.
   - Clicking or hovering on any node highlights incoming links in green and outgoing links in orange.
   - Live Node Inspector displays the exact mathematical formula with current numbers plugged in.

4. **30-Iteration Convergence Table:**
   - Displays the step-by-step values for each page at iterations 0, 1, 2, 3, 5, 10, 15, 20, 25, and 30, showing how PageRank mathematically stabilizes.

5. **Simulated 1998 Browser Modal:**
   - Clicking any result or the **"I'm Feeling Lucky"** button opens a vintage Netscape Navigator 4.0 browser window.
   - Contains authentic 1998 web pages with interactive internal links that navigate the web graph!

6. **Interactive Controls & Tuning:**
   - Search autocomplete suggestions based on corpus vocabulary.
   - Search history saved to `localStorage` with a "Clear History" button.
   - "Random Search" button with curated test queries (`"pizza"`, `"pune food"`, `"biryani"`, `"canteen chai"`, etc.).
   - Live sliders for Damping Factor ($d$) and Relevance vs PageRank weight.
   - Sorting options: Algorithm Score, PageRank, Keyword Frequency, Keyword Density, or Title.

---

## 🚀 How to Run Locally

No build tools, Node.js, web servers, or installations are required!

1. Open `minigoogle/index.html` directly in any web browser (Chrome, Safari, Firefox, Edge).
2. Alternatively, open it via a lightweight local server if desired:
   ```bash
   cd minigoogle
   python3 -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`.

---

## 🧪 Recommended Test Queries

- **`pizza`**: The iconic demonstration! Mode A ranks the spam site (`pizza-pizza-pizza.com`) #1. Mode B elevates the genuine, highly-linked pizzeria (`best-pizza-pune.com`) to #1.
- **`pune food`**: Demonstrates multi-word querying and food guide ranking.
- **`biryani`**: Tests single-page matching (only Page 1 matches, zero-relevance pages do not rank).
- **`canteen chai`**: Tests student reviews matching.
- **`misal dosa`**: Tests cheap eats under 100 rupees.
