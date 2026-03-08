(() => {
  const BOT = "vvz_ai_bot";

  const byPath = () => {
    const p = location.pathname.toLowerCase();
    if (p.includes("detailing")) return "detailing";
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

  const handler = (e) => {
    const el = e.target.closest("[data-tg-start], .tg-lead, a[href*='t.me/']");
    if (!el) return;

    // не ломаем обычные клики по внутренним ссылкам сайта
    // перехватываем только те элементы, которые явно помечены или ведут на t.me
    const isMarked = el.matches("[data-tg-start], .tg-lead") || (el.tagName === "A" && (el.getAttribute("href") || "").includes("t.me/"));
    if (!isMarked) return;

    e.preventDefault();

    const payload = el.getAttribute("data-tg-start") || byPath();
    openBot(payload);
  };

  document.addEventListener("click", handler, true);
})();
