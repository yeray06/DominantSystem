/* ============================================================
   Dominant System — Shared JS
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Live Madrid clock ---------- */
  function updateClock() {
    var els = document.querySelectorAll('[data-clock]');
    if (!els.length) return;
    var now = new Date();
    var time = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Madrid'
    }).format(now);
    els.forEach(function (el) {
      el.textContent = time + ' en Madrid';
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- Nav shadow on scroll ---------- */
  var navWrap = document.querySelector('.nav-wrap');
  function onScroll() {
    if (!navWrap) return;
    if (window.scrollY > 12) navWrap.classList.add('scrolled');
    else navWrap.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu (bottom sheet) ---------- */
  var menu = document.querySelector('.mobile-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeEls = document.querySelectorAll('[data-menu-close]');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  closeEls.forEach(function (el) { el.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  // close when tapping a nav link inside the sheet
  document.querySelectorAll('.mobile-nav-links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Legal dropdown (desktop hover + click/keyboard a11y) ---------- */
  document.querySelectorAll('[data-dropdown]').forEach(function (dd) {
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    var dmenu = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !dmenu) return;
    function open() { dmenu.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
    function close() { dmenu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      (trigger.getAttribute('aria-expanded') === 'true') ? close() : open();
    });
    // keep aria in sync with hover on desktop
    dd.addEventListener('mouseenter', function () { trigger.setAttribute('aria-expanded', 'true'); });
    dd.addEventListener('mouseleave', function () { close(); });
    dd.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
  });

  /* ---------- Legal collapsible (mobile sheet) ---------- */
  document.querySelectorAll('[data-mobile-legal]').forEach(function (ml) {
    var trigger = ml.querySelector('.mobile-legal-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = ml.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el, i) {
      // stagger children within a shared parent group
      var group = el.closest('[data-stagger]');
      if (group) {
        var sibs = Array.prototype.slice.call(group.querySelectorAll('.reveal'));
        var idx = sibs.indexOf(el);
        el.style.setProperty('--reveal-delay', (idx * 0.09) + 's');
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Hero load-in stagger ---------- */
  window.addEventListener('load', function () {
    document.querySelectorAll('[data-hero] .reveal').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, 120 + i * 110);
    });
  });
  // fallback in case load already fired
  setTimeout(function () {
    document.querySelectorAll('[data-hero] .reveal').forEach(function (el, i) {
      if (!el.classList.contains('in')) {
        setTimeout(function () { el.classList.add('in'); }, i * 110);
      }
    });
  }, 700);

  /* ---------- Accordion (single open optional) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    var items = group.querySelectorAll('details');
    // Initialise: show the description of any item that starts open
    items.forEach(function (item) {
      var content = item.querySelector('.acc-body');
      if (item.hasAttribute('open')) {
        content.style.height = 'auto';
      } else {
        content.style.height = '0px';
      }
    });
    items.forEach(function (item) {
      var summary = item.querySelector('summary');
      var content = item.querySelector('.acc-body');
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = item.hasAttribute('open');
        // close siblings
        items.forEach(function (other) {
          if (other !== item && other.hasAttribute('open')) {
            collapse(other);
          }
        });
        if (isOpen) collapse(item);
        else expand(item);
      });
    });

    function expand(item) {
      var content = item.querySelector('.acc-body');
      item.setAttribute('open', '');
      content.style.height = 'auto';
      var h = content.scrollHeight;
      content.style.height = '0px';
      requestAnimationFrame(function () {
        content.style.height = h + 'px';
      });
      content.addEventListener('transitionend', function te() {
        content.style.height = 'auto';
        content.removeEventListener('transitionend', te);
      });
    }
    function collapse(item) {
      var content = item.querySelector('.acc-body');
      var h = content.scrollHeight;
      content.style.height = h + 'px';
      requestAnimationFrame(function () {
        content.style.height = '0px';
      });
      content.addEventListener('transitionend', function te() {
        item.removeAttribute('open');
        content.removeEventListener('transitionend', te);
      });
    }
  });

  /* ---------- Process progress line animation ---------- */
  var procLine = document.querySelector('[data-progress-line]');
  if (procLine && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { procLine.classList.add('filled'); pio.unobserve(procLine); }
      });
    }, { threshold: 0.4 });
    pio.observe(procLine);
  }

  /* ---------- Smooth anchor scroll w/ nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- Contact form (validation + mailto) ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var ERR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>';

    // Validation rules: return '' when valid, or an error message string.
    var nameRe = /^[A-Za-zÀ-ÿñÑ' .-]+$/;            // letters, spaces, accents, ' . -
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;   // basic but solid email shape
    var phoneRe = /^(?:\+?\d{1,3}[ -]?)?\d{9}$/;     // 9 digits, optional country prefix

    var rules = {
      nombre: function (v) {
        v = v.trim();
        if (!v) return 'Escribe tu nombre.';
        if (v.length < 2) return 'El nombre es demasiado corto.';
        if (!nameRe.test(v)) return 'El nombre solo puede contener letras.';
        return '';
      },
      email: function (v) {
        v = v.trim();
        if (!v) return 'Escribe tu email.';
        if (!emailRe.test(v)) return 'Email no válido. Ejemplo: nombre@correo.com';
        return '';
      },
      telefono: function (v) {
        v = v.trim();
        if (!v) return 'Escribe tu teléfono.';
        var digits = v.replace(/[ \-().]/g, '');
        if (!phoneRe.test(digits)) return 'Teléfono no válido. Debe tener 9 dígitos (ej. 612 345 678).';
        return '';
      },
      negocio: function (v) {
        v = v.trim();
        if (!v) return 'Indica el nombre de tu negocio.';
        if (v.length < 2) return 'El nombre del negocio es demasiado corto.';
        return '';
      },
      tipo: function (v) {
        if (!v) return 'Elige el tipo de web que necesitas.';
        return '';
      },
      localidad: function (v) {
        v = v.trim();
        if (!v) return 'Indica tu localidad.';
        if (!nameRe.test(v)) return 'La localidad solo puede contener letras.';
        return '';
      },
      plazo: function (v) {
        if (!v) return 'Elige un plazo.';
        return '';
      },
      consent: function (v, field) {
        if (!field.checked) return 'Debes aceptar la política de privacidad para continuar.';
        return '';
      }
    };

    function fieldWrap(field) {
      return field.closest('.field') || field.closest('.consent');
    }
    function errEl(name) {
      return form.querySelector('[data-error-for="' + name + '"]');
    }

    function validateField(name, opts) {
      opts = opts || {};
      var field = form.elements[name];
      if (!field) return true;
      var wrap = fieldWrap(field);
      var msg = rules[name](field.value || '', field);
      var box = errEl(name);
      if (msg) {
        wrap.classList.add('invalid');
        wrap.classList.remove('valid');
        if (box) box.innerHTML = (name === 'consent' ? '' : ERR_ICON) + '<span>' + msg + '</span>';
        return false;
      } else {
        wrap.classList.remove('invalid');
        wrap.classList.add('valid');
        if (box) box.innerHTML = '';
        return true;
      }
    }

    // Live validation: validate on blur, and clear errors as the user fixes them.
    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var evt = (field.type === 'checkbox' || field.tagName === 'SELECT') ? 'change' : 'blur';
      field.addEventListener(evt, function () { validateField(name); });
      field.addEventListener('input', function () {
        if (fieldWrap(field).classList.contains('invalid')) validateField(name);
      });
    });

    var statusEl = form.querySelector('[data-form-status]');
    function setStatus(type, msg) {
      if (!statusEl) return;
      statusEl.className = 'form-status show ' + type;
      var ico = type === 'ok'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>';
      statusEl.innerHTML = ico + '<span>' + msg + '</span>';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var names = Object.keys(rules);
      var firstInvalid = null;
      var okCount = 0;
      names.forEach(function (name) {
        var valid = validateField(name);
        if (valid) okCount++;
        else if (!firstInvalid) firstInvalid = form.elements[name];
      });

      if (firstInvalid) {
        var missing = names.length - okCount;
        setStatus('err', 'Revisa el formulario: hay ' + missing + (missing === 1 ? ' campo' : ' campos') + ' por corregir.');
        var fw = fieldWrap(firstInvalid);
        var y = fw.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
        try { firstInvalid.focus({ preventScroll: true }); } catch (err) { firstInvalid.focus(); }
        return;
      }

      // all valid → enviar a Netlify Forms (POST a "/" con x-www-form-urlencoded)
      var submitBtn = form.querySelector('[type="submit"], button:not([type])');
      setStatus('ok', 'Enviando tu solicitud…');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.7'; submitBtn.style.pointerEvents = 'none'; }

      function reEnable() {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; submitBtn.style.pointerEvents = ''; }
      }

      var payload = new URLSearchParams();
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        if (el.type === 'checkbox') {
          if (el.checked) payload.append(el.name, el.value || 'on');
        } else if (el.type !== 'submit' && el.type !== 'button') {
          payload.append(el.name, el.value);
        }
      });

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          form.querySelectorAll('.field, .consent').forEach(function (w) { w.classList.remove('valid', 'invalid'); });
          setStatus('ok', '¡Gracias! Te responderé en menos de 24h.');
          reEnable();
        } else {
          setStatus('err', 'No se pudo enviar el formulario. Inténtalo de nuevo o escríbenos a proyectos@dominant.es.');
          reEnable();
        }
      }).catch(function () {
        setStatus('err', 'Error de conexión. Revisa tu internet e inténtalo de nuevo.');
        reEnable();
      });
    });
  }

  /* ============================================================
     MOTION LAYER
     ============================================================ */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reading progress bar ---------- */
  (function () {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      fill.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Custom cursor (desktop fine pointer) ---------- */
  (function () {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-custom-cursor');
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var rx = x, ry = y, shown = false, overCal = false;
    var interactive = 'a, button, .card, .card-hover, .acc summary, .faq summary, input, select, textarea, .panel-btn, .footer-social a';

    function showCursor() {
      if (overCal) return;
      if (!shown) { shown = true; ring.classList.add('is-visible'); dot.classList.add('is-visible'); }
    }
    function hideCursor() {
      if (!shown) return;
      shown = false; ring.classList.remove('is-visible'); dot.classList.remove('is-visible');
    }

    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      // Sobre el iframe de Cal.com el puntero no genera mousemove; si quedara
      // alguno residual, mantenemos el cursor oculto y no lo reposicionamos.
      if (overCal) { hideCursor(); return; }
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      showCursor();
      var hot = !!(e.target.closest && e.target.closest(interactive));
      ring.classList.toggle('is-big', hot);
      dot.classList.toggle('is-hot', hot);
    });
    document.addEventListener('mousedown', function () { if (!overCal) ring.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseenter', function () { if (!overCal) showCursor(); });

    /* ---- Ocultar el cursor personalizado sobre el embed de Cal.com ----
       El iframe es cross-origin: el puntero no puede "entrar" en él y el
       cursor se quedaría congelado en el borde. Detectamos la entrada/salida
       del contenedor del calendario (.cal-inline) y ocultamos/mostramos el
       cursor de forma limpia. Solo se aplica cuando el iframe real está
       cargado (no sobre el placeholder previo al consentimiento). */
    function bindCalZone(zone) {
      zone.addEventListener('mouseenter', function () {
        if (!zone.querySelector('iframe')) return; // aún no cargado: cursor normal de la web
        overCal = true;
        ring.classList.remove('is-down', 'is-big');
        dot.classList.remove('is-hot');
        hideCursor();
      });
      zone.addEventListener('mouseleave', function () {
        overCal = false; // reaparece suavemente con el primer mousemove fuera del calendario
      });
    }
    document.querySelectorAll('.cal-inline').forEach(bindCalZone);

    // Red de seguridad: si el usuario hace clic dentro del calendario, el iframe
    // toma el foco y la ventana lo pierde -> ocultamos también el cursor.
    window.addEventListener('blur', function () {
      var ae = document.activeElement;
      if (ae && ae.tagName === 'IFRAME' && ae.closest && ae.closest('.cal-inline')) {
        overCal = true; hideCursor();
      }
    });
    window.addEventListener('focus', function () { overCal = false; });

    (function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- Animated counters ---------- */
  (function () {
    var els = document.querySelectorAll('.metric-num, .panel-stat-num');
    if (!els.length) return;
    var items = [];
    els.forEach(function (el) {
      var host = el.querySelector('.accent') || el;
      var raw = host.textContent.trim();
      var m = raw.match(/^(\D*?)([\d.,]+)(.*)$/);
      if (!m) return;
      var target = parseInt(m[2].replace(/[.,]/g, ''), 10);
      if (isNaN(target)) return;
      var data = { el: el, host: host, prefix: m[1], suffix: m[3], target: target, done: false };
      items.push(data);
      if (reduceMotion) {
        host.textContent = data.prefix + target.toLocaleString('es-ES') + data.suffix;
      } else {
        host.textContent = data.prefix + '0' + data.suffix;
      }
    });
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    function run(d) {
      var dur = 1500, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(d.target * eased);
        d.host.textContent = d.prefix + val.toLocaleString('es-ES') + d.suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var d = items.filter(function (i) { return i.el === entry.target; })[0];
        if (d && !d.done) { d.done = true; run(d); }
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    items.forEach(function (d) { cio.observe(d.el); });
  })();

  /* ---------- Word-by-word title reveal ---------- */
  (function () {
    if (reduceMotion) return;
    var sel = '.h1, .page-hero h1, .section-head > .h2, .whyus-intro > .h2, .contact-copy > .h2';
    var titles = document.querySelectorAll(sel);
    if (!titles.length) return;
    titles.forEach(function (el) {
      if (el.dataset.split === '1') return;
      if (el.querySelector('.split-word')) return;
      // take over any container reveal so words drive the animation
      el.classList.remove('reveal', 'in');
      el.classList.add('split');
      el.dataset.split = '1';
      var words = el.textContent.split(/\s+/).filter(Boolean);
      el.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'split-word';
        span.style.setProperty('--wi', i);
        span.textContent = w;
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });
    if (!('IntersectionObserver' in window)) {
      titles.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); tio.unobserve(entry.target); }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });
    titles.forEach(function (el) { tio.observe(el); });
  })();

  /* ---------- Subtle parallax (transform only) ---------- */
  (function () {
    if (reduceMotion) return;
    var targets = [];
    var glow = document.querySelector('.contact-glow');
    if (glow) { targets.push({ el: glow, factor: 0.12, max: 60, scale: 1 }); glow.style.willChange = 'transform'; }
    if (!targets.length) return;
    var vh = window.innerHeight;
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });
    var ticking = false;
    function update() {
      targets.forEach(function (t) {
        var r = t.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var center = r.top + r.height / 2;
        var off = (center - vh / 2) * t.factor;
        if (off > t.max) off = t.max; else if (off < -t.max) off = -t.max;
        t.el.style.transform = (t.scale !== 1 ? 'scale(' + t.scale + ') ' : '') + 'translateY(' + off.toFixed(2) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();
})();
