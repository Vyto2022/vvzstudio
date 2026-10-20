const VVZ_LANGUAGE_STORAGE_KEY = "vvzstudioLanguageChoice";
const VVZ_LANGUAGE_PATHS = {
  fr: "/",
  en: "/index-en.html",
  ru: "/index-ru.html",
};

function initVVZLanguageRouting() {
  const languageForPath = (path) => {
    if (path === VVZ_LANGUAGE_PATHS.en) return "en";
    if (path === VVZ_LANGUAGE_PATHS.ru) return "ru";
    if (path === VVZ_LANGUAGE_PATHS.fr) return "fr";
    return null;
  };

  const readSavedLanguage = () => {
    try {
      const savedLanguage = window.localStorage.getItem(VVZ_LANGUAGE_STORAGE_KEY);
      return Object.prototype.hasOwnProperty.call(VVZ_LANGUAGE_PATHS, savedLanguage)
        ? savedLanguage
        : null;
    } catch (storageError) {
      return null;
    }
  };

  const saveLanguage = (language) => {
    try {
      window.localStorage.setItem(VVZ_LANGUAGE_STORAGE_KEY, language);
    } catch (storageError) {
      // Continue normally when persistent storage is unavailable.
    }
  };

  const browserLanguage = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
  const normalizedBrowserLanguage = String(browserLanguage || "").toLowerCase();
  const browserTargetLanguage = normalizedBrowserLanguage.startsWith("ru")
    ? "ru"
    : normalizedBrowserLanguage.startsWith("en")
      ? "en"
      : "fr";
  const savedLanguage = readSavedLanguage();

  if (window.location.pathname === "/") {
    const targetLanguage = savedLanguage || browserTargetLanguage;
    const targetPath = VVZ_LANGUAGE_PATHS[targetLanguage];
    if (targetPath !== window.location.pathname) {
      window.location.replace(targetPath);
      return;
    }
  }

  document.querySelectorAll(".langDropdown a").forEach((link) => {
    const language = link.dataset.language || languageForPath(new URL(link.href, window.location.href).pathname);
    if (language) link.addEventListener("click", () => saveLanguage(language));
  });
}

