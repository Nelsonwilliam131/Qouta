/* ============================================================
   QOUTA — app.js
   Three APIs → one merged pool → seen-stack per browser
   ============================================================ */

"use strict";

/* ── CONFIG ───────────────────────────────────────────────── */
const INTERVAL_MS = 5 * 60 * 1000;

const APIS = {
  programming: "https://programming-quotesapi.vercel.app/api/quotes",
  dummyjson: "https://dummyjson.com/quotes?limit=100&skip=0",
  zenquotes: "https://zenquotes.io/api/quotes",
};

const WIKI_THUMB = (name) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

const STORAGE_POOL = "qouta_pool";
const STORAGE_SEEN = "qouta_seen";
const STORAGE_HIST = "qouta_history";

/* ── FALLBACK BANK ────────────────────────────────────────── */
const FALLBACK = [
  {
    content: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    content: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
  },
  {
    content: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel",
  },
  {
    content: "Java is to JavaScript what car is to carpet.",
    author: "Chris Heilmann",
  },
  {
    content: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
  },
  { content: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  {
    content: "Optimism is an occupational hazard of programming.",
    author: "Kent Beck",
  },
  {
    content:
      "When to use iterative development? You should use iterative development almost always.",
    author: "Martin Fowler",
  },
  {
    content:
      "The most disastrous thing that you can ever learn is your first programming language.",
    author: "Alan Kay",
  },
  {
    content:
      "The function of good software is to make the complex appear to be simple.",
    author: "Grady Booch",
  },
  {
    content:
      "There are only two kinds of languages: the ones people complain about and the ones nobody uses.",
    author: "Bjarne Stroustrup",
  },
  {
    content:
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    content: "Truth can only be found in one place: the code.",
    author: "Robert C. Martin",
  },
  {
    content: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
  },
  {
    content: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    content: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
  },
  {
    content: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    content:
      "Without requirements or design, programming is the art of adding bugs to an empty text file.",
    author: "Louis Srygley",
  },
  {
    content:
      "The most important property of a program is whether it accomplishes the intention of its user.",
    author: "C.A.R. Hoare",
  },
  {
    content:
      "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
  },
];

/* ── STATE ────────────────────────────────────────────────── */
let pool = []; // all available quotes
let seen = []; // ids/indices already shown this session
let history = []; // ordered list of shown quotes (for prev)
let histPos = -1; // current position in history
let autoTimer = null;
let isBusy = false;

/* ── DOM REFS ─────────────────────────────────────────────── */
const skeletonBlock = document.getElementById("skeletonBlock");
const skeletonImg = document.getElementById("skeletonImg");
const quoteContent = document.getElementById("quoteContent");
const speakerContent = document.getElementById("speakerContent");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const speakerImg = document.getElementById("speakerImg");
const speakerFallback = document.getElementById("speakerFallback");
const speakerInitial = document.getElementById("speakerInitial");
const speakerLabel = document.getElementById("speakerLabel");
const prevBtn = document.getElementById("prevBtn");
const newBtn = document.getElementById("newBtn");
const nextBtn = document.getElementById("nextBtn");

/* ── LOCALSTORAGE HELPERS ─────────────────────────────────── */
function saveState() {
  try {
    localStorage.setItem(STORAGE_POOL, JSON.stringify(pool));
    localStorage.setItem(STORAGE_SEEN, JSON.stringify(seen));
    localStorage.setItem(STORAGE_HIST, JSON.stringify({ history, histPos }));
  } catch {
    /* storage full or blocked — silently skip */
  }
}

function loadState() {
  try {
    const p = localStorage.getItem(STORAGE_POOL);
    const s = localStorage.getItem(STORAGE_SEEN);
    const h = localStorage.getItem(STORAGE_HIST);
    if (p) pool = JSON.parse(p);
    if (s) seen = JSON.parse(s);
    if (h) {
      const parsed = JSON.parse(h);
      history = parsed.history || [];
      histPos = parsed.histPos ?? -1;
    }
  } catch {
    /* corrupted storage — start fresh */
  }
}

/* ── SKELETON ─────────────────────────────────────────────── */
function showSkeleton() {
  skeletonBlock.style.display = "block";
  skeletonImg.style.display = "block";
  quoteContent.classList.remove("visible");
  speakerContent.classList.remove("visible");
  quoteContent.style.display = "none";
  speakerContent.style.display = "none";
}

function hideSkeleton() {
  skeletonBlock.style.display = "none";
  skeletonImg.style.display = "none";
}

/* ── API FETCHERS ─────────────────────────────────────────── */

// Returns normalised [{ content, author }]
async function fetchProgramming() {
  const res = await fetch(APIS.programming);
  if (!res.ok) throw new Error(`programming-quotesapi ${res.status}`);
  const data = await res.json();
  // Returns array of { quote, author }
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((q) => ({ content: q.quote, author: q.author }));
}

async function fetchDummyjson() {
  const res = await fetch(APIS.dummyjson);
  if (!res.ok) throw new Error(`dummyjson ${res.status}`);
  const data = await res.json();
  // Returns { quotes: [{ id, quote, author }] }
  return (data.quotes || []).map((q) => ({
    content: q.quote,
    author: q.author,
  }));
}

async function fetchZenquotes() {
  const res = await fetch(APIS.zenquotes);
  if (!res.ok) throw new Error(`zenquotes ${res.status}`);
  const data = await res.json();
  // Returns [{ q, a, h }]
  const arr = Array.isArray(data) ? data : [data];
  return arr
    .filter(
      (q) =>
        q.q &&
        q.q !== "Too many requests. Obtain an auth key for unlimited access.",
    )
    .map((q) => ({ content: q.q, author: q.a }));
}

/* ── BUILD POOL ───────────────────────────────────────────── */
async function buildPool() {
  const results = await Promise.allSettled([
    fetchProgramming(),
    fetchDummyjson(),
    fetchZenquotes(),
  ]);

  let merged = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      merged = merged.concat(result.value);
    } else {
      console.warn(`API ${i} failed:`, result.reason);
    }
  });

  // If all APIs failed use fallback
  if (merged.length === 0) {
    merged = [...FALLBACK];
  }

  // Deduplicate by content string
  const seen_content = new Set();
  merged = merged.filter((q) => {
    const key = q.content.trim().toLowerCase();
    if (seen_content.has(key)) return false;
    seen_content.add(key);
    return true;
  });

  // Shuffle the pool
  pool = merged.sort(() => Math.random() - 0.5);
  seen = []; // reset seen-stack on fresh pool build
  saveState();
}

