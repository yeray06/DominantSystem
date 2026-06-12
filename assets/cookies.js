/* ============================================================
   Dominant System — Banner de consentimiento de cookies (RGPD/LSSI)
   - Bloquea terceros (Cal.com) hasta que el usuario acepta.
   - Recuerda la decisión en localStorage ("cookie-consent").
   - Aparece con retardo suave; reabrible desde "Configurar cookies".
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie-consent';
  var ACCEPTED = 'accepted';
  var REJECTED = 'rejected';
  var SHOW_DELAY = 2000; // retardo antes de mostrar el banner (ms)

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  /* ---------- Banner ---------- */
  var banner = null;

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Consentimiento de cookies');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<div class="cookie-banner-text">' +
          '<span class="cookie-banner-ico" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="11" r="1"/><circle cx="13" cy="15.5" r="1"/><circle cx="15.5" cy="9.5" r="1"/></svg>' +
          '</span>' +
          '<div>' +
            '<strong>Usamos cookies</strong>' +
            '<p>Usamos cookies propias y de terceros (como el calendario de reservas) para mejorar tu experiencia. Puedes aceptarlas todas o rechazar las no esenciales. <a href="cookies.html">Política de Cookies</a></p>' +
          '</div>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="cookie-btn cookie-btn-ghost" data-cookie="reject">Solo esenciales</button>' +
          '<button type="button" class="cookie-btn cookie-btn-primary" data-cookie="accept">Aceptar</button>' +
        '</div>' +
      '</div>';
    el.addEventListener('click', onBannerClick);
    return el;
  }

  function showBanner(immediate) {
    if (!banner) {
      banner = buildBanner();
      document.body.appendChild(banner);
    }
    // doble rAF para asegurar la transición de entrada
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    });
  }

  function hideBanner() {
    if (banner) banner.classList.remove('is-visible');
  }

  function onBannerClick(e) {
    var btn = e.target.closest('[data-cookie]');
    if (!btn) return;
    var action = btn.getAttribute('data-cookie');
    if (action === 'accept') accept();
    else if (action === 'reject') reject();
  }

  function accept() { setConsent(ACCEPTED); hideBanner(); applyConsent(ACCEPTED); }
  function reject() { setConsent(REJECTED); hideBanner(); applyConsent(REJECTED); }

  /* ---------- Aplicar consentimiento a terceros ---------- */
  function applyConsent(state) {
    if (state === ACCEPTED) loadThirdParties();
    else blockThirdParties();
  }

  function loadThirdParties() {
    clearCalPlaceholders();
    if (typeof window.loadCalEmbeds === 'function') window.loadCalEmbeds();
  }

  function blockThirdParties() {
    showCalPlaceholders();
  }

  /* ---------- Cal.com: placeholder vs carga real ---------- */
  function clearCalPlaceholders() {
    var nodes = document.querySelectorAll('.cal-inline');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute('data-cal-loaded') !== '1') node.innerHTML = '';
    }
  }

  function showCalPlaceholders() {
    var nodes = document.querySelectorAll('.cal-inline');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute('data-cal-loaded') === '1') continue;
      var link = node.getAttribute('data-cal-link') || 'dominant/30min';
      node.innerHTML =
        '<div class="cal-blocked">' +
          '<span class="cal-blocked-ico" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
          '</span>' +
          '<p class="cal-blocked-title">Calendario bloqueado</p>' +
          '<p class="cal-blocked-text">Acepta las cookies para ver aquí el calendario de reservas.</p>' +
          '<div class="cal-blocked-actions">' +
            '<button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept-load>Aceptar y ver calendario</button>' +
            '<a class="cal-blocked-link" href="https://cal.com/' + link + '" target="_blank" rel="noopener">o abrir en cal.com</a>' +
          '</div>' +
        '</div>';
    }
  }

  /* ---------- Delegación global (placeholder + footer) ---------- */
  document.addEventListener('click', function (e) {
    var load = e.target.closest('[data-cookie-accept-load]');
    if (load) { e.preventDefault(); accept(); return; }
    var settings = e.target.closest('[data-cookie-settings]');
    if (settings) { e.preventDefault(); showBanner(true); }
  });

  /* ---------- Init ---------- */
  function init() {
    var consent = getConsent();
    if (consent === ACCEPTED) {
      applyConsent(ACCEPTED);
    } else if (consent === REJECTED) {
      applyConsent(REJECTED);
    } else {
      // Sin decisión: bloquea terceros y muestra el banner con retardo.
      blockThirdParties();
      setTimeout(function () {
        if (!getConsent()) showBanner(false);
      }, SHOW_DELAY);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
