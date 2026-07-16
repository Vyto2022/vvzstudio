(function () {
  "use strict";

  var FAQ_DATA = {
    ru: {
      fallback: "Я не нашёл готового ответа на этот вопрос. Отправьте его через контактную форму и укажите удобный способ связи. Специалист VVZ Studio ответит в рабочее время.",
      contactLabel: "Перейти к контактной форме",
      welcome: "Выберите вопрос из списка или введите его вручную.",
      records: [
        {
          q: "Что такое VVZ ERP Suite?",
          a: "VVZ ERP Suite — это модульная система автоматизации для локального бизнеса. Она объединяет приём заявок с сайта, серверную обработку, локальную программу, уведомления Telegram, рабочие статусы и журнал выполненных работ. Система адаптируется под процессы конкретной компании и не включает ненужные ей функции."
        },
        {
          q: "Для каких видов бизнеса подходит система?",
          a: "Система может быть адаптирована для автосервисов, детейлинга, автомоек, шиномонтажа, салонов красоты, парикмахерских, строительных и выездных мастеров, небольших магазинов, мастерских, ассоциаций и других локальных компаний. Для каждой отрасли настраиваются собственные услуги, формы и рабочие правила."
        },
        {
          q: "Это готовая программа или индивидуальная разработка?",
          a: "В основе находится готовый модульный движок. Мы не создаём всю систему заново для каждого клиента, а настраиваем существующие компоненты под его бизнес. Новые функции разрабатываются отдельно только тогда, когда готовых модулей недостаточно."
        },
        {
          q: "Можно ли начать с нескольких модулей и добавить остальные позже?",
          a: "Да. Сначала можно подключить только приём заявок, локальную программу и Telegram. Позже к той же системе можно добавить новые отраслевые модули, документы, интеграции и дополнительные рабочие действия."
        },
        {
          q: "Можно ли подключить систему к существующему сайту?",
          a: "Да. Мы можем подключить форму приёма заявок и серверную часть к существующему сайту клиента. Перед началом работы проверяются структура сайта, используемые технологии и возможность безопасной интеграции."
        },
        {
          q: "Можно ли заказать новый сайт вместе с системой?",
          a: "Да. Мы можем подготовить полный комплект: новый сайт или посадочную страницу, сервер, локальную программу, Telegram-уведомления и необходимые отраслевые модули."
        },
        {
          q: "Что входит в полный комплект поставки?",
          a: "Состав зависит от задачи. Обычно полный комплект включает сайт или форму, защищённый серверный приём заявок, локальную рабочую программу, Telegram-уведомления, настройку услуг и статусов, локальный журнал и проверку всей цепочки на реальной тестовой заявке."
        },
        {
          q: "Можно ли использовать систему без создания нового сайта?",
          a: "Да. Систему можно подключить к существующему сайту или использовать с отдельной страницей приёма заявок. Создание нового сайта не является обязательным условием."
        },
        {
          q: "Как заявка проходит от клиента до локальной программы?",
          a: "Клиент заполняет форму на сайте. Сервер проверяет и сохраняет заявку, после чего локальная программа компании получает её и создаёт рабочую запись. Ответственный сотрудник видит новую заявку и может начать её обработку."
        },
        {
          q: "Как сотрудник узнаёт о новой заявке?",
          a: "После получения новой заявки система отправляет уведомление авторизованному сотруднику в Telegram. Заявка также появляется в локальной программе, которая является основным рабочим интерфейсом и хранилищем данных компании."
        },
        {
          q: "Какие действия можно выполнять через Telegram?",
          a: "В базовой конфигурации через Telegram можно просматривать основные данные заявки и выполнять разрешённые быстрые действия: подтвердить запись, отменить её или отметить работу завершённой. Доступные команды зависят от установленного модуля."
        },
        {
          q: "Что происходит с заявкой после завершения работы?",
          a: "После завершения заявка получает статус «выполнена» и сохраняется в локальном рабочем журнале. Компания может просматривать историю и экспортировать данные в заранее согласованном формате. В базовой версии используется CSV, который открывается в Microsoft Excel и LibreOffice Calc. При необходимости можно отдельно настроить экспорт в ODS, XLSX или другой согласованный формат. Отменённые заявки также сохраняются в журнале со своим статусом."
        },
        {
          q: "Где хранятся данные клиентов и бизнеса?",
          a: "Основные рабочие данные и журнал хранятся локально у клиента. Сервер используется для безопасного приёма и передачи заявок. Telegram служит интерфейсом уведомлений и быстрых действий, но не является основной базой данных."
        },
        {
          q: "Какие данные передаются на сервер?",
          a: "Сервер получает только данные, необходимые для обработки заявки: идентификатор, дату создания, имя клиента, телефон, выбранную услугу, желаемую дату или время, комментарий и текущий статус. Внутренние финансовые записи и частные рабочие заметки могут оставаться только в локальной программе."
        },
        {
          q: "Что произойдёт, если пропадёт интернет?",
          a: "Локальная программа показывает состояние соединения и время последней успешной синхронизации. Локальные действия сохраняются в очереди и передаются после восстановления связи. Telegram-уведомления могут поступить с задержкой, если отсутствует интернет."
        },
        {
          q: "Можно ли экспортировать журнал и создавать резервные копии?",
          a: "Да. Рабочий журнал можно экспортировать в согласованном с клиентом формате. В базовой версии доступен CSV, совместимый с Microsoft Excel и LibreOffice Calc. При необходимости можно добавить экспорт в ODS, XLSX или другой подходящий формат. Резервное копирование локальной базы настраивается отдельно с учётом оборудования и требований клиента."
        },
        {
          q: "Сколько времени занимает настройка системы под конкретный бизнес?",
          a: "Срок зависит от количества услуг, структуры сайта, необходимых модулей и интеграций. Простая адаптация готовых компонентов обычно выполняется быстрее, чем разработка новых функций. Точный срок определяется после краткого разбора рабочего процесса."
        },
        {
          q: "От чего зависит стоимость внедрения?",
          a: "Стоимость зависит от того, подключается ли система к существующему сайту или создаётся новый, какие модули необходимы, сколько услуг и форм нужно настроить и требуются ли новые интеграции. После разбора задачи клиент получает отдельное предложение с составом работ и ценой."
        },
        {
          q: "Какая поддержка предоставляется после запуска?",
          a: "После запуска мы можем помочь с первоначальной настройкой и устранением выявленных технических проблем. Условия дальнейшего сопровождения, обновлений и разработки новых модулей согласовываются отдельно. Обращение можно отправить в любое время, а специалист ответит в рабочие часы."
        },
        {
          q: "Как задать вопрос специалисту или запросить новую функцию?",
          a: "Используйте контактную форму на сайте и выберите подходящий тип обращения. Опишите вопрос, требуемую функцию или рабочий процесс и укажите удобный способ связи. Мы рассмотрим обращение и ответим в рабочее время."
        }
      ]
    },
    fr: {
      fallback: "Je n’ai pas trouvé de réponse précise à cette question. Envoyez votre demande via le formulaire de contact et indiquez votre moyen de contact préféré. Un spécialiste de VVZ Studio vous répondra pendant les heures ouvrables.",
      contactLabel: "Aller au formulaire de contact",
      welcome: "Choisissez une question dans la liste ou saisissez-la manuellement.",
      records: [
        {
          q: "Qu’est-ce que VVZ ERP Suite ?",
          a: "VVZ ERP Suite est une solution modulaire d’automatisation destinée aux entreprises locales. Elle réunit la réception des demandes depuis le site, le traitement côté serveur, une application locale, les notifications Telegram, les statuts de travail et le journal des interventions. La solution s’adapte aux processus de chaque entreprise sans lui imposer de fonctions inutiles."
        },
        {
          q: "Pour quels types d’activité la solution est-elle adaptée ?",
          a: "La solution peut être adaptée aux garages, centres de detailing, stations de lavage, ateliers de pneumatiques, salons de coiffure et de beauté, artisans, professionnels mobiles, petits commerces, ateliers, associations et autres entreprises locales. Les services, formulaires et règles de travail sont configurés selon chaque activité."
        },
        {
          q: "S’agit-il d’un logiciel prêt à l’emploi ou d’un développement sur mesure ?",
          a: "La solution repose sur un moteur modulaire déjà développé. Nous configurons les composants existants selon les besoins de l’entreprise. Les nouvelles fonctions sont développées séparément uniquement lorsque les modules disponibles ne suffisent pas."
        },
        {
          q: "Peut-on commencer avec quelques modules et en ajouter plus tard ?",
          a: "Oui. Il est possible de commencer avec la réception des demandes, l’application locale et les notifications Telegram. De nouveaux modules métier, documents, intégrations ou actions de travail peuvent ensuite être ajoutés à la même solution."
        },
        {
          q: "Peut-on connecter la solution à un site existant ?",
          a: "Oui. Nous pouvons connecter le formulaire de demande et la partie serveur à un site existant. Avant l’intégration, nous vérifions la structure du site, les technologies utilisées et les possibilités de connexion sécurisée."
        },
        {
          q: "Peut-on commander un nouveau site avec la solution ?",
          a: "Oui. Nous pouvons préparer un ensemble complet comprenant un nouveau site ou une page dédiée, le serveur, l’application locale, les notifications Telegram et les modules adaptés à l’activité."
        },
        {
          q: "Que comprend une solution complète ?",
          a: "Le contenu dépend du projet. Une solution complète comprend généralement un site ou un formulaire, la réception sécurisée des demandes sur le serveur, une application locale, les notifications Telegram, la configuration des services et des statuts, un journal local et la vérification de toute la chaîne avec une demande de test réelle."
        },
        {
          q: "Peut-on utiliser la solution sans créer un nouveau site ?",
          a: "Oui. La solution peut être intégrée à un site existant ou fonctionner avec une page indépendante destinée à recevoir les demandes. La création d’un nouveau site n’est pas obligatoire."
        },
        {
          q: "Comment une demande arrive-t-elle dans l’application locale ?",
          a: "Le client remplit un formulaire sur le site. Le serveur vérifie et enregistre la demande, puis l’application locale de l’entreprise la reçoit et crée une nouvelle fiche de travail. La personne responsable peut alors commencer son traitement."
        },
        {
          q: "Comment l’entreprise est-elle informée d’une nouvelle demande ?",
          a: "Après la réception d’une demande, le système envoie une notification à la personne autorisée dans Telegram. La demande apparaît également dans l’application locale, qui constitue l’interface de travail principale et le stockage opérationnel de l’entreprise."
        },
        {
          q: "Quelles actions peut-on effectuer depuis Telegram ?",
          a: "Dans la configuration de base, Telegram permet de consulter les informations principales d’une demande et d’effectuer certaines actions rapides autorisées : confirmer une réservation, l’annuler ou marquer le travail comme terminé. Les commandes disponibles dépendent des modules installés."
        },
        {
          q: "Que devient une demande après la fin du travail ?",
          a: "Lorsque le travail est terminé, la demande reçoit le statut « terminée » et reste enregistrée dans le journal local. L’entreprise peut consulter l’historique et exporter les données dans un format convenu à l’avance. La version de base utilise le format CSV, compatible avec Microsoft Excel et LibreOffice Calc. Un export en ODS, XLSX ou dans un autre format convenu peut être configuré séparément si nécessaire. Les demandes annulées restent également enregistrées avec leur statut."
        },
        {
          q: "Où sont stockées les données des clients et de l’entreprise ?",
          a: "Les principales données de travail et le journal sont conservés localement chez le client. Le serveur sert à recevoir et transmettre les demandes de manière sécurisée. Telegram est utilisé pour les notifications et les actions rapides, mais ne constitue pas la base de données principale."
        },
        {
          q: "Quelles données sont transmises au serveur ?",
          a: "Le serveur reçoit uniquement les informations nécessaires au traitement de la demande : identifiant, date de création, nom du client, téléphone, service demandé, date ou heure souhaitée, commentaire et statut actuel. Les informations financières internes et les notes privées peuvent rester exclusivement dans l’application locale."
        },
        {
          q: "Que se passe-t-il en cas de coupure Internet ?",
          a: "L’application locale affiche l’état de la connexion et la date de la dernière synchronisation réussie. Les actions locales sont conservées dans une file d’attente et transmises après le rétablissement de la connexion. Les notifications Telegram peuvent être retardées lorsque l’accès à Internet est indisponible."
        },
        {
          q: "Peut-on exporter le journal et créer des sauvegardes ?",
          a: "Oui. Le journal peut être exporté dans un format convenu avec le client. La version de base propose un fichier CSV compatible avec Microsoft Excel et LibreOffice Calc. Un export en ODS, XLSX ou dans un autre format adapté peut être ajouté si nécessaire. La sauvegarde de la base locale est configurée séparément selon le matériel et les besoins du client."
        },
        {
          q: "Combien de temps faut-il pour adapter la solution à une entreprise ?",
          a: "Le délai dépend du nombre de services, de la structure du site, des modules nécessaires et des intégrations demandées. L’adaptation de composants existants est généralement plus rapide que le développement de nouvelles fonctions. Un délai précis est défini après une courte analyse du processus de travail."
        },
        {
          q: "De quoi dépend le coût de l’installation ?",
          a: "Le coût dépend notamment de l’intégration à un site existant ou de la création d’un nouveau site, des modules nécessaires, du nombre de services et de formulaires à configurer, ainsi que des éventuelles intégrations spécifiques. Après l’analyse du besoin, le client reçoit une proposition indiquant le contenu des travaux et leur prix."
        },
        {
          q: "Quel accompagnement est proposé après le lancement ?",
          a: "Après le lancement, nous pouvons aider à finaliser la configuration initiale et à corriger les problèmes techniques constatés. Les conditions de maintenance, de mise à jour et de développement de nouveaux modules sont convenues séparément. Une demande peut être envoyée à tout moment et un spécialiste répond pendant les heures ouvrables."
        },
        {
          q: "Comment poser une question à un spécialiste ou demander une nouvelle fonction ?",
          a: "Utilisez le formulaire de contact du site et sélectionnez le type de demande correspondant. Décrivez votre question, la fonction souhaitée ou votre processus de travail, puis indiquez votre moyen de contact préféré. Nous examinerons votre demande et vous répondrons pendant les heures ouvrables."
        }
      ]
    },
    en: {
      fallback: "I could not find an approved answer to this question. Send it through the contact form and specify your preferred contact method. A VVZ Studio specialist will respond during business hours.",
      contactLabel: "Go to the contact form",
      welcome: "Choose a question from the list or type it manually.",
      records: [
        {
          q: "What is VVZ ERP Suite?",
          a: "VVZ ERP Suite is a modular automation system for local businesses. It combines website lead intake, server-side processing, a local application, Telegram notifications, workflow statuses, and a completed-work journal. The system is adapted to each company’s processes without forcing it to use unnecessary functions."
        },
        {
          q: "What types of business can use the system?",
          a: "The system can be adapted for auto repair shops, detailing studios, car washes, tire shops, hair and beauty salons, construction and mobile tradespeople, small shops, workshops, associations, and other local businesses. Services, forms, and workflow rules are configured for each industry."
        },
        {
          q: "Is this ready-made software or custom development?",
          a: "The system is built on an existing modular engine. We configure its current components for the client’s business instead of rebuilding the whole system for every project. New functions are developed separately only when the available modules are not sufficient."
        },
        {
          q: "Can we start with a few modules and add more later?",
          a: "Yes. A business can begin with lead intake, the local application, and Telegram notifications. Additional industry modules, documents, integrations, and workflow actions can be added to the same system later."
        },
        {
          q: "Can the system be connected to an existing website?",
          a: "Yes. We can connect the lead form and server component to an existing website. Before integration, we review the website structure, the technologies it uses, and the available options for a secure connection."
        },
        {
          q: "Can we order a new website together with the system?",
          a: "Yes. We can prepare a complete package that includes a new website or landing page, the server, the local application, Telegram notifications, and the required industry modules."
        },
        {
          q: "What is included in a complete solution?",
          a: "The exact scope depends on the project. A complete solution normally includes a website or form, secure server-side lead intake, a local working application, Telegram notifications, service and status configuration, a local journal, and an end-to-end check using a real test lead."
        },
        {
          q: "Can the system be used without creating a new website?",
          a: "Yes. The system can be integrated into an existing website or used with a separate lead-intake page. Creating a new website is not mandatory."
        },
        {
          q: "How does a customer request reach the local application?",
          a: "The customer completes a form on the website. The server validates and stores the request, after which the company’s local application receives it and creates a work record. The responsible employee can then start processing it."
        },
        {
          q: "How is the company notified about a new request?",
          a: "After a new request is received, the system sends a Telegram notification to the authorized employee. The request also appears in the local application, which serves as the company’s main working interface and operational data store."
        },
        {
          q: "What actions can be performed through Telegram?",
          a: "In the basic configuration, Telegram can display the main request details and provide authorized quick actions such as confirming a booking, cancelling it, or marking the work as completed. Available commands depend on the installed module."
        },
        {
          q: "What happens to a request after the work is completed?",
          a: "After completion, the request receives the “completed” status and remains in the local work journal. The company can review its history and export data in a format agreed in advance. The basic version uses CSV, which opens in Microsoft Excel and LibreOffice Calc. Export to ODS, XLSX, or another agreed format can be configured separately when required. Cancelled requests also remain in the journal with their status."
        },
        {
          q: "Where are customer and business data stored?",
          a: "The main working data and journal are stored locally at the client’s business. The server is used to receive and deliver requests securely. Telegram provides notifications and quick actions, but it is not the primary database."
        },
        {
          q: "What information is sent to the server?",
          a: "The server receives only the information needed to process a request: its identifier, creation time, customer name, phone number, selected service, requested date or time, comment, and current status. Internal financial records and private working notes can remain exclusively in the local application."
        },
        {
          q: "What happens if the internet connection is lost?",
          a: "The local application displays the connection state and the time of the last successful synchronization. Local actions are kept in a queue and transmitted after the connection is restored. Telegram notifications may be delayed while internet access is unavailable."
        },
        {
          q: "Can the journal be exported and backed up?",
          a: "Yes. The work journal can be exported in a format agreed with the client. The basic version provides CSV, compatible with Microsoft Excel and LibreOffice Calc. Export to ODS, XLSX, or another suitable format can be added when required. Backup of the local database is configured separately according to the client’s equipment and requirements."
        },
        {
          q: "How long does it take to adapt the system to a business?",
          a: "The schedule depends on the number of services, the website structure, the required modules, and the requested integrations. Adapting existing components is generally faster than developing new functions. A precise schedule is defined after a short review of the business workflow."
        },
        {
          q: "What determines the implementation cost?",
          a: "The cost depends on whether the system is connected to an existing website or supplied with a new one, which modules are required, how many services and forms must be configured, and whether new integrations are needed. After reviewing the task, the client receives a separate proposal describing the scope and price."
        },
        {
          q: "What support is available after launch?",
          a: "After launch, we can help complete the initial configuration and correct identified technical problems. Ongoing maintenance, updates, and development of new modules are agreed separately. A request can be submitted at any time, and a specialist will respond during business hours."
        },
        {
          q: "How can we ask a specialist a question or request a new function?",
          a: "Use the website contact form and select the appropriate request type. Describe the question, required function, or business workflow and specify the preferred contact method. We will review the request and respond during business hours."
        }
      ]
    }
  };

  function currentLang() {
    var lang = (document.documentElement.getAttribute("lang") || "fr").slice(0, 2).toLowerCase();
    return FAQ_DATA[lang] ? lang : "fr";
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function findRecord(config, question) {
    var normalized = normalize(question);
    return config.records.find(function (record) {
      return normalize(record.q) === normalized;
    });
  }

  function addMessage(chat, text, role, contactLabel) {
    var message = document.createElement("div");
    message.className = "faqbot__msg faqbot__msg--" + role;

    var bubble = document.createElement("div");
    bubble.className = "faqbot__bubble";

    var body = document.createElement("span");
    body.textContent = text;
    bubble.appendChild(body);

    if (contactLabel) {
      var link = document.createElement("a");
      link.className = "faqbot__contact";
      link.href = "#contact";
      link.textContent = contactLabel;
      link.addEventListener("click", function () {
        var contact = document.getElementById("contact");
        if (contact) {
          contact.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      bubble.appendChild(link);
    }

    message.appendChild(bubble);
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
  }

  function initFaq() {
    var lang = currentLang();
    var config = FAQ_DATA[lang];
    var list = document.querySelector("[data-faq]");
    var chat = document.getElementById("faqbotChat");
    var form = document.getElementById("faqbotForm");
    var input = document.getElementById("faqbotInput");

    if (!list || !chat || !form || !input) {
      return;
    }

    function ask(question) {
      var cleanQuestion = String(question || "").trim();
      if (!cleanQuestion) {
        return;
      }

      input.value = cleanQuestion;
      addMessage(chat, cleanQuestion, "user");

      var record = findRecord(config, cleanQuestion);
      if (record) {
        addMessage(chat, record.a, "bot");
      } else {
        addMessage(chat, config.fallback, "bot", config.contactLabel);
      }
      input.value = "";
    }

    list.innerHTML = "";
    config.records.forEach(function (record, index) {
      var item = document.createElement("div");
      item.className = "faq__item faq__item--button";

      var button = document.createElement("button");
      button.className = "faq__question";
      button.type = "button";
      button.textContent = String(index + 1) + ") " + record.q;
      button.dataset.faqQuestion = record.q;
      button.addEventListener("click", function () {
        ask(record.q);
        input.focus();
      });

      item.appendChild(button);
      list.appendChild(item);
    });

    addMessage(chat, config.welcome, "bot");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      ask(input.value);
    });
  }

  window.VVZ_FAQ = FAQ_DATA;
  document.addEventListener("DOMContentLoaded", initFaq);
}());