/* ── PICK UNSEEN QUOTE ────────────────────────────────────── */
function pickUnseen() {
  const unseen = pool.filter((_, i) => !seen.includes(i));

  // Pool exhausted — reshuffle and reset
  if (unseen.length === 0) {
    seen = [];
    pool = pool.sort(() => Math.random() - 0.5);
    saveState();
    return pool[0];
  }

  // Pick random unseen
  const pick = Math.floor(Math.random() * unseen.length);
  const quote = unseen[pick];
  const idx = pool.indexOf(quote);
  seen.push(idx);
  saveState();
  return quote;
}

/* ── DISPLAY ──────────────────────────────────────────────── */
async function displayQuote(q) {
  if (isBusy) return;
  isBusy = true;

  showSkeleton();
  await wait(500);

  quoteText.textContent = q.content;
  quoteAuthor.textContent = q.author;
  speakerLabel.textContent = q.author;

  await loadAuthorImage(q.author);

  hideSkeleton();
  quoteContent.style.display = "flex";
  speakerContent.style.display = "flex";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      quoteContent.classList.add("visible");
      speakerContent.classList.add("visible");
      isBusy = false;
    });
  });

  restartTimerBar();
}

/* ── WIKIPEDIA AUTHOR IMAGE ───────────────────────────────── */
async function loadAuthorImage(name) {
  speakerImg.style.display = "none";
  speakerImg.src = "";
  speakerFallback.classList.remove("show");

  try {
    const res = await fetch(WIKI_THUMB(name));
    if (!res.ok) throw new Error("no wiki entry");
    const data = await res.json();
    if (data.thumbnail && data.thumbnail.source) {
      speakerImg.src = data.thumbnail.source;
      speakerImg.alt = `Portrait of ${name}`;
      speakerImg.style.display = "block";
    } else {
      showFallback(name);
    }
  } catch {
    showFallback(name);
  }
}

