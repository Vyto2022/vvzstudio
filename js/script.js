document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. ОБНОВЛЕНИЕ ГОДА В ФУТЕРЕ
  // ==========================================
  const yearSpan = document.getElementById("y");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ==========================================
  // 2. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
  // ==========================================
  const burgerBtn = document.querySelector("[data-burger]");
  const mobileMenu = document.querySelector("[data-mobile]");

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
      // Переключаем класс для показа/скрытия
      const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
      burgerBtn.setAttribute("aria-expanded", !isExpanded);
      mobileMenu.classList.toggle("is-open");
    });

    // Закрываем меню при клике на любую ссылку внутри него
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        burgerBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
      });
    });
  }

  // ==========================================
  // 3. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКОВ (Для десктопа)
  // ==========================================
  const langBtn = document.querySelector(".langBtn");
  const langMenu = document.querySelector(".langMenu");

  if (langBtn && langMenu) {
    const langDropdown = langMenu.querySelector('.langDropdown');
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Если используем класс для показа, а не CSS :focus-within
      if (langDropdown) langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener("click", () => {
      if (langDropdown) langDropdown.style.display = 'none';
    });
  }

  // ==========================================
  // 4. ОТПРАВКА ФОРМЫ В GOOGLE SHEETS
  // ==========================================
  // Ищем форму либо по ID (VVZ Studio), либо по data-атрибуту (Garage Dupont)
  const quoteForm = document.getElementById("quoteForm") || document.querySelector("[data-contact-form]");

  if (quoteForm) {
    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = quoteForm.querySelector('button[type="submit"]');
      const status = document.getElementById("formStatus") || document.createElement("div");

      // Если блока статуса нет (например, во французском макете), создаем его
      if (!document.getElementById("formStatus")) {
        status.id = "formStatus";
        status.style.marginTop = "10px";
        status.style.fontSize = "14px";
        quoteForm.appendChild(status);
      }

      const originalBtnText = btn.textContent;

      // Визуальный фидбек: блокируем кнопку
      btn.disabled = true;
      btn.textContent = "...";
      status.style.color = "inherit"; // берет цвет текста
      status.style.opacity = "0.7";
      status.textContent = "Sending / Envoi / Отправка...";

      // Сбор данных
      const formData = new FormData(quoteForm);

      // Добавляем системные данные
      formData.append("lang", document.documentElement.lang || "en");
      formData.append("page", window.location.pathname);
      formData.append("ua", navigator.userAgent);
      if (!formData.has("hp")) formData.append("hp", ""); // ловушка для ботов

      // ТВОЯ ССЫЛКА ИЗ GOOGLE APPS SCRIPT
      const GAS_URL = "https://script.google.com/macros/s/1NXAzBiFEQvbSqGaTZLy3ri3AGli9rNYjn0xjZwek8Qt2J-IcxNakDQjX/exec";

      try {
        await fetch(GAS_URL, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        });

        // После успешной отправки — редирект
        const lang = document.documentElement.lang || "en";
        const thanksPages = {
          en: "thanks.html",
          fr: "thanks-ru.html",
          ru: "thanks-fr.html",
        };

        // Небольшая задержка, чтобы пользователь успел увидеть, что отправка прошла
        status.style.color = "#4CAF50"; // Зеленый цвет успеха
        status.textContent = "Success! / Succès ! / Успешно!";

        setTimeout(() => {
          window.location.href = thanksPages[lang] || "thanks.html";
        }, 600);

      } catch (error) {
        console.error("Submission error:", error);
        status.style.color = "#ff4d4d";
        status.textContent = "Error. Please contact us via WhatsApp.";
        btn.disabled = false;
        btn.textContent = originalBtnText;
      }
    });
  }

  // ==========================================
  // 5. ЛИПКАЯ КНОПКА (Sticky CTA) ДЛЯ МОБИЛОК
  // ==========================================
  const hero = document.querySelector(".hero-card") || document.querySelector(".hero");
  const contact = document.getElementById("contact");
  const sticky = document.querySelector(".sticky-cta");

  if (hero && contact && sticky) {
    const updateSticky = () => {
      // Скрываем на десктопах
      if (window.innerWidth > 900) {
        sticky.style.display = "none";
        return;
      }
      const heroBottom = hero.getBoundingClientRect().bottom;
      const contactTop = contact.getBoundingClientRect().top;

      // Показываем, когда проскроллили первый экран (Hero), и скрываем, когда дошли до формы
      const show = heroBottom < 0 && contactTop > window.innerHeight;
      sticky.style.display = show ? "flex" : "none";
    };

    window.addEventListener("scroll", updateSticky, { passive: true });
    updateSticky();
  }
});
