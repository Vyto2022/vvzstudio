(() => {
  const BOT = "vvz_ai_bot";
  const BOT_HOSTS = new Set(["t.me", "telegram.me"]);

  const byPath = () => {
    const p = location.pathname.toLowerCase();
    if (p.includes("cleaning")) return "cleaning";
    if (p.includes("tires")) return "tires";
    if (p.includes("auto")) return "auto";
    return "landing";
  };

  const openBot = (payload) => {
    const url = `https://t.me/${BOT}?start=${encodeURIComponent(payload)}`;
    // 1) пробуем открыть в новой вкладке
    const w = window.open(url, "_blank");
    // 2) если браузер заблокировал popup — открываем в этой же вкладке
    if (!w) location.href = url;
  };

  const isCanonicalBotLink = (el) => {
    if (el.tagName !== "A") return false;

    const href = el.getAttribute("href") || "";
    try {
      const url = new URL(href, location.href);
      const username = url.pathname.split("/").filter(Boolean)[0] || "";
      return BOT_HOSTS.has(url.hostname.toLowerCase()) && username.toLowerCase() === BOT;
    } catch (_) {
      return false;
    }
  };

  const handler = (e) => {
    const el = e.target.closest("[data-tg-start], .tg-lead, a[href*='t.me/'], a[href*='telegram.me/']");
    if (!el) return;

    // Intercept only explicit bot CTAs or the canonical VVZ bot link.
    const isMarked = el.matches("[data-tg-start], .tg-lead") || isCanonicalBotLink(el);
    if (!isMarked) return;

    e.preventDefault();

    const payload = el.getAttribute("data-tg-start") || byPath();
    openBot(payload);
  };

  document.addEventListener("click", handler, true);
})();
