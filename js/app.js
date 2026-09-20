/* ============================================================
   QOUTA — app.js
   Curated quotes bank — 150 hand-picked quotes
   Seen-stack per browser via localStorage
   ============================================================ */

"use strict";

const INTERVAL_MS  = 5 * 60 * 1000;
const WIKI_THUMB   = (name) => `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
const STORAGE_POOL = "qouta_pool_v3";
const STORAGE_SEEN = "qouta_seen_v3";
const STORAGE_HIST = "qouta_history_v3";

const CURATED = [
  // POLITICS
  { content: "Ask not what your country can do for you — ask what you can do for your country.", author: "John F. Kennedy" },
  { content: "Change will not come if we wait for some other person or some other time.", author: "Barack Obama" },
  { content: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { content: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { content: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { content: "In the long run, we shape our lives, and we shape ourselves.", author: "Eleanor Roosevelt" },
  { content: "The ballot is stronger than the bullet.", author: "Abraham Lincoln" },
  { content: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
  { content: "If you're going through hell, keep going.", author: "Winston Churchill" },
  // MUSIC
  { content: "In a world filled with hate, we must still dare to hope. In a world filled with anger, we must still dare to comfort.", author: "Michael Jackson" },
  { content: "To live is to suffer, to survive is to find some meaning in the suffering.", author: "Tupac Shakur" },
  { content: "If you can make it through the night, there's a brighter day.", author: "Tupac Shakur" },
  { content: "Don't gain the world and lose your soul, wisdom is better than silver or gold.", author: "Bob Marley" },
  { content: "One good thing about music, when it hits you, you feel no pain.", author: "Bob Marley" },
  { content: "Emancipate yourselves from mental slavery. None but ourselves can free our minds.", author: "Bob Marley" },
  { content: "The music you make is a reflection of where your heart is.", author: "Beyoncé" },
  { content: "Power means happiness; power means hard work and sacrifice.", author: "Beyoncé" },
  { content: "I've been imitated so well I've heard people copy my mistakes.", author: "Jimi Hendrix" },
  // SPORTS
  { content: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali" },
  { content: "Float like a butterfly, sting like a bee.", author: "Muhammad Ali" },
  { content: "Impossible is nothing.", author: "Muhammad Ali" },
  { content: "I'll do whatever it takes to win games.", author: "Kobe Bryant" },
  { content: "The most important thing is to try and inspire people so that they can be great in whatever they want to do.", author: "Kobe Bryant" },
  { content: "I can accept failure, everyone fails at something. But I can't accept not trying.", author: "Michael Jordan" },
  { content: "Talent wins games, but teamwork and intelligence win championships.", author: "Michael Jordan" },
  { content: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { content: "You have to believe in yourself when no one else does.", author: "Serena Williams" },
  { content: "I really think a champion is defined not by their wins but by how they can recover when they fall.", author: "Serena Williams" },
  // SCIENCE & TECH
  { content: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { content: "Life is like riding a bicycle. To keep your balance you must keep moving.", author: "Albert Einstein" },
  { content: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
  { content: "Intelligence is the ability to adapt to change.", author: "Stephen Hawking" },
  { content: "However difficult life may seem, there is always something you can do and succeed at.", author: "Stephen Hawking" },
  { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { content: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
  { content: "Persistence is very important. You should not give up unless you are forced to give up.", author: "Elon Musk" },
  { content: "The Universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  // FILM & ENTERTAINMENT
  { content: "Stop letting people who do so little for you control so much of your mind, feelings and emotions.", author: "Will Smith" },
  { content: "The separation of talent and skill is one of the greatest misunderstood concepts for people who are trying to excel.", author: "Will Smith" },
  { content: "You pray for rain, you gotta deal with the mud too. That's a part of it.", author: "Denzel Washington" },
  { content: "Man gives you the award but God gives you the reward.", author: "Denzel Washington" },
  { content: "The biggest adventure you can take is to live the life of your dreams.", author: "Oprah Winfrey" },
  { content: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { content: "Be thankful for what you have; you'll end up having more.", author: "Oprah Winfrey" },
  // LITERATURE — AFRICAN
  { content: "The man dies in all who keep silent in the face of tyranny.", author: "Wole Soyinka" },
  { content: "The greatest threat to freedom is the absence of criticism.", author: "Wole Soyinka" },
  { content: "Books and all forms of writing are terror to those who wish to suppress the truth.", author: "Wole Soyinka" },
  { content: "One of the truest tests of integrity is its blunt refusal to be compromised.", author: "Chinua Achebe" },
  { content: "When suffering knocks at your door and you say there is no seat for him, he tells you not to worry because he has brought his own stool.", author: "Chinua Achebe" },
  { content: "A man who calls his kinsmen to a feast does not do so to redeem them from starving; he does so to show them the food he is cooking.", author: "Chinua Achebe" },
  { content: "I work toward the liberation of women, but I'm not a feminist. I'm just a woman who believes in equal opportunities for both genders.", author: "Buchi Emecheta" },
  { content: "I think, personally, that women together can do anything.", author: "Buchi Emecheta" },
  { content: "A woman without a man is like a field without seed.", author: "Flora Nwapa" },
  { content: "The story of a woman is the story of life.", author: "Flora Nwapa" },
  // LITERATURE — GLOBAL
  { content: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
  { content: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare" },
  { content: "There is nothing either good or bad, but thinking makes it so.", author: "William Shakespeare" },
  { content: "People are hard to live with. Use your intellect to guide you and you will end up putting people off.", author: "Natsume Sōseki" },
  { content: "Loneliness is the price we have to pay for being born in this modern age, so full of freedom, independence, and our own egotistical selves.", author: "Natsume Sōseki" },
  { content: "I believe that words uttered in passion contain a greater living truth than do those words which express thoughts rationally conceived.", author: "Natsume Sōseki" },
  { content: "If you don't change, you die. It's that simple. It's that cruel.", author: "Eileen Chang" },
  { content: "The best things in life make you sweaty.", author: "Eileen Chang" },
  { content: "You can destroy your now by worrying about tomorrow.", author: "Janis Joplin" },
  { content: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel.", author: "Maya Angelou" },
  { content: "I've learned that you can tell a lot about a person by the way they handle these three things: a rainy day, lost luggage, and tangled Christmas tree lights.", author: "Maya Angelou" },
  { content: "Nothing will work unless you do.", author: "Maya Angelou" },
  { content: "If you don't like something, change it. If you can't change it, change your attitude.", author: "Maya Angelou" },
  { content: "The more that you read, the more things you will know.", author: "Mark Twain" },
  { content: "If you tell the truth, you don't have to remember anything.", author: "Mark Twain" },
  { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { content: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
  // ANIME — NARUTO
  { content: "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way.", author: "Naruto Uzumaki (Naruto)" },
  { content: "Hard work is worthless for those that don't believe in themselves.", author: "Naruto Uzumaki (Naruto)" },
  { content: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be.", author: "Naruto Uzumaki (Naruto)" },
  { content: "Growth occurs when one goes beyond one's limits.", author: "Itachi Uchiha (Naruto)" },
  { content: "Those who cannot acknowledge themselves will eventually fail.", author: "Itachi Uchiha (Naruto)" },
  { content: "People live their lives bound by what they accept as correct and true. That is how they define reality.", author: "Itachi Uchiha (Naruto)" },
  { content: "A smile is the easiest way out of a difficult situation.", author: "Rock Lee (Naruto)" },
  { content: "Never give up without even trying. Do what you can, no matter how small the effect it may have!", author: "Onoki (Naruto)" },
  { content: "The pain of being alone is completely out of this world, isn't it? I don't know why, but I understand your feelings so much, it actually hurts.", author: "Naruto Uzumaki (Naruto)" },
  { content: "Sometimes you must hurt in order to know, fall in order to grow, lose in order to gain because life's greatest lessons are learned through pain.", author: "Pain (Naruto)" },
  // ANIME — ONE PIECE
  { content: "I don't want to conquer anything. I just think the guy with the most freedom in the whole ocean is the Pirate King!", author: "Monkey D. Luffy (One Piece)" },
  { content: "Inherited will, the destiny of the age, and the dreams of its people. As long as people continue to pursue the meaning of freedom, these things will never cease!", author: "Gol D. Roger (One Piece)" },
  { content: "No matter how hard or how impossible it is, never lose sight of your goal.", author: "Monkey D. Luffy (One Piece)" },
  { content: "When the world shoves you around, you just gotta stand up and shove back.", author: "Roronoa Zoro (One Piece)" },
  { content: "Only I can call my dream stupid!", author: "Monkey D. Luffy (One Piece)" },
  { content: "Power isn't determined by your size, but the size of your heart and dreams!", author: "Monkey D. Luffy (One Piece)" },
  // ANIME — ATTACK ON TITAN
  { content: "If you win, you live. If you lose, you die. If you don't fight, you can't win.", author: "Eren Yeager (Attack on Titan)" },
  { content: "The world is merciless, and it's also very beautiful.", author: "Mikasa Ackerman (Attack on Titan)" },
  { content: "If you begin to regret, you'll dull your future decisions and let others make your choices for you.", author: "Levi Ackerman (Attack on Titan)" },
  { content: "What is the point of being the strongest if I can't protect those who are important to me?", author: "Levi Ackerman (Attack on Titan)" },
  { content: "The only thing we're allowed to do is to believe that we won't regret the choice we made.", author: "Levi Ackerman (Attack on Titan)" },
  { content: "People, who can't throw something important away, can never hope to change anything.", author: "Armin Arlert (Attack on Titan)" },
  // ANIME — DEMON SLAYER
  { content: "Set your heart ablaze!", author: "Kyojuro Rengoku (Demon Slayer)" },
  { content: "No matter how many people you may lose, you have no choice but to go on living.", author: "Tanjiro Kamado (Demon Slayer)" },
  { content: "It's okay to cry. It's okay to be angry. I'll keep walking forward.", author: "Tanjiro Kamado (Demon Slayer)" },
  { content: "Grow up and become a fine swordsman. Become the kind of person people can rely on.", author: "Kyojuro Rengoku (Demon Slayer)" },
  // ANIME — DEATH NOTE
  { content: "I am justice!", author: "Light Yagami (Death Note)" },
  { content: "The real evil is the power to kill people. Someone who finds himself with that power is cursed.", author: "L Lawliet (Death Note)" },
  { content: "If you use your head, you won't get fat even if you eat sweets.", author: "L Lawliet (Death Note)" },
  { content: "This world is rotten, and those who are making it rot deserve to die.", author: "Light Yagami (Death Note)" },
  // ANIME — FULLMETAL ALCHEMIST
  { content: "A lesson without pain is meaningless, for you cannot gain something without sacrificing something else in return.", author: "Edward Elric (Fullmetal Alchemist)" },
  { content: "There's no such thing as a painless lesson. They just don't exist.", author: "Edward Elric (Fullmetal Alchemist)" },
  { content: "Stand up and walk. Keep moving forward. You've got two good legs. So get up and use them.", author: "Edward Elric (Fullmetal Alchemist)" },
  { content: "The world isn't perfect, but it's there for us, doing the best it can. That's what makes it so damn beautiful.", author: "Roy Mustang (Fullmetal Alchemist)" },
  // ANIME — DRAGON BALL
  { content: "Power comes in response to a need, not a desire. You have to create that need.", author: "Goku (Dragon Ball Z)" },
  { content: "It's not over when you lose. It's over when you quit.", author: "Goku (Dragon Ball Z)" },
  { content: "I do not fear this new challenge. Rather like a true warrior I will rise to meet it.", author: "Vegeta (Dragon Ball Z)" },
  { content: "Kakarot... you are the mightiest Saiyan. It fills me with pride that you are my rival.", author: "Vegeta (Dragon Ball Z)" },
  // ANIME — HUNTER X HUNTER
  { content: "You should enjoy the little detours to the fullest. Because that's where you'll find the things more important than what you want.", author: "Ging Freecss (Hunter x Hunter)" },
  { content: "Qualification is something you decide for yourself. There's no need for others to approve it.", author: "Killua Zoldyck (Hunter x Hunter)" },
  // ANIME — MY HERO ACADEMIA
  { content: "A hero's job is never finished. No matter what happens, keep pressing forward!", author: "All Might (My Hero Academia)" },
  { content: "I have to work harder than anyone else to make it! I'll never catch up otherwise!", author: "Izuku Midoriya (My Hero Academia)" },
  { content: "You can become a hero.", author: "All Might (My Hero Academia)" },
  // ANIME — JUJUTSU KAISEN
  { content: "No matter what happens, don't regret being born into this world.", author: "Yuji Itadori (Jujutsu Kaisen)" },
  { content: "Dying surrounded by people you care about — sounds like a fine way to go.", author: "Yuji Itadori (Jujutsu Kaisen)" },
  { content: "Throughout heaven and earth, I alone am the honored one.", author: "Ryomen Sukuna (Jujutsu Kaisen)" },
  // ANIME — BLEACH / CODE GEASS / OTHERS
  { content: "Become strong enough that no one can protect you.", author: "Ichigo Kurosaki (Bleach)" },
  { content: "If fate is a millstone, then we are the grist. There is nothing we can do. So I wish for strength.", author: "Ichigo Kurosaki (Bleach)" },
  { content: "It's not the net worth of your life that's important. It is the way you live it.", author: "Lelouch vi Britannia (Code Geass)" },
  { content: "You can't win a game by doing nothing. And if someone else is making the moves, you'll always be one step behind.", author: "Lelouch vi Britannia (Code Geass)" },
  { content: "Don't give up! There's no shame in falling down. The true shame is to not stand up again!", author: "Shintaro Midorima (Kuroko's Basketball)" },
];

let pool = [], seen = [], history = [], histPos = -1, autoTimer = null, isBusy = false;

const skeletonBlock   = document.getElementById("skeletonBlock");
const skeletonImg     = document.getElementById("skeletonImg");
const quoteContent    = document.getElementById("quoteContent");
const speakerContent  = document.getElementById("speakerContent");
const quoteText       = document.getElementById("quoteText");
const quoteAuthor     = document.getElementById("quoteAuthor");
const speakerImg      = document.getElementById("speakerImg");
const speakerFallback = document.getElementById("speakerFallback");
const speakerInitial  = document.getElementById("speakerInitial");
const speakerLabel    = document.getElementById("speakerLabel");
const prevBtn         = document.getElementById("prevBtn");
const newBtn          = document.getElementById("newBtn");
const nextBtn         = document.getElementById("nextBtn");
const copyBtn         = document.getElementById("copyBtn");
const copyBtnText     = document.getElementById("copyBtnText");
const shareBtn        = document.getElementById("shareBtn");

function saveState() {
  try {
    localStorage.setItem(STORAGE_POOL, JSON.stringify(pool));
    localStorage.setItem(STORAGE_SEEN, JSON.stringify(seen));
    localStorage.setItem(STORAGE_HIST, JSON.stringify({ history, histPos }));
  } catch {}
}

function loadState() {
  try {
    const p = localStorage.getItem(STORAGE_POOL);
    const s = localStorage.getItem(STORAGE_SEEN);
    const h = localStorage.getItem(STORAGE_HIST);
    if (p) pool = JSON.parse(p);
    if (s) seen = JSON.parse(s);
    if (h) { const parsed = JSON.parse(h); history = parsed.history || []; histPos = parsed.histPos ?? -1; }
  } catch {}
}

function showSkeleton() {
  skeletonBlock.style.display = "block"; skeletonImg.style.display = "block";
  quoteContent.classList.remove("visible"); speakerContent.classList.remove("visible");
  quoteContent.style.display = "none"; speakerContent.style.display = "none";
}

function hideSkeleton() {
  skeletonBlock.style.display = "none"; skeletonImg.style.display = "none";
}

function buildPool() {
  pool = [...CURATED].sort(() => Math.random() - 0.5);
  seen = [];
  saveState();
}

function pickUnseen() {
  const available = pool.filter((_, i) => !seen.includes(i));
  if (available.length === 0) {
    seen = []; pool = pool.sort(() => Math.random() - 0.5);
    saveState(); return pool[0];
  }
  const pick  = Math.floor(Math.random() * available.length);
  const quote = available[pick];
  const idx   = pool.indexOf(quote);
  seen.push(idx); saveState();
  return quote;
}

async function displayQuote(q) {
  if (isBusy) return;
  isBusy = true;
  showSkeleton();
  await wait(500);
  quoteText.textContent    = q.content;
  quoteAuthor.textContent  = q.author;
  speakerLabel.textContent = q.author;
  await loadAuthorImage(q.author);
  hideSkeleton();
  quoteContent.style.display = "flex"; speakerContent.style.display = "flex";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      quoteContent.classList.add("visible");
      speakerContent.classList.add("visible");
      isBusy = false;
    });
  });
  restartTimerBar();
}

/* ── WIKI OVERRIDES — fixes ambiguous show names ──────────── */
const WIKI_OVERRIDES = {
  "Bleach":          "Bleach manga",
  "Naruto":          "Naruto manga",
  "Demon Slayer":    "Demon Slayer: Kimetsu no Yaiba",
  "Monster":         "Monster manga",
  "Hunter x Hunter": "Hunter × Hunter manga",
  "Dragon Ball Z":   "Dragon Ball manga",
};

function getWikiSearchName(author) {
  const match = author.match(/\(([^)]+)\)$/);
  if (match) {
    const showName = match[1];
    return WIKI_OVERRIDES[showName] || showName;
  }
  return author;
}

async function loadAuthorImage(name) {
  speakerImg.style.display = "none"; speakerImg.src = ""; speakerFallback.classList.remove("show");
  const searchName = getWikiSearchName(name);
  try {
    const res  = await fetch(WIKI_THUMB(searchName));
    if (!res.ok) throw new Error("no wiki");
    const data = await res.json();
    if (data.thumbnail && data.thumbnail.source) {
      speakerImg.src = data.thumbnail.source; speakerImg.alt = searchName; speakerImg.style.display = "block";
    } else { showFallback(name); }
  } catch { showFallback(name); }
}

function showFallback(name) {
  speakerInitial.textContent = name.charAt(0).toUpperCase();
  speakerFallback.classList.add("show");
}

async function showNext() {
  const q = pickUnseen();
  history = history.slice(0, histPos + 1); history.push(q); histPos = history.length - 1;
  saveState(); await displayQuote(q); resetAutoTimer();
}

async function showPrev() {
  if (histPos <= 0) return;
  histPos--; saveState(); await displayQuote(history[histPos]); resetAutoTimer();
}

function startAutoTimer() { autoTimer = setInterval(showNext, INTERVAL_MS); }
function resetAutoTimer()  { clearInterval(autoTimer); startAutoTimer(); }

function restartTimerBar() {
  const bar = document.getElementById("timerBar");
  bar.style.animation = "none"; void bar.offsetHeight; bar.style.animation = "";
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/* ── COPY ─────────────────────────────────────────────────── */
copyBtn.addEventListener("click", async () => {
  const text    = quoteText.textContent.trim();
  const author  = quoteAuthor.textContent.trim();
  const content = text ? `"${text}" — ${author}` : "No quote loaded yet.";
  try {
    await navigator.clipboard.writeText(content);
    copyBtnText.textContent = "Copied!"; copyBtn.classList.add("copied");
    setTimeout(() => { copyBtnText.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 2000);
  } catch {
    // Fallback for older mobile browsers
    try {
      const el = document.createElement("textarea");
      el.value = content; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      copyBtnText.textContent = "Copied!"; copyBtn.classList.add("copied");
      setTimeout(() => { copyBtnText.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 2000);
    } catch {
      copyBtnText.textContent = "Failed";
      setTimeout(() => { copyBtnText.textContent = "Copy"; }, 2000);
    }
  }
});

/* ── SHARE ────────────────────────────────────────────────── */
shareBtn.addEventListener("click", async () => {
  const text   = quoteText.textContent.trim();
  const author = quoteAuthor.textContent.trim();
  if (!text) return;
  const shareData = { title: "Qouta — Words That Last", text: `"${text}" — ${author}`, url: window.location.href };
  if (navigator.share) {
    try { await navigator.share(shareData); }
    catch (err) { if (err.name !== "AbortError") console.error("Share failed:", err); }
  } else {
    try {
      await navigator.clipboard.writeText(`"${text}" — ${author}\n${window.location.href}`);
      shareBtn.textContent = "Link copied!";
      setTimeout(() => { shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share`; }, 2000);
    } catch {}
  }
});

