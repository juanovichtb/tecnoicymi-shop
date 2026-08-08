(() => {
  "use strict";

  const DATA_URL = "../data/planes.json";
  const WHATSAPP_NUMBER = "593982541923";
  const THEME_KEY = "theme";

  const OPERATOR_ACCENT_MAP = {
    claro: "#fa3c47",
    movistar: "#21a366",
    cnt: "#27b5ff",
    tuenti: "#ff4fa3"
  };

  const DEFAULT_OPERATOR_COLOR = "#075ca8";

  const state = {
    operadoras: [],
    selectedOperatorId: null,
    search: "",
    priceFilter: "all",
    durationFilter: "all"
  };

  const elements = {};

  const get = (selector) => document.querySelector(selector);
  const getAll = (selector) => [...document.querySelectorAll(selector)];

  function cacheElements() {
    elements.root = document.documentElement;
    elements.themeToggle = get("#theme-toggle");
    elements.operators = get("#operadoras");
    elements.operatorsLoading = get("#operadoras-loading");
    elements.search = get("#package-search");
    elements.priceFilter = get("#price-filter");
    elements.durationFilter = get("#duration-filter");
    elements.loading = get("#catalog-loading");
    elements.error = get("#catalog-error");
    elements.empty = get("#catalog-empty");
    elements.searchEmpty = get("#catalog-search-empty");
    elements.packagesSection = get("#packages-section");
    elements.packagesGrid = get("#packages-grid");
    elements.packagesSummary = get("#packages-summary");
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Continúa funcionando aunque localStorage no esté disponible.
    }
  }

  function setTheme(theme) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";

    elements.root.setAttribute("data-theme", normalizedTheme);
    safeStorageSet(THEME_KEY, normalizedTheme);

    if (!elements.themeToggle) {
      return;
    }

    const nextTheme = normalizedTheme === "dark" ? "claro" : "oscuro";

    elements.themeToggle.setAttribute(
      "aria-label",
      `Cambiar a modo ${nextTheme}`
    );

    elements.themeToggle.setAttribute(
      "title",
      `Cambiar a modo ${nextTheme}`
    );
  }

  function initializeTheme() {
    const storedTheme = safeStorageGet(THEME_KEY);
    setTheme(storedTheme === "dark" ? "dark" : "light");

    elements.themeToggle?.addEventListener("click", () => {
      const currentTheme = elements.root.getAttribute("data-theme");
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getOperatorId(operator) {
    return String(
      operator?.id ??
      operator?.codigo ??
      operator?.nombre ??
      ""
    )
      .trim()
      .toLowerCase();
  }

  function getOperatorName(operator) {
    return String(
      operator?.nombre ??
      operator?.name ??
      operator?.operadora ??
      "Operadora"
    ).trim();
  }

  function getOperatorColor(operator) {
    return String(operator?.color ?? DEFAULT_OPERATOR_COLOR).trim() || DEFAULT_OPERATOR_COLOR;
  }

  function getOperatorAccentColor(operator) {
    const normalizedName = normalizeText(getOperatorName(operator));
    return OPERATOR_ACCENT_MAP[normalizedName] || getOperatorColor(operator);
  }

  function getPlans(operator) {
    if (Array.isArray(operator?.planes)) return operator.planes;
    if (Array.isArray(operator?.paquetes)) return operator.paquetes;
    if (Array.isArray(operator?.packages)) return operator.packages;
    return [];
  }

  function getPlanName(plan) {
    return String(
      plan?.nombre ??
      plan?.name ??
      plan?.titulo ??
      ""
    ).trim();
  }

  function getPlanPrice(plan) {
    const rawPrice =
      plan?.precio_usd ??
      plan?.precio ??
      plan?.price ??
      plan?.valor;

    const numericPrice = Number.parseFloat(
      String(rawPrice ?? "").replace(",", ".")
    );

    return Number.isFinite(numericPrice) ? numericPrice : null;
  }

  function formatPrice(value) {
    if (value === null) {
      return "Consultar";
    }

    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function getPlanData(plan) {
    return String(
      plan?.datos ??
      plan?.data ??
      plan?.gb ??
      plan?.internet ??
      ""
    ).trim();
  }

  function getPlanValidity(plan) {
    return String(
      plan?.vigencia ??
      plan?.duracion ??
      plan?.validity ??
      ""
    ).trim();
  }

  function getPlanBenefits(plan) {
    const benefits =
      plan?.detalles ??
      plan?.beneficios ??
      plan?.benefits ??
      [];

    if (Array.isArray(benefits)) {
      return benefits
        .map((benefit) => String(benefit).trim())
        .filter(Boolean);
    }

    if (typeof benefits === "string" && benefits.trim()) {
      return [benefits.trim()];
    }

    return [];
  }

  function isPlanActive(plan) {
    return plan?.activo === true;
  }

  function getPlanSearchText(plan) {
    return normalizeText([
      getPlanName(plan),
      getPlanPrice(plan),
      getPlanData(plan),
      getPlanValidity(plan),
      ...getPlanBenefits(plan)
    ].join(" "));
  }

  function getValidityGroup(validity) {
    const text = normalizeText(validity);
    const daysMatch = text.match(/(\d+)\s*(dia|dias|d)/);

    if (daysMatch) {
      const days = Number(daysMatch[1]);

      if (days <= 7) return "short";
      if (days <= 15) return "medium";
      return "long";
    }

    if (/hora|horas|dia|dias|semana/.test(text)) return "short";
    if (/quincena|15/.test(text)) return "medium";
    if (/mes|meses|30|60|90|anual/.test(text)) return "long";

    return "unknown";
  }

  function matchesPrice(plan) {
    if (state.priceFilter === "all") return true;

    const price = getPlanPrice(plan);
    if (price === null) return false;

    if (state.priceFilter === "low") return price <= 5;
    if (state.priceFilter === "mid") return price > 5 && price <= 10;
    if (state.priceFilter === "high") return price > 10;

    return true;
  }

  function matchesDuration(plan) {
    if (state.durationFilter === "all") return true;
    return getValidityGroup(getPlanValidity(plan)) === state.durationFilter;
  }

  function getSelectedOperator() {
    return state.operadoras.find(
      (operator) => getOperatorId(operator) === state.selectedOperatorId
    ) ?? null;
  }

  function getFilteredPlans(operator) {
    const query = normalizeText(state.search);

    return getPlans(operator)
      .filter(isPlanActive)
      .filter((plan) => !query || getPlanSearchText(plan).includes(query))
      .filter(matchesPrice)
      .filter(matchesDuration);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function applyOperatorAccent(operator) {
    const color = getOperatorAccentColor(operator);
    document.documentElement.style.setProperty("--active-operator-color", color);
  }

  function createOperatorButtons() {
    elements.operators.replaceChildren();

    if (!state.operadoras.length) {
      const message = createElement(
        "p",
        "operadoras__loading",
        "No hay operadoras disponibles en este momento."
      );
      message.setAttribute("role", "status");
      elements.operators.append(message);
      return;
    }

    state.operadoras.forEach((operator) => {
      const id = getOperatorId(operator);
      const name = getOperatorName(operator);
      const color = getOperatorAccentColor(operator);
      const button = createElement("button", "operator-button");

      button.type = "button";
      button.id = `operator-${id}`;
      button.setAttribute("role", "tab");
      button.setAttribute(
        "aria-selected",
        String(id === state.selectedOperatorId)
      );
      button.setAttribute("aria-controls", "packages-grid");
      button.style.setProperty("--operator-color", color);
      button.title = `Ver paquetes de ${name}`;

      const mark = createElement(
        "span",
        "operator-button__mark",
        name.charAt(0).toUpperCase()
      );
      mark.setAttribute("aria-hidden", "true");

      const label = createElement("span", "operator-button__name", name);

      button.append(mark, label);

      button.addEventListener("click", () => {
        selectOperator(id);
      });

      button.addEventListener("keydown", handleOperatorKeydown);
      elements.operators.append(button);
    });
  }

  function handleOperatorKeydown(event) {
    const buttons = getAll(".operator-button");
    const currentIndex = buttons.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    buttons[nextIndex].focus();
    selectOperator(buttons[nextIndex].id.replace("operator-", ""));
  }

  function createPlanCard(plan, operator) {
    const operatorName = getOperatorName(operator);
    const operatorColor = getOperatorAccentColor(operator);
    const planName = getPlanName(plan);
    const planData = getPlanData(plan);
    const planValidity = getPlanValidity(plan);
    const benefits = getPlanBenefits(plan);
    const price = getPlanPrice(plan);

    const card = createElement("article", "package-card");
    card.style.setProperty("--operator-color", operatorColor);

    const accent = createElement("span", "package-card__accent");
    accent.setAttribute("aria-hidden", "true");

    const top = createElement("div", "package-card__top");
    const title = createElement(
      "h4",
      "package-card__name",
      planName || "Paquete móvil"
    );
    const priceElement = createElement(
      "span",
      "package-card__price",
      formatPrice(price)
    );

    top.append(title, priceElement);

    const data = createElement(
      "p",
      "package-card__data",
      planData || "Información disponible por WhatsApp"
    );

    const validity = createElement(
      "p",
      "package-card__validity",
      planValidity ? `Vigencia: ${planValidity}` : "Vigencia: consultar"
    );

    const benefitsList = createElement("ul", "package-card__benefits");

    benefits.forEach((benefit) => {
      benefitsList.append(
        createElement("li", "package-card__benefit", benefit)
      );
    });

    if (!benefits.length) {
      benefitsList.append(
        createElement(
          "li",
          "package-card__benefit",
          "Consulta los beneficios disponibles"
        )
      );
    }

    const messageName =
      planName ||
      [planData, planValidity].filter(Boolean).join(" - ") ||
      "paquete móvil";

    const messagePrice =
      price === null ? "el precio indicado" : formatPrice(price);

    const message =
      `Hola TECNOICYMI, deseo realizar la recarga del paquete ${messageName} ` +
      `de ${operatorName} por ${messagePrice}. ¿Me pueden indicar cómo realizar el pago?`;

    const link = createElement(
      "a",
      "button package-card__action",
      "Solicitar por WhatsApp"
    );

    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      `Solicitar ${messageName} de ${operatorName} por WhatsApp`
    );

    card.append(
      accent,
      top,
      data,
      validity,
      benefitsList,
      link
    );

    return card;
  }

  function renderPackages() {
    const operator = getSelectedOperator();
    const hasOperator = Boolean(operator);

    elements.packagesGrid.replaceChildren();
    elements.packagesGrid.setAttribute("aria-busy", "false");
    elements.empty.hidden = true;
    elements.searchEmpty.hidden = true;
    elements.packagesSection.hidden = !hasOperator;

    if (!operator) {
      elements.packagesSummary.textContent =
        "Selecciona una operadora para comenzar.";
      return;
    }

    const activePlans = getPlans(operator).filter(isPlanActive);
    const filteredPlans = getFilteredPlans(operator);
    const operatorName = getOperatorName(operator);

    elements.packagesSummary.textContent =
      `${filteredPlans.length} ${
        filteredPlans.length === 1
          ? "paquete disponible"
          : "paquetes disponibles"
      } para ${operatorName}`;

    if (!activePlans.length) {
      elements.empty.hidden = false;
      return;
    }

    if (!filteredPlans.length) {
      elements.searchEmpty.hidden = false;
      return;
    }

    const fragment = document.createDocumentFragment();

    filteredPlans.forEach((plan) => {
      fragment.append(createPlanCard(plan, operator));
    });

    elements.packagesGrid.append(fragment);
  }

  function selectOperator(operatorId) {
    state.selectedOperatorId = operatorId;

    getAll(".operator-button").forEach((button) => {
      const isSelected = button.id === `operator-${operatorId}`;
      button.setAttribute("aria-selected", String(isSelected));
    });

    const operator = getSelectedOperator();

    if (operator) {
      applyOperatorAccent(operator);
    }

    renderPackages();
  }

  function initializeDefaultOperator() {
    const claro = state.operadoras.find(
      (operator) => normalizeText(getOperatorName(operator)) === "claro"
    );

    state.selectedOperatorId = getOperatorId(claro ?? state.operadoras[0]);
  }

  function showLoading(isLoading) {
    elements.loading.hidden = !isLoading;
    elements.packagesGrid.setAttribute("aria-busy", String(isLoading));
  }

  function showError() {
    showLoading(false);
    elements.operatorsLoading?.remove();
    elements.error.hidden = false;
    elements.packagesSection.hidden = true;
  }

  async function loadCatalog() {
    showLoading(true);

    try {
      const response = await fetch(DATA_URL, {
        headers: { Accept: "application/json" },
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar planes.json: ${response.status}`);
      }

      const data = await response.json();
      const operators = Array.isArray(data) ? data : data.operadoras;

      if (!Array.isArray(operators)) {
        throw new Error(
          "El catálogo no contiene una lista de operadoras válida."
        );
      }

      state.operadoras = operators.filter(
        (operator) => getOperatorId(operator)
      );

      initializeDefaultOperator();

      const defaultOperator = getSelectedOperator();
      if (defaultOperator) {
        applyOperatorAccent(defaultOperator);
      }

      createOperatorButtons();
      showLoading(false);
      renderPackages();
    } catch (error) {
      console.error("Error cargando catálogo:", error);
      showError();
    }
  }

  function initializeFilters() {
    elements.search?.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderPackages();
    });

    elements.priceFilter?.addEventListener("change", (event) => {
      state.priceFilter = event.target.value;
      renderPackages();
    });

    elements.durationFilter?.addEventListener("change", (event) => {
      state.durationFilter = event.target.value;
      renderPackages();
    });
  }

  function initializeFaq() {
    getAll(".faq-item__trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".faq-item");
        const isOpen = item.classList.contains("is-open");

        getAll(".faq-item").forEach((otherItem) => {
          otherItem.classList.remove("is-open");
          otherItem
            .querySelector(".faq-item__trigger")
            ?.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initialize() {
    cacheElements();
    initializeTheme();
    initializeFilters();
    initializeFaq();
    loadCatalog();
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();

