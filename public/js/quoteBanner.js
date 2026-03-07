// =========================
// QUOTE BANNER
// Cycles quietly in the red strip below the navbar.
// No overlay, no interruption.
// =========================

const QUOTES = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
  },
  {
    text: "Enduring means accepting things as they are, and then looking ahead.",
    author: "Rafael Nadal",
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
  },
  {
    text: "Push yourself because no one else is going to do it for you.",
    author: "Unknown",
  },
  {
    text: "Success is usually the culmination of controlling failure.",
    author: "Sylvester Stallone",
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
  },
  {
    text: "Don't count the days — make the days count.",
    author: "Muhammad Ali",
  },
  {
    text: "Your body can stand almost anything. It's your mind you have to convince.",
    author: "Unknown",
  },
  {
    text: "If it doesn't challenge you, it doesn't change you.",
    author: "Fred DeVito",
  },
  {
    text: "Strength does not come from physical capacity. It comes from indomitable will.",
    author: "Mahatma Gandhi",
  },
];

(function initQuoteBanner() {
  const el = document.getElementById("quoteBannerText");
  if (!el) return;

  // Pick a random starting quote (feels fresh each visit)
  let index = Math.floor(Math.random() * QUOTES.length);

  function showQuote() {
    const q = QUOTES[index];
    el.classList.remove("visible");

    setTimeout(() => {
      el.textContent = `"${q.text}" — ${q.author}`;
      el.classList.add("visible");
    }, 700); // wait for fade-out before swapping text

    index = (index + 1) % QUOTES.length;
  }

  // Show first quote immediately
  showQuote();

  // Rotate every 9 seconds
  setInterval(showQuote, 9000);
})();