function initVVZSite() {
  initVVZLanguageRouting();
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
  // 4. ОТПРАВКА ФОРМЫ В VVZ LEAD SYSTEM
  // ==========================================
  const IDEMPOTENCY_STORAGE_KEY = "vvzstudioLeadIdempotency";
  let leadIdempotencyMemory = null;

  const getLeadIdempotencyStorage = () => {
    try {
      const storage = window.sessionStorage;
      const testKey = `${IDEMPOTENCY_STORAGE_KEY}:test`;
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return storage;
    } catch (storageError) {
      return null;
    }
  };

  const generateLeadIdempotencyKey = () => {
    const cryptoObject = window.crypto || window.msCrypto;
    if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
      return cryptoObject.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
      cryptoObject.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  };

  const formDataValueFingerprint = (value) => {
    if (typeof File !== "undefined" && value instanceof File) {
      return `file:${value.name}:${value.size}:${value.type}:${value.lastModified}`;
    }
    if (typeof Blob !== "undefined" && value instanceof Blob) {
      return `blob:${value.size}:${value.type}`;
    }
    return `text:${String(value)}`;
  };

  const fingerprintString = (input) => {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${input.length}:${(hash >>> 0).toString(16).padStart(8, "0")}`;
  };

  const getFinalFormDataFingerprint = (formData) => {
    const entries = Array.from(formData.entries()).map(([name, value]) => {
      return `${name}\u001f${formDataValueFingerprint(value)}`;
    });
    entries.sort();
    return fingerprintString(entries.join("\u001e"));
  };

  const readLeadIdempotencyState = () => {
    const storage = getLeadIdempotencyStorage();
    if (!storage) return leadIdempotencyMemory;

    try {
      const stored = storage.getItem(IDEMPOTENCY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : leadIdempotencyMemory;
    } catch (storageError) {
      return leadIdempotencyMemory;
    }
  };

  const writeLeadIdempotencyState = (state) => {
    leadIdempotencyMemory = state;
    const storage = getLeadIdempotencyStorage();
    if (!storage) return;

    try {
      storage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(state));
    } catch (storageError) {
      // Keep the in-memory copy when sessionStorage is unavailable or full.
    }
  };

  const clearLeadIdempotencyState = (fingerprint, key) => {
    const currentState = readLeadIdempotencyState();
    if (
      !currentState ||
      currentState.fingerprint !== fingerprint ||
      currentState.key !== key
    ) {
      return;
    }

    leadIdempotencyMemory = null;
    const storage = getLeadIdempotencyStorage();
    if (!storage) return;

    try {
      storage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    } catch (storageError) {
      // Nothing else to clear when persistent storage refuses access.
    }
  };

  const getLeadIdempotencyKey = (fingerprint) => {
    const currentState = readLeadIdempotencyState();
    if (
      currentState &&
      currentState.fingerprint === fingerprint &&
      typeof currentState.key === "string" &&
      currentState.key.length > 0 &&
      currentState.key.length <= 128
    ) {
      return currentState.key;
    }

    const key = generateLeadIdempotencyKey().slice(0, 128);
    writeLeadIdempotencyState({ fingerprint, key });
    return key;
  };

  // Ищем формы либо по ID (VVZ Studio), либо по data-атрибуту (Garage Dupont)
  const leadForms = Array.from(document.querySelectorAll("#quoteForm, [data-contact-form]"));

  leadForms.forEach((quoteForm, formIndex) => {
    const validationText = {
      en: {
        legend: "* — Required field",
        exampleLabel: "Example",
        required: (example) => `This field is required. Valid example: ${example}`,
        tooShort: (min, example) => `Please enter at least ${min} characters. Valid example: ${example}`,
        tooLong: (max, example) => `Please use ${max} characters or fewer. Valid example: ${example}`,
        email: (example) => `Enter a valid email address. Valid example: ${example}`,
        phone: (example) => `Enter a valid phone number, for example: ${example}`,
        summary: "Please correct the highlighted fields.",
        network: "Network error. Check your connection and try again.",
        server: "Server submission error. Please try again later.",
        examples: {
          name: "Marie Dupont",
          email: "marie.dupont+site@example.com",
          phone: "+33 6 12 34 56 78",
          city: "Lyon",
          business: "Auto repair shop",
          project: "VVZ ERP Suite",
          message: "We need to track requests, statuses and team reminders.",
        },
      },
      fr: {
        legend: "* — Champ obligatoire",
        exampleLabel: "Exemple",
        required: (example) => `Ce champ est obligatoire. Exemple valide : ${example}`,
        tooShort: (min, example) => `Saisissez au moins ${min} caractères. Exemple valide : ${example}`,
        tooLong: (max, example) => `Utilisez ${max} caractères ou moins. Exemple valide : ${example}`,
        email: (example) => `Saisissez une adresse e-mail valide. Exemple valide : ${example}`,
        phone: (example) => `Saisissez un numéro valide, par exemple : ${example}`,
        summary: "Corrigez les champs signalés.",
        network: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
        server: "Erreur d’envoi au serveur. Réessayez plus tard.",
        examples: {
          name: "Marie Dupont",
          email: "marie.dupont+site@example.com",
          phone: "06 12 34 56 78",
          city: "Lyon",
          business: "Garage automobile",
          project: "VVZ ERP Suite",
          message: "Nous voulons suivre les demandes, les statuts et les rappels de l’équipe.",
        },
      },
      ru: {
        legend: "* — Обязательное поле",
        exampleLabel: "Пример",
        required: (example) => `Это поле обязательно. Пример корректного значения: ${example}`,
        tooShort: (min, example) => `Введите не менее ${min} символов. Пример корректного значения: ${example}`,
        tooLong: (max, example) => `Используйте не более ${max} символов. Пример корректного значения: ${example}`,
        email: (example) => `Введите корректный адрес электронной почты. Пример: ${example}`,
        phone: (example) => `Введите корректный номер телефона, например: ${example}`,
        summary: "Исправьте отмеченные поля.",
        network: "Ошибка сети. Проверьте соединение и повторите попытку.",
        server: "Ошибка отправки на сервер. Повторите попытку позже.",
        examples: {
          name: "Мария Иванова",
          email: "maria.ivanova+site@example.com",
          phone: "+33 6 12 34 56 78",
          city: "Лион",
          business: "Автосервис",
          project: "VVZ ERP Suite",
          message: "Нужно отслеживать заявки, статусы и напоминания для команды.",
        },
      },
    };
    const language = String(document.documentElement.lang || "en").slice(0, 2);
    const messages = validationText[language] || validationText.en;
    const formIdPrefix = `lead-form-${formIndex}`;
    const formFields = Array.from(quoteForm.querySelectorAll("input[name]:not([type=\"hidden\"]), select[name], textarea[name]"));

    const getFieldExample = (field) => messages.examples[field.name] || "a valid value";

    const getFieldLabel = (field) => {
      if (field.closest("label")) return field.closest("label");
      const matchingLabel = quoteForm.querySelector(`label[for="${CSS.escape(field.id)}"]`);
      if (matchingLabel) return matchingLabel;
      const previous = field.previousElementSibling;
      if (previous && previous.tagName === "LABEL") return previous;
      return field.parentElement ? field.parentElement.querySelector("label") : null;
    };

    const getFieldDescription = (field) => {
      const fieldIndex = formFields.indexOf(field);
      const fieldId = `${formIdPrefix}-field-${fieldIndex}`;
      const exampleId = `${fieldId}-example`;
      const errorId = `${fieldId}-error`;
      if (!field.id) field.id = fieldId;

      const label = getFieldLabel(field);
      if (label && !field.closest("label")) label.setAttribute("for", field.id);
      if (label && field.required && !label.querySelector(".required-marker")) {
        const marker = document.createElement("span");
        marker.className = "required-marker";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = " *";
        label.appendChild(marker);
      }

      let example = quoteForm.querySelector(`#${CSS.escape(exampleId)}`);
      if (!example) {
        example = document.createElement("span");
        example.id = exampleId;
        example.className = "field-example";
        example.textContent = `${messages.exampleLabel || "Example"}: ${getFieldExample(field)}`;
        field.insertAdjacentElement("afterend", example);
      }

      let error = quoteForm.querySelector(`#${CSS.escape(errorId)}`);
      if (!error) {
        error = document.createElement("span");
        error.id = errorId;
        error.className = "field-error";
        error.setAttribute("role", "alert");
        error.hidden = true;
        example.insertAdjacentElement("afterend", error);
      }

      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(example.id);
      field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
      return { error, example };
    };

    const requiredLegend = document.createElement("p");
    requiredLegend.className = "form-required-legend";
    requiredLegend.textContent = messages.legend;
    const formHeading = quoteForm.querySelector(":scope > h3");
    if (formHeading) formHeading.insertAdjacentElement("afterend", requiredLegend);
    else quoteForm.insertAdjacentElement("afterbegin", requiredLegend);

    const fieldMessage = (field) => {
      const value = String(field.value || "").trim();
      const minLength = field.name === "name" ? 2 : field.name === "message" ? 10 : 0;
      const maxLength = {
        name: 80,
        email: 160,
        phone: 40,
        city: 80,
        business: 120,
        project: 80,
        message: 1500,
      }[field.name];

      if (field.required && !value) return messages.required(getFieldExample(field));
      if (!value) return "";
      if (field.name === "email" && !/^[^\s@]+@[^\s@]+(?:\.[^\s@]+)+$/.test(value)) {
        return messages.email(getFieldExample(field));
      }
      if (field.name === "phone") {
        const normalizedPhone = value.replace(/[\s().-]/g, "");
        if (!/^(?:\+|00)?\d{8,15}$/.test(normalizedPhone)) {
          return messages.phone(getFieldExample(field));
        }
      }
      if (minLength && value.length < minLength) return messages.tooShort(minLength, getFieldExample(field));
      if (maxLength && value.length > maxLength) return messages.tooLong(maxLength, getFieldExample(field));
      return "";
    };

    const renderFieldError = (field, overrideMessage = "") => {
      const message = overrideMessage || fieldMessage(field);
      const { error } = getFieldDescription(field);
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));

      if (message) {
        error.textContent = `⚠ ${message}`;
        error.hidden = false;
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        describedBy.add(error.id);
        field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
      } else {
        error.textContent = "";
        error.hidden = true;
        field.classList.remove("is-invalid");
        field.setAttribute("aria-invalid", "false");
        describedBy.delete(error.id);
        field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
      }
      return message;
    };

    quoteForm.addEventListener("invalid", (event) => {
      if (!formFields.includes(event.target)) return;
      event.preventDefault();
      event.target.dataset.touched = "true";
      renderFieldError(event.target);
    }, true);

    formFields.forEach((field) => {
      getFieldDescription(field);
      const updateAfterEdit = () => {
        if (field.getAttribute("aria-invalid") === "true" || field.dataset.touched === "true") {
          renderFieldError(field);
        }
      };
      field.addEventListener("input", updateAfterEdit);
      field.addEventListener("change", updateAfterEdit);
      field.addEventListener("blur", () => {
        field.dataset.touched = "true";
        renderFieldError(field);
      });
    });

    const setFieldLimits = (name, attrs) => {
      const field = quoteForm.querySelector(`[name="${name}"]`);
      if (!field) return;
      Object.entries(attrs).forEach(([attr, value]) => field.setAttribute(attr, value));
    };

    setFieldLimits("name", { minlength: "2", maxlength: "80" });
    setFieldLimits("email", { maxlength: "160" });
    setFieldLimits("phone", { maxlength: "40" });
    setFieldLimits("city", { maxlength: "80" });
    setFieldLimits("business", { maxlength: "120" });
    setFieldLimits("project", { maxlength: "80" });
    setFieldLimits("message", { minlength: "10", maxlength: "1500" });

    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.info("VVZ lead submit captured");

      const btn = quoteForm.querySelector('button[type="submit"]');
      const status = quoteForm.querySelector("#formStatus, [data-form-status]") || document.getElementById("formStatus") || document.createElement("div");

      // Если блока статуса нет (например, во французском макете), создаем его
      if (!status.parentElement) {
        status.id = "formStatus";
        status.style.marginTop = "10px";
        status.style.fontSize = "14px";
        quoteForm.appendChild(status);
      }

      const originalBtnText = btn.textContent;

      const invalidFields = formFields.filter((field) => {
        field.dataset.touched = "true";
        return Boolean(renderFieldError(field));
      });

      if (invalidFields.length) {
        status.style.color = "#ff8a8a";
        status.style.opacity = "1";
        status.textContent = messages.summary;
        invalidFields[0].focus();
        return;
      }

      // Визуальный фидбек: блокируем кнопку
      btn.disabled = true;
      btn.textContent = "...";
      status.style.color = "inherit"; // берет цвет текста
      status.style.opacity = "0.7";
      status.textContent = "Sending / Envoi / Отправка...";

      // Сбор данных
      const formData = new FormData(quoteForm);
      const trimmedValue = (...keys) => {
        for (const key of keys) {
          const value = formData.get(key);
          if (typeof value === "string" && value.trim()) return value.trim();
        }
        return "";
      };
      const nameValue = trimmedValue("name");
      const emailValue = trimmedValue("email");
      const phoneValue = trimmedValue("phone");
      const cityValue = trimmedValue("city");
      const businessValue = trimmedValue("business");
      const messageValue = trimmedValue("message");
      formData.set("name", nameValue);
      formData.set("message", messageValue);
      if (emailValue) formData.set("email", emailValue);
      formData.set("phone", phoneValue);
      formData.set("city", cityValue);
      formData.set("business", businessValue);

      // Добавляем системные данные
      formData.append("lang", document.documentElement.lang || "en");
      formData.append("page", window.location.pathname);
      formData.append("ua", navigator.userAgent);
      if (!formData.has("hp")) formData.append("hp", ""); // ловушка для ботов

      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
        if (params.has(key) && !formData.has(key)) formData.append(key, params.get(key));
      });
      if (document.referrer && !formData.has("referrer")) formData.append("referrer", document.referrer);

      const VVZ_LEAD_URL = "/api/public/vvzstudio/leads";
      const formDataFingerprint = getFinalFormDataFingerprint(formData);
      const idempotencyKey = getLeadIdempotencyKey(formDataFingerprint);

      try {
        console.info("VVZ lead POST start");
        const response = await fetch(VVZ_LEAD_URL, {
          method: "POST",
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
          body: formData,
        });
        let result = null;
        try {
          result = await response.json();
        } catch (jsonError) {
          result = null;
        }
        if (!response.ok || !result || result.ok !== true) {
          const submissionError = new Error(result && result.detail ? result.detail : `Lead submit failed: ${response.status}`);
          submissionError.field = result && result.field;
          submissionError.errorCode = result && result.error_code;
          throw submissionError;
        }
        clearLeadIdempotencyState(formDataFingerprint, idempotencyKey);

        // После успешной отправки — редирект
        const lang = document.documentElement.lang || "en";
        const thanksPages = {
          en: "thanks.html",
          fr: "thanks-fr.html",
          ru: "thanks-ru.html",
        };

        console.info("VVZ lead POST ok", result);
        const leadId = result.id;
        const thanksPage = thanksPages[lang] || "thanks.html";
        const redirectUrl = new URL(thanksPage, window.location.href);
        if (leadId !== undefined && leadId !== null) redirectUrl.searchParams.set("lead_id", leadId);
        redirectUrl.searchParams.set("source", "vvzstudio");

        // Небольшая задержка, чтобы пользователь успел увидеть, что отправка прошла
        status.style.color = "#4CAF50"; // Зеленый цвет успеха
        status.textContent = leadId
          ? `Success! Lead ID: ${leadId}`
          : "Success! / Succès ! / Успешно!";

        setTimeout(() => {
          window.location.href = redirectUrl.href;
        }, 600);

      } catch (error) {
        console.error("Submission error:", error);
        status.style.color = "#ff4d4d";
        const responseField = error && error.field;
        const responseCode = error && error.errorCode;
        const field = responseField
          ? formFields.find((candidate) => candidate.name === responseField)
          : null;
        const backendMessage = field && responseCode === "field_required"
          ? messages.required(getFieldExample(field))
          : field && responseCode === "email_invalid"
            ? messages.email(getFieldExample(field))
            : field && responseCode === "phone_invalid"
              ? messages.phone(getFieldExample(field))
              : null;
        if (field && backendMessage) {
          field.dataset.touched = "true";
          renderFieldError(field, backendMessage);
          status.textContent = messages.summary;
        } else {
          status.textContent = error instanceof TypeError ? messages.network : messages.server;
        }
        btn.disabled = false;
        btn.textContent = originalBtnText;
      }
    });
  });

  // ==========================================
  // 5. ЯКОРНАЯ НАВИГАЦИЯ И АКТИВНЫЙ ПУНКТ
  // ==========================================
  const header = document.querySelector(".top");
  const navLinks = Array.from(document.querySelectorAll('.navlinks a[href^="#"]'))
    .map((link) => {
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const target = document.getElementById(id);
      return target ? { link, target, id } : null;
    })
    .filter(Boolean);

  const getHeaderOffset = () => {
    const height = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    return height + 12;
  };

  const updateHeaderOffset = () => {
    document.documentElement.style.setProperty("--header-offset", `${getHeaderOffset()}px`);
  };

  const setActiveNav = (id) => {
    navLinks.forEach(({ link, id: linkId }) => {
      const isActive = linkId === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const currentSectionId = () => {
    const offset = getHeaderOffset() + 8;
    const ordered = navLinks.slice().sort((a, b) => a.target.offsetTop - b.target.offsetTop);
    let current = ordered[0] ? ordered[0].id : "";
    ordered.forEach(({ target, id }) => {
      if (target.getBoundingClientRect().top <= offset) current = id;
    });
    return current;
  };

  const updateActiveNav = () => {
    if (!navLinks.length) return;
    setActiveNav(currentSectionId());
  };

  if (navLinks.length) {
    updateHeaderOffset();
    updateActiveNav();

    navLinks.forEach(({ link, target, id }) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        updateHeaderOffset();
        const top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
        setActiveNav(id);
        if (history.pushState) history.pushState(null, "", `#${id}`);
      });
    });

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", () => {
      updateHeaderOffset();
      updateActiveNav();
    });
  }

  // ==========================================
  // 6. ЛИПКАЯ КНОПКА (Sticky CTA) ДЛЯ МОБИЛОК
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVVZSite);
} else {
  initVVZSite();
}
