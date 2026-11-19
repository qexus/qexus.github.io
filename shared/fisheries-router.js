/* Shared navigation controller for Fisheries Norway and Canada.
   Keeps existing app/academy renderers and local data fully intact. */
(() => {
  "use strict";
  const nav = document.getElementById("nav");
  const main = document.getElementById("main");
  if (!nav || !main) return;
  const country = location.pathname.includes("/fisheries-ca/") ? "Canada" : "Norway";
  const names = {
    dashboard: "Обзор", journey: "Мой маршрут", desk: "Пакет и отклики", companies: "Предприятия", jobs: "Объявления",
    fleets: "Флот", aquaculture: "Аквакультура", curriculum: "Обучение",
    matrix: "Профессии и сертификаты", employers: "Работа и контакты",
    glossary: "Словарь", documents: "Документы", salary: "Калькулятор", career: "План отклика", cert: "Курсы и цены", library: "Библиотека ведомств",
    sources: "Источники", import: "Импорт"
  };
  const filters = ["provinceFilter", "cat", "categoryFilter", "q",
    "searchBox", "termCat", "termSearch", "courseSearch",
    "qx-role-filter", "qx-only-fav", "qx-employer-search"];
  const filterCache = new Map();
  const storageKey = "qexus-route-filters-" + country;
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    for (const [key, value] of Object.entries(stored)) {
      if (names[key] && value && typeof value === "object") filterCache.set(key, value);
    }
  } catch { /* Browsing remains possible without session storage. */ }
  let active = "dashboard";
  let replaying = false;
  let decoratePending = false;

  function targetFor(view) {
    if (view === "journey") return nav.querySelector('[data-qj-view="journey"]');
    if (view === "desk") return nav.querySelector('[data-qd-view="desk"]');
    if (view === "career") return nav.querySelector('[data-qa-view="jobs"]');
    if (["curriculum","cert","library"].includes(view)) return nav.querySelector('[data-qa-view="' + view + '"]');
    if (view === "matrix" || view === "employers") return nav.querySelector('[data-qx-view="' + view + '"]');
    return nav.querySelector('[data-view="' + view + '"]');
  }
  function routeOf(node) {
    const button = node && node.closest("button[data-view],button[data-go],button[data-qa-view],button[data-qx-view],button[data-qj-view],button[data-qd-view]");
    if (!button) return null;
    const view = button.dataset.qaView === "jobs" ? "career" : button.dataset.qdView || button.dataset.qjView || button.dataset.qxView || button.dataset.qaView || button.dataset.view || button.dataset.go;
    return names[view] && targetFor(view) ? view : null;
  }
  function toURL(view, lesson) {
    const u = new URL(location.href);
    if (view === "dashboard") u.searchParams.delete("view");
    else u.searchParams.set("view", view);
    if (view === "curriculum" && lesson) u.searchParams.set("lesson", lesson);
    else u.searchParams.delete("lesson");
    u.hash = "";
    return u.pathname + u.search;
  }
  function storeFilters(view) {
    if (!names[view]) return;
    const snapshot = {};
    for (const id of filters) {
      const field = document.getElementById(id);
      if (!field) continue;
      snapshot[id] = field.type === "checkbox" ? field.checked : field.value;
    }
    if (Object.keys(snapshot).length) {
      filterCache.set(view, snapshot);
      try { sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(filterCache))); } catch {}
    }
  }
  function restoreFilters(view) {
    const snapshot = filterCache.get(view);
    if (!snapshot) return;
    // Restore select boxes first; each original app may re-render its inputs.
    const order = ["provinceFilter", "cat", "categoryFilter", "termCat", "qx-role-filter",
      "q", "searchBox", "termSearch", "courseSearch", "qx-only-fav", "qx-employer-search"];
    for (const id of order) {
      if (!(id in snapshot)) continue;
      const field = document.getElementById(id);
      if (!field) continue;
      const next = snapshot[id];
      if (field.type === "checkbox") {
        if (field.checked === next) continue;
        field.checked = !!next;
      } else {
        if (field.value === next) continue;
        field.value = next;
        if (field.value !== next) continue; // No longer an available option.
      }
      field.dispatchEvent(new Event(
        field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input",
        { bubbles: true }
      ));
    }
  }
  function titleFor(view) {
    if(view==='journey')return nav.querySelector('[data-qj-view="journey"] .qj-nav-label')?.textContent||names[view];
    if(view==='desk')return nav.querySelector('[data-qd-view="desk"] .qd-nav-label')?.textContent||names[view];
    return window.qxTranslate?.(names[view]||"Обзор")||names[view]||"Обзор";
  }
  function reflect(view) {
    const selected = targetFor(view);
    window.dispatchEvent(new Event("qx:routechange"));
    nav.querySelectorAll("button[data-view],button[data-qa-view],button[data-qx-view],button[data-qj-view],button[data-qd-view]").forEach(button => {
      const on = button === selected;
      button.classList.toggle("active", on);
      if (on) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const extra = selected && selected.closest("details.qf-extra");
    if (extra) extra.open = true;
    document.title = titleFor(view) + " — Fisheries " + country + " · qexus lab";
    const breadcrumb = document.getElementById("crumb") || document.getElementById("viewName");
    if (breadcrumb) breadcrumb.textContent = titleFor(view);
    const toggle = document.getElementById("menuToggle");
    if (toggle) toggle.setAttribute("aria-label",
      window.qxTranslate?.(toggle.getAttribute("aria-expanded") === "true" ? "Закрыть меню" : "Открыть меню") || (toggle.getAttribute("aria-expanded") === "true" ? "Закрыть меню" : "Открыть меню"));
  }
  function focusHeading() {
    const title = main.querySelector("h1");
    if (title) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  }
  function openLesson() {
    const lesson = new URLSearchParams(location.search).get("lesson");
    if (!lesson || !/^\d{1,2}$/.test(lesson) || active !== "curriculum") return;
    const id = lesson.padStart(2, "0");
    const details = document.getElementById("qa-lesson-" + id);
    if (details) {
      details.open = true;
      requestAnimationFrame(() => details.scrollIntoView({ block: "start", behavior: "auto" }));
    }
  }
  function showURL() {
    const requested = new URLSearchParams(location.search).get("view") || "dashboard";
    const view = names[requested] && targetFor(requested) ? requested : "dashboard";
    const button = targetFor(view);
    replaying = true;
    try { if (button) button.click(); }
    finally { replaying = false; }
    active = view;
    reflect(view);
    restoreFilters(view);
    decorate();
    if (view === "curriculum") openLesson();
  }
  function addLessonLinks() {
    for (const details of main.querySelectorAll("details.qa-lesson[id^='qa-lesson-']")) {
      if (details.querySelector(".qf-lesson-link")) continue;
      const id = details.id.slice("qa-lesson-".length);
      const body = details.querySelector(".qa-lessonbody");
      if (!body || !/^\d{2}$/.test(id)) continue;
      const anchor = document.createElement("a");
      anchor.className = "qf-lesson-link";
      anchor.href = toURL("curriculum", id);
      anchor.textContent = "↗ Постоянная ссылка на урок " + id;
      anchor.title = "Можно скопировать ссылку и открыть этот урок напрямую";
      body.append(anchor);
    }
  }
  function addFirstSteps() {
    if (active !== "dashboard" || main.querySelector(".qf-first-steps")) return;
    const hero = main.querySelector(".norway-hero, .hero");
    if (!hero) return;
    const section = document.createElement("nav");
    section.className = "qf-first-steps";
    section.setAttribute("aria-label", "Быстрый старт");
    const label = document.createElement("strong");
    label.textContent = "С чего начать";
    section.append(label);
    for (const [view, text, attr] of [
      ["journey", "Мой маршрут", "qjView"],
      ["employers", "Найти работодателя", "qxView"],
      ["matrix", "Выбрать профессию", "qxView"],
      ["curriculum", "Начать обучение", "qaView"]
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "qf-step";
      button.dataset[attr] = view;
      button.textContent = text + " →";
      section.append(button);
    }
    hero.insertAdjacentElement("afterend", section);
  }
  function decorate() {
    addFirstSteps();
    if (active === "curriculum") addLessonLinks();
  }

  // Accessible skip link should not add an extra #main entry to browser history.
  document.addEventListener("click", event => {
    if (!event.target.closest(".qf-skip")) return;
    event.preventDefault();
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start", behavior: "auto" });
  }, true);

  // Capture existing values before the original app redraws the page.
  document.addEventListener("click", event => {
    if (routeOf(event.target)) storeFilters(active);
  }, true);
  // Original section handlers run first; this controller then adds history.
  document.addEventListener("click", event => {
    const route = routeOf(event.target);
    if (!route) {
      if (event.target.closest("#menuToggle")) reflect(active);
      return;
    }
    const was = active;
    active = route;
    if (!replaying && (was !== route || new URLSearchParams(location.search).get("lesson"))) {
      const dest = toURL(route);
      if (location.pathname + location.search !== dest) history.pushState({ view: route }, "", dest);
    }
    reflect(route);
    restoreFilters(route);
    if (event.detail === 0 && !replaying) focusHeading();
  });
  // Keep browser-native Back/Forward, deep links and page reloads functional.
  window.addEventListener("popstate", showURL);
  window.addEventListener("qx:language-ready", () => reflect(active));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const sidebar = document.getElementById("sidebar");
    if (!sidebar || !sidebar.classList.contains("open")) return;
    sidebar.classList.remove("open");
    const toggle = document.getElementById("menuToggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Открыть меню");
      toggle.focus();
    }
  }, true);
  new MutationObserver(() => {
    if (decoratePending) return;
    decoratePending = true;
    queueMicrotask(() => {
      decoratePending = false;
      decorate();
    });
  }).observe(main, { childList: true });
  showURL();
})();