/* ── CONTACT — EmailJS ────────────────────────────────────── */
const sendBtn         = document.getElementById("sendBtn");
const sendBtnText     = document.getElementById("sendBtnText");
const contactFeedback = document.getElementById("contactFeedback");
const contactName     = document.getElementById("contactName");
const contactEmail    = document.getElementById("contactEmail");
const contactMsg      = document.getElementById("contactMsg");
const EMAILJS_SERVICE  = "service_jx17kug";
const EMAILJS_TEMPLATE = "template_eyxz136";

sendBtn.addEventListener("click", async () => {
  const name  = contactName.value.trim();
  const email = contactEmail.value.trim();
  const msg   = contactMsg.value.trim();
  if (!name || !email || !msg) { contactFeedback.style.color = "#e07070"; contactFeedback.textContent = "Please fill in all fields."; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { contactFeedback.style.color = "#e07070"; contactFeedback.textContent = "Please enter a valid email address."; return; }
  sendBtn.disabled = true; sendBtnText.textContent = "Sending…"; contactFeedback.textContent = "";
  try {
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { name, email, message: msg });
    contactFeedback.style.color = "var(--gold)"; contactFeedback.textContent = `Message sent — thanks, ${name}!`;
    contactName.value = ""; contactEmail.value = ""; contactMsg.value = "";
  } catch (err) {
    console.error("EmailJS error:", err);
    contactFeedback.style.color = "#e07070"; contactFeedback.textContent = "Something went wrong. Please try again.";
  } finally { sendBtn.disabled = false; sendBtnText.textContent = "Send Message"; }
});

/* ── MOBILE NAV ───────────────────────────────────────────── */
const navToggle = document.querySelector(".nav-toggle");
const navLinks  = document.querySelector(".nav-links");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.innerHTML = isOpen ? "&#10005;" : "&#9776;";
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open"); navToggle.innerHTML = "&#9776;";
}));

/* ── BUTTONS ──────────────────────────────────────────────── */
prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);
newBtn.addEventListener("click",  showNext);

/* ── INIT ─────────────────────────────────────────────────── */
(async function init() {
  loadState();
  if (pool.length < 20) buildPool();
  await showNext();
  startAutoTimer();
})();

