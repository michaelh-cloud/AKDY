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
   * PDP image gallery — clicking a thumbnail swaps the main image.
   * Thumbnail buttons carry the full-size src/srcset/alt as data
   * attributes (see main-product.liquid) so no extra request is needed
   * to know what to swap in.
   * ------------------------------------------------------------------ */
  var pdpThumbs = document.querySelector(".pdp-thumbs");
  if (pdpThumbs) {
    var pdpMainImg = document.querySelector(".pdp-media-image");
    var pdpThumbButtons = Array.prototype.slice.call(
      pdpThumbs.querySelectorAll("button")
    );
    pdpThumbButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (pdpMainImg) {
          var fullSrc = btn.getAttribute("data-full-src");
          var fullSrcset = btn.getAttribute("data-full-srcset");
          var alt = btn.getAttribute("data-alt");
          if (fullSrc) { pdpMainImg.src = fullSrc; }
          if (fullSrcset) {
            pdpMainImg.setAttribute("srcset", fullSrcset);
          } else {
            pdpMainImg.removeAttribute("srcset");
          }
          if (alt) { pdpMainImg.alt = alt; }
        }
        pdpThumbButtons.forEach(function (b) {
          b.setAttribute("aria-current", b === btn ? "true" : "false");
        });
      });
    });
  }

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

/* ==========================================================================
   AKDY — shopping cart page behaviour
   --------------------------------------------------------------------------
   Recently Viewed has a WRITE side that runs on every product page (records
   the handle to localStorage) and a READ side (fetch + render) that only
   runs on the cart page. Everything else here is guarded by the presence
   of the Recently Viewed / Saved For Later shells, which only exist on the
   cart template, so this whole block is a no-op everywhere else.

   Cart line changes (qty / remove / save-for-later) call Shopify's AJAX
   Cart API and then reload the page — line numbers shift whenever a line
   is removed, so re-rendering from the server on every change is far less
   error-prone than patching the DOM in place.
   ========================================================================== */