function showFallback(name) {
  speakerInitial.textContent = name.charAt(0).toUpperCase();
  speakerFallback.classList.add("show");
}

/* ── NAVIGATION ───────────────────────────────────────────── */
async function showNext() {
  const q = pickUnseen();
  history = history.slice(0, histPos + 1); // trim forward history if mid-stack
  history.push(q);
  histPos = history.length - 1;
  saveState();
  await displayQuote(q);
  resetAutoTimer();
}

async function showPrev() {
  if (histPos <= 0) return; // nothing before first
  histPos--;
  saveState();
  await displayQuote(history[histPos]);
  resetAutoTimer();
}

/* ── AUTO-ROTATION ────────────────────────────────────────── */
function startAutoTimer() {
  autoTimer = setInterval(showNext, INTERVAL_MS);
}

function resetAutoTimer() {
  clearInterval(autoTimer);
  startAutoTimer();
}

/* ── TIMER BAR ────────────────────────────────────────────── */
function restartTimerBar() {
  const bar = document.getElementById("timerBar");
  bar.style.animation = "none";
  void bar.offsetHeight;
  bar.style.animation = "";
}

/* ── UTIL ─────────────────────────────────────────────────── */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── CONTACT FORM — EmailJS ───────────────────────────────── */
const sendBtn = document.getElementById("sendBtn");
const sendBtnText = document.getElementById("sendBtnText");
const contactFeedback = document.getElementById("contactFeedback");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactMsg = document.getElementById("contactMsg");

const EMAILJS_SERVICE = "service_jx17kug";
const EMAILJS_TEMPLATE = "template_eyxz136";

sendBtn.addEventListener("click", async () => {
  const name = contactName.value.trim();
  const email = contactEmail.value.trim();
  const msg = contactMsg.value.trim();

  // Validation
  if (!name || !email || !msg) {
    contactFeedback.style.color = "#e07070";
    contactFeedback.textContent = "Please fill in all fields.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    contactFeedback.style.color = "#e07070";
    contactFeedback.textContent = "Please enter a valid email address.";
    return;
  }

  // Sending state
  sendBtn.disabled = true;
  sendBtnText.textContent = "Sending…";
  contactFeedback.textContent = "";

  try {
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      name: name,
      email: email,
      message: msg,
    });

    contactFeedback.style.color = "var(--gold)";
    contactFeedback.textContent = `Message sent — thanks, ${name}!`;
    contactName.value = "";
    contactEmail.value = "";
    contactMsg.value = "";
  } catch (err) {
    console.error("EmailJS error:", err);
    contactFeedback.style.color = "#e07070";
    contactFeedback.textContent = "Something went wrong. Please try again.";
  } finally {
    sendBtn.disabled = false;
    sendBtnText.textContent = "Send Message";
  }
});

/* ── MOBILE NAV ───────────────────────────────────────────── */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks
  .querySelectorAll("a")
  .forEach((link) =>
    link.addEventListener("click", () => navLinks.classList.remove("open")),
  );

/* ── BUTTON LISTENERS ─────────────────────────────────────── */
prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);
newBtn.addEventListener("click", showNext);

/* ── INIT ─────────────────────────────────────────────────── */
(async function init() {
  // Try to restore pool from localStorage first
  // so returning users don't wait for API calls
  loadState();

  // Always rebuild pool on fresh visit (pool empty)
  // or if pool is stale (less than 20 quotes — probably old session)
  if (pool.length < 20) {
    await buildPool();
  }

  // Show first quote
  await showNext();
  startAutoTimer();
})();
