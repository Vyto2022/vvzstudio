// VVZ Studio — Telegram Bot integration

(function () {
    const BOT_USERNAME = "vvz_ai_bot";

    function getServiceKey() {
        const path = window.location.pathname.toLowerCase();

        if (path.includes("detailing")) return "detailing";
        if (path.includes("tires")) return "tires";
        if (path.includes("auto")) return "auto";

        return "landing";
    }

    function openBot(service) {
        const url = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(service)}`;
        window.open(url, "_blank", "noopener");
    }

    document.addEventListener("DOMContentLoaded", function () {
        const service = getServiceKey();

        // 1) Hero / header CTA, если нужно вести в Telegram
        const botLinks = document.querySelectorAll(
            'a[href*="t.me"], .js-open-bot'
        );

        botLinks.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                const href = btn.getAttribute("href") || "";

                // Перехватываем только Telegram-кнопки
                if (href.includes("t.me") || btn.classList.contains("js-open-bot")) {
                    e.preventDefault();
                    openBot(service);
                }
            });
        });
    });
})();