(function () {
  "use strict";

  var recentlyViewedShell = document.getElementById("recently-viewed-section");
  var isCartPage = !!recentlyViewedShell;

  /* Shop currency is USD; if that ever changes this needs a currency arg. */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function buildProductCard(p, extraButtonHtml) {
    var li = document.createElement("li");
    var img = p.featured_image || (p.images && p.images[0]) || null;
    li.innerHTML =
      '<div class="product-card">' +
        '<a class="card-media" href="' + p.url + '">' +
          (img
            ? '<img src="' + img + '" alt="' + String(p.title).replace(/"/g, "&quot;") + '" loading="lazy" width="600" height="600">'
            : '<div class="img-placeholder"><svg aria-hidden="true"><use href="#i-image"/></svg><span>Image Not Available</span></div>') +
        '</a>' +
        '<a class="card-title" href="' + p.url + '">' + p.title + '</a>' +
        '<p class="card-price">' + formatMoney(p.price) + '</p>' +
      '</div>';
    if (extraButtonHtml) {
      li.querySelector(".product-card").insertAdjacentHTML("beforeend", extraButtonHtml);
    }
    return li;
  }

  /* ------------------------------------------------------------------ *
   * Recently Viewed — write side (runs on product pages)
   * ------------------------------------------------------------------ */
  var RECENTLY_VIEWED_KEY = "akdy_recently_viewed";
  var RECENTLY_VIEWED_MAX = 8;

  var pdpEl = document.querySelector(".pdp[data-product-handle]");
  if (pdpEl) {
    var handle = pdpEl.getAttribute("data-product-handle");
    if (handle) {
      try {
        var seen = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
        seen = seen.filter(function (h) { return h !== handle; });
        seen.unshift(handle);
        if (seen.length > RECENTLY_VIEWED_MAX) { seen = seen.slice(0, RECENTLY_VIEWED_MAX); }
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(seen));
      } catch (e) { /* localStorage unavailable (private mode, etc.) — skip silently */ }
    }
  }

  /* ------------------------------------------------------------------ *
   * Recently Viewed — read side (runs on the cart page only)
   * ------------------------------------------------------------------ */
  if (isCartPage) {
    var recentHandles = [];
    try { recentHandles = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]"); }
    catch (e) { recentHandles = []; }

    if (recentHandles.length) {
      var rvGrid = document.getElementById("recently-viewed-grid");
      Promise.all(
        recentHandles.map(function (h) {
          return fetch("/products/" + h + ".js")
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
        })
      ).then(function (products) {
        var found = products.filter(Boolean);
        if (!found.length) { return; }
        found.forEach(function (p) { rvGrid.appendChild(buildProductCard(p)); });
        recentlyViewedShell.hidden = false;
      });
    }
  }

  if (!isCartPage) { return; }

  /* ------------------------------------------------------------------ *
   * Saved For Later — fully client-side (localStorage). "Move to Cart"
   * calls /cart/add.js for real; "Remove" only touches localStorage.
   * ------------------------------------------------------------------ */
  var SAVED_KEY = "akdy_saved_items";

  function getSaved() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function setSaved(items) {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(items)); }
    catch (e) { /* ignore */ }
  }

  function renderSaved() {
    var items = getSaved();
    var shell = document.getElementById("saved-items-section");
    var grid = document.getElementById("saved-items-grid");
    grid.innerHTML = "";
    if (!items.length) { shell.hidden = true; return; }
    shell.hidden = false;
    items.forEach(function (item, index) {
      var displayTitle = item.title + (item.variantTitle && item.variantTitle !== "Default Title" ? " — " + item.variantTitle : "");
      var li = buildProductCard(
        { url: item.url, title: displayTitle, price: item.price, featured_image: item.image },
        '<button type="button" class="btn-outline saved-item-move" data-index="' + index + '">Move to Cart</button>' +
        '<button type="button" class="saved-item-remove" data-index="' + index + '">Remove</button>'
      );
      grid.appendChild(li);
    });
  }
  renderSaved();

  document.getElementById("saved-items-grid").addEventListener("click", function (e) {
    var moveBtn = e.target.closest(".saved-item-move");
    var removeBtn = e.target.closest(".saved-item-remove");
    if (!moveBtn && !removeBtn) { return; }
    var index = parseInt((moveBtn || removeBtn).getAttribute("data-index"), 10);
    var items = getSaved();
    var item = items[index];
    if (!item) { return; }

    if (removeBtn) {
      items.splice(index, 1);
      setSaved(items);
      renderSaved();
      return;
    }

    moveBtn.disabled = true;
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: item.variantId, quantity: 1 }] })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          moveBtn.disabled = false;
          alert(result.data.description || "That item couldn't be added to your cart.");
          return;
        }
        items.splice(index, 1);
        setSaved(items);
        window.location.reload();
      })
      .catch(function () { moveBtn.disabled = false; });
  });

  /* ------------------------------------------------------------------ *
   * Cart line changes — quantity edit, remove, save-for-later.
   * ------------------------------------------------------------------ */
  function changeLine(line, quantity) {
    return fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line: line, quantity: quantity })
    }).then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); });
  }

  function showLineError(line, message) {
    var input = document.getElementById("cart-qty-" + line);
    var row = input ? input.closest(".cart-item-info") : null;
    var errorEl = row ? row.querySelector(".cart-item-error") : null;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  var cartItemsEl = document.querySelector(".cart-items");
  if (cartItemsEl) {
    cartItemsEl.addEventListener("change", function (e) {
      var input = e.target.closest(".cart-qty-input");
      if (!input) { return; }
      var line = parseInt(input.getAttribute("data-line"), 10);
      var quantity = parseInt(input.value, 10);
      if (!quantity || quantity < 1) { quantity = 1; input.value = 1; }
      input.disabled = true;
      changeLine(line, quantity).then(function (result) {
        if (!result.ok) {
          input.disabled = false;
          showLineError(line, result.data.description || "That quantity isn't available.");
          return;
        }
        window.location.reload();
      });
    });

    cartItemsEl.addEventListener("click", function (e) {
      var removeBtn = e.target.closest(".cart-remove");
      var saveBtn = e.target.closest(".cart-save-for-later");
      if (!removeBtn && !saveBtn) { return; }
      var btn = removeBtn || saveBtn;
      var line = parseInt(btn.getAttribute("data-line"), 10);
      btn.disabled = true;

      if (saveBtn) {
        var items = getSaved();
        items.unshift({
          variantId: saveBtn.getAttribute("data-variant-id"),
          title: saveBtn.getAttribute("data-title"),
          variantTitle: saveBtn.getAttribute("data-variant-title"),
          price: parseInt(saveBtn.getAttribute("data-price"), 10),
          url: saveBtn.getAttribute("data-url"),
          image: saveBtn.getAttribute("data-image")
        });
        setSaved(items);
      }

      changeLine(line, 0).then(function (result) {
        if (!result.ok) {
          btn.disabled = false;
          showLineError(line, result.data.description || "That couldn't be removed — please try again.");
          return;
        }
        window.location.reload();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Order summary collapsibles (shipping estimator / promo code)
   * ------------------------------------------------------------------ */
  document.querySelectorAll(".summary-collapse-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var panel = document.getElementById(toggle.getAttribute("aria-controls"));
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      if (panel) { panel.hidden = open; }
    });
  });

  /* ------------------------------------------------------------------ *
   * Shipping estimator — Shopify's own shipping-rates endpoint, no app.
   * Real numbers; tax is intentionally not shown (see main-cart.liquid).
   * ------------------------------------------------------------------ */
  var shipBtn = document.getElementById("ship-estimate-btn");
  if (shipBtn) {
    shipBtn.addEventListener("click", function () {
      var zip = document.getElementById("ship-zip").value.trim();
      var state = document.getElementById("ship-state").value;
      var results = document.getElementById("ship-results");
      if (!zip || !state) {
        results.innerHTML = '<p class="ship-error">Enter a zip code and pick a state to get a shipping estimate.</p>';
        return;
      }
      shipBtn.disabled = true;
      results.innerHTML = '<p class="ship-error" style="color: var(--ink-faint);">Getting estimate…</p>';
      var params = new URLSearchParams({
        "shipping_address[zip]": zip,
        "shipping_address[country]": "United States",
        "shipping_address[province]": state
      });
      fetch("/cart/shipping_rates.json?" + params.toString())
        .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (result) {
          shipBtn.disabled = false;
          if (!result.ok) {
            var msg = "Couldn't get a shipping estimate for that address.";
            if (result.data.errors && result.data.errors.shipping_address) {
              msg = "Shipping address: " + result.data.errors.shipping_address.join(", ");
            }
            results.innerHTML = '<p class="ship-error">' + msg + '</p>';
            return;
          }
          var rates = result.data.shipping_rates || [];
          if (!rates.length) {
            results.innerHTML = '<p class="ship-error">No shipping options are available for that address.</p>';
            return;
          }
          results.innerHTML = rates.map(function (rate) {
            var dollars = "$" + parseFloat(rate.price).toFixed(2);
            return '<div class="ship-rate-row"><span>' + rate.name + '</span><span>' + dollars + '</span></div>';
          }).join("");
        })
        .catch(function () {
          shipBtn.disabled = false;
          results.innerHTML = '<p class="ship-error">Couldn’t reach the shipping estimator — please try again.</p>';
        });
    });
  }

  /* ------------------------------------------------------------------ *
   * Promo code — carried to checkout as ?discount=CODE and validated
   * there; this page never confirms whether a code is valid.
   * ------------------------------------------------------------------ */
  var checkoutLink = document.getElementById("cart-checkout-link");
  var promoInput = document.getElementById("promo-code-input");
  if (checkoutLink && promoInput) {
    checkoutLink.addEventListener("click", function (e) {
      var code = promoInput.value.trim();
      if (code) {
        e.preventDefault();
        window.location.href = "/checkout?discount=" + encodeURIComponent(code);
      }
    });
  }
})();
