/* ==========================================================================
   AKDY — home page behaviour (vanilla JS, no dependencies)
   --------------------------------------------------------------------------
   1. Hero carousel: seamless infinite loop, dot navigation, auto-advance,
      pause on hover/focus, keyboard arrow support.
   2. Collapsed-nav (hamburger) toggle below 768px.
   3. Preview-mode guards: data-todo links and the newsletter/search forms
      are inert so nothing 404s inside the preview.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Hero carousel
   *
   * The original site runs bx-slider with cloned panes at both ends for
   * its loop. Same technique here, but the clones are created by this
   * script rather than living in the markup, so the document itself has
   * exactly five real slides and five dots.
   * ------------------------------------------------------------------ */
  var hero = document.querySelector(".hero");
  if (hero) {
    var track = hero.querySelector(".hero-track");
    var slides = Array.prototype.slice.call(
      track.querySelectorAll(".hero-slide")
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-dots button")
    );
    var count = slides.length;
    var current = 0;          // 0-based index of the real slide in view
    var timer = null;
    var INTERVAL = 6000;      // auto-advance every 6s
    var animating = false;

    // Clone last slide to the front and first slide to the back so the
    // track can slide past either end and then snap invisibly.
    var firstClone = slides[0].cloneNode(true);
    var lastClone = slides[count - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    // Clones must not be tab stops or duplicate ids.
    [firstClone, lastClone].forEach(function (clone) {
      clone.querySelectorAll("a").forEach(function (a) {
        a.setAttribute("tabindex", "-1");
      });
    });
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);

    // With the leading clone, real slide i sits at track position i + 1.
    function setTransform(position, animate) {
      track.style.transition = animate ? "" : "none";
      track.style.transform = "translateX(-" + position * 100 + "%)";
      if (!animate) {
        // Force reflow so the next animated move starts from here.
        void track.offsetWidth;
        track.style.transition = "";
      }
    }
    setTransform(1, false);

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
    }

    function goTo(index, viaClone) {
      if (animating) return;
      animating = true;
      current = ((index % count) + count) % count;
      // viaClone: -1 slid backwards past the front, +1 slid past the end.
      var position = viaClone === 1 ? count + 1 : viaClone === -1 ? 0 : current + 1;
      setTransform(position, true);
      updateDots();
    }

    track.addEventListener("transitionend", function () {
      animating = false;
      // If the track is resting on a clone, snap to the real slide.
      var pos = current + 1;
      setTransform(pos, false);
    });

    function next() {
      if (current === count - 1) { goTo(0, 1); } else { goTo(current + 1); }
    }
    function prev() {
      if (current === 0) { goTo(count - 1, -1); } else { goTo(current - 1); }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); restart(); });
    });

    // Auto-advance, paused while hovered or while focus is inside.
    function start() { if (!timer) { timer = setInterval(next, INTERVAL); } }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", start);

    // Keyboard arrows work when focus is anywhere inside the carousel.
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(); restart(); e.preventDefault(); }
      if (e.key === "ArrowRight") { next(); restart(); e.preventDefault(); }
    });

    start();
  }

  /* ------------------------------------------------------------------ *
   * Collapsed-nav toggle (below 768px)
   * ------------------------------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------------ *
   * Preview-mode guards
   *
   * Every link whose destination page doesn't exist yet carries
   * href="#" and a data-todo attribute naming the intended target
   * (greppable). Stop them from jumping the scroll position.
   * ------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-todo]");
    if (link) { e.preventDefault(); }
  });

  // Search and newsletter forms are display-only in the preview.
  document.querySelectorAll("form[data-preview-inert]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); });
  });
})();

/* ==========================================================================
   AKDY — category & product page behaviour (added for the support pages;
   the home page IIFE above is client-approved and untouched)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * PDP tab strip (Overview | Specs & Care) — in-page panes, no URL change
   * ------------------------------------------------------------------ */
  var tabStrip = document.querySelector(".pdp-tabs");
  if (tabStrip) {
    var tabs = Array.prototype.slice.call(tabStrip.querySelectorAll("button"));
    var panes = Array.prototype.slice.call(
      document.querySelectorAll(".tab-pane")
    );
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t, j) {
          t.setAttribute("aria-selected", i === j ? "true" : "false");
        });
        panes.forEach(function (p, j) {
          p.classList.toggle("active", i === j);
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Leading compatibility warning in part descriptions.
   * The catalogue data has no dedicated field for it (it lives inside the
   * description), so the first paragraph is promoted to warning styling
   * when it is a "Please use our … tool" compatibility pointer (CF0015
   * style). The "Please note that all parts are all final sale" returns
   * boilerplate appears on every part and stays normal body text.
   * ------------------------------------------------------------------ */
  document.querySelectorAll(".pdp-desc").forEach(function (desc) {
    var first = desc.querySelector("p");
    if (first && /^\s*please\s+use\s+our\b/i.test(first.textContent)) {
      first.classList.add("desc-warning");
    }
  });

  /* ------------------------------------------------------------------ *
   * Compare selection — the compare bar allows at most four items
   * ------------------------------------------------------------------ */
  var MAX_COMPARE = 4;
  document.addEventListener("change", function (e) {
    if (!e.target.classList || !e.target.classList.contains("compare-check")) {
      return;
    }
    var checked = document.querySelectorAll(".compare-check:checked");
    if (checked.length > MAX_COMPARE) { e.target.checked = false; }
  });

  /* ------------------------------------------------------------------ *
   * Toolbar selects that navigate (sort order). Options carry full URLs
   * in their value; an empty value is display-only (static previews).
   * ------------------------------------------------------------------ */
  document.querySelectorAll("select[data-navigate]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      if (this.value) { window.location.href = this.value; }
    });
  });

  /* ------------------------------------------------------------------ *
   * Header dropdowns, mobile: items with children expand in place inside
   * the hamburger. Desktop open/close is pure CSS hover (no .open class),
   * so these toggles only matter below 768px where the buttons are shown.
   * ------------------------------------------------------------------ */
  document.querySelectorAll(".site-nav .submenu-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.parentElement;
      var open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ------------------------------------------------------------------ *
   * View toggles — visual state only; the grid view is the approved
   * layout, list/table variants are pending.
   * ------------------------------------------------------------------ */
  var toggles = Array.prototype.slice.call(
    document.querySelectorAll(".view-toggles button")
  );
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggles.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });
})();
