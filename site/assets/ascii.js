/* KIAZAKI — quiet machinery: theme, glitch, readout */

(function () {
  "use strict";

  /* theme toggle */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function paintChrome() {
    if (!themeMeta) return;
    themeMeta.setAttribute("content",
      document.documentElement.getAttribute("data-theme") === "light" ? "#ece7db" : "#060606");
  }
  paintChrome();

  var btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      paintChrome();
      try { localStorage.setItem("kiazaki-theme", next); } catch (e) {}
    });
  }

  /* subtle char corruption on big ascii blocks (hero only) */
  var owl = document.getElementById("heroOwl");
  if (owl) {
    var glitches = "·.:*~+|-_=/\\:;".split("");

    function textNodes(el, acc) {
      for (var i = 0; i < el.childNodes.length; i++) {
        var n = el.childNodes[i];
        if (n.nodeType === 3 && n.data.trim()) acc.push(n);
        else if (n.nodeType === 1 && !/(\bred\b|\bdim\b|\bglitch\b)/.test(String(n.className))) {
          /* the 33:27 eyes and glyph-colored bits never corrupt */
          textNodes(n, acc);
        }
      }
      return acc;
    }

    function glitchOnce() {
      var nodes = textNodes(owl, []);
      if (!nodes.length) { schedule(); return; }
      var node = nodes[Math.floor(Math.random() * nodes.length)];
      var s = node.data;
      var idx = Math.floor(Math.random() * s.length);
      if (/\s/.test(s[idx])) { schedule(); return; }
      var original = s[idx];
      node.data = s.slice(0, idx) + glitches[Math.floor(Math.random() * glitches.length)] + s.slice(idx + 1);
      setTimeout(function () {
        var cur = node.data;
        node.data = cur.slice(0, idx) + original + cur.slice(idx + 1);
        schedule();
      }, 140 + Math.random() * 160);
    }

    function schedule() {
      setTimeout(glitchOnce, 3500 + Math.random() * 4500);
    }
    schedule();
  }

  /* neon sign — spells KIAZAKI letter by letter, drifts, blacks out, repeats */
  var neon = document.querySelector(".hero .neon");
  if (neon) {
    var letters = Array.prototype.slice.call(neon.querySelectorAll("span"));
    var still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    if (!still && letters.length) {
      var tend = function (fn, ms) { return setTimeout(fn, ms); };
      var badTube = 3; /* the worn tube — changes each night */

      /* all tubes dead until the sign ignites */
      letters.forEach(function (s) { s.classList.add("off"); });

      function lightOne(k, order, done) {
        var s = letters[order[k]];
        s.classList.remove("off"); /* tube strikes */
        tend(function () {
          if (Math.random() < (order[k] === badTube ? 0.7 : 0.25)) { /* worn tube fights hard */
            s.classList.add("off");
            tend(function () { s.classList.remove("off"); done(); }, 60 + Math.random() * 90);
          } else { done(); }
        }, 40 + Math.random() * 130);
      }

      function igniteOrder() {
        /* always spell it out: K, I, A, Z, A, K, I */
        return [0, 1, 2, 3, 4, 5, 6];
      }

      function ignite(k, order) {
        if (k >= order.length) { tend(wayward, 4200 + Math.random() * 2800); return; }
        lightOne(k, order, function () {
          tend(function () { ignite(k + 1, order); }, 330 + Math.random() * 240);
        });
      }

      function wayward() {
        var n = 1 + Math.floor(Math.random() * 3);
        (function next(d) {
          if (d >= n) { tend(blackout, 1200 + Math.random() * 1800); return; }
          var s = (Math.random() < 0.5)
            ? letters[badTube] /* the worn tube drops out more */
            : letters[Math.floor(Math.random() * letters.length)];
          s.classList.add("off");
          tend(function () { s.classList.remove("off"); next(d + 1); }, 90 + Math.random() * 280);
        })(0);
      }

      function blackout() {
        badTube = 2 + Math.floor(Math.random() * 3); /* one of A, Z, A wears out */
        letters.forEach(function (s) { s.classList.add("off"); });
        tend(function () { ignite(0, igniteOrder()); }, 900 + Math.random() * 1000);
      }

      blackout();
    }
  }

  /* footer glyph — the Watcher, shared across all pages */    var footOwl = document.getElementById("footOwl");
  if (footOwl) {
    footOwl.innerHTML = [
      "             ##   ##########   ##",
      "             ##. . . . . . . . ##",
      "           #####. . . . . . . #####",
      "         # .#####. . . . . . .#####.#",
      "        # . . .:: . . . . . .:: . . .#",
      "       # . . :    :. . . . :    :. . .#",
      "      # . . :      :. . . :      :. . .#",
      "     # . . .         . . .         . . .#",
      "     #. . .:   <span class=\"red\">33</span>   : . .:  <span class=\"red\">27</span>    : . . #",
      "     # . . :        :. . :        :. . .#",
      "     #. . .         ######        . . . #",
      "      #. . .:      : # .#.:      : . . #",
      "       #. . .:    : . ##. .:    : . . #",
      "        #. . . ::. . . . . . ::. . . #",
      "         #. . . . . . . . . . . . . #",
      "  ii+m+==================================e",
      "   .         ,        ~~            .      ,",
      "                ~        <span class=\"dim\">気</span>          ~",
      "              ~            ~        ~"
    ].join("\n");
  }

  /* 33:27 readout ticker */
  var readout = document.getElementById("readout");
  if (readout) {
    var spin = "/\\|";
    var i = 0;
    setInterval(function () {
      i = (i + 1) % spin.length;
      readout.textContent = "[ 33:27 ]  " + spin[i] + "  気 on-air  " + spin[i] + "  [ 33:27 ]";
    }, 240);
  }

  /* ── subtle motion: scroll reveals + watcher drift ── */
  var motionOK = false;
  try { motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  if (motionOK) {
    document.documentElement.classList.add("motion");

    /* stagger index = position among same-kind siblings */
    function rowIndex(el, cls) {
      var n = 0, sib = el;
      while ((sib = sib.previousElementSibling)) {
        if (sib.classList && sib.classList.contains(cls)) n++;
      }
      return n;
    }

    var groups = [".card", ".precept", ".piece", ".pagehead"];
    var pending = [];
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var cls = sel.slice(1);
        el.style.transitionDelay = (rowIndex(el, cls) * 80) + "ms";
        el.classList.add("reveal");
        pending.push(el);
      });
    });

    /* deterministic scroll reveal — rAF-throttled, immune to anchor jumps */
    function check() {
      var vh = window.innerHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh - 40) { el.classList.add("in"); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; check(); });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check();

    /* the Watcher leans toward the cursor, a few monospace pixels at a time */
    var art = document.querySelector(".foot-art");
    var finePointer = false;
    try { finePointer = window.matchMedia("(pointer: fine)").matches; } catch (e) {}
    if (art && finePointer) {
      document.addEventListener("mousemove", function (ev) {
        var dx = ev.clientX / window.innerWidth - 0.5;
        var dy = ev.clientY / window.innerHeight - 0.5;
        art.style.translate = (dx * -12) + "px " + (dy * -7) + "px";
      }, { passive: true });
    }
  }

  /* ── hairline reading wire under the top edge ── */
  var wire = document.createElement("div");
  wire.className = "progress-wire";
  document.body.appendChild(wire);
  function wireUpd() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    wire.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  var wireQ = false;
  function wireScroll() {
    if (wireQ) return;
    wireQ = true;
    requestAnimationFrame(function () { wireQ = false; wireUpd(); });
  }
  window.addEventListener("scroll", wireScroll, { passive: true });
  window.addEventListener("resize", wireScroll, { passive: true });
  wireUpd();

  /* ── the tab keeps a quiet heartbeat while you are away ── */
  var baseTitle = document.title;
  document.addEventListener("visibilitychange", function () {
    document.title = document.hidden ? "( 気 ) the owl is watching" : baseTitle;
  });

  /* ── kanji footnotes — hover any 気 (outside the ascii frames) for its meaning ── */
  (function () {
    var hits = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.data || n.data.indexOf("気") < 0) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== document.body) {
          if (p.nodeName === "PRE" || p.nodeName === "SCRIPT" || p.nodeName === "TITLE" ||
              (p.id === "readout") || (p.classList && p.classList.contains("ktip"))) {
            return NodeFilter.FILTER_REJECT;
          }
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) hits.push(walker.currentNode);
    hits.forEach(function (n) {
      var frag = document.createDocumentFragment();
      var parts = n.data.split("気");
      for (var i = 0; i < parts.length; i++) {
        frag.appendChild(document.createTextNode(parts[i]));
        if (i < parts.length - 1) {
          var s = document.createElement("span");
          s.className = "ktip";
          s.setAttribute("tabindex", "0");
          s.setAttribute("data-tip", "気 ki · spirit, vital force");
          s.textContent = "気";
          frag.appendChild(s);
        }
      }
      n.parentNode.replaceChild(frag, n);
    });
  })();
})();

/* ── the vault — open a frame, step through with ← →, close with esc ── */
(function () {
  "use strict";

  var lb = document.getElementById("lightbox");
  if (!lb) return;

  var img = document.getElementById("lbImg");
  var cap = document.getElementById("lbCap");
  var num = document.getElementById("lbNum");
  var prev = document.getElementById("lbPrev");
  var next = document.getElementById("lbNext");
  var closeBtn = document.getElementById("lbClose");

  var frames = [];   /* the open drawer's frames, in order */
  var at = -1;
  var opener = null; /* the frame to hand focus back to */

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function show(i) {
    if (!frames.length) return;
    if (i < 0) i = 0;
    if (i > frames.length - 1) i = frames.length - 1;
    at = i;

    var shot = frames[at];
    img.src = shot.getAttribute("data-full");
    img.alt = shot.getAttribute("data-cap") || "";
    cap.textContent = shot.getAttribute("data-cap") || "";
    num.textContent = pad(at + 1) + " / " + pad(frames.length);
    prev.disabled = at === 0;
    next.disabled = at === frames.length - 1;
  }

  function open(shot) {
    var sheet = shot.parentNode;
    frames = Array.prototype.slice.call(sheet.querySelectorAll(".shot"));
    at = frames.indexOf(shot);
    opener = shot;

    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
    show(at);
    closeBtn.focus();
  }

  function shut() {
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
    img.removeAttribute("src");
    img.alt = "";
    if (opener) opener.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".shot"), function (shot) {
    shot.addEventListener("click", function () { open(shot); });
  });

  prev.addEventListener("click", function () { show(at - 1); });
  next.addEventListener("click", function () { show(at + 1); });
  closeBtn.addEventListener("click", shut);

  /* click the dark stage to dismiss, never the frame itself */
  lb.addEventListener("click", function (ev) {
    if (ev.target === lb || (ev.target.classList && ev.target.classList.contains("lb-stage"))) shut();
  });

  document.addEventListener("keydown", function (ev) {
    if (lb.hidden) return;

    if (ev.key === "Escape") {
      ev.preventDefault();
      shut();
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      show(at - 1);
    } else if (ev.key === "ArrowRight") {
      ev.preventDefault();
      show(at + 1);
    } else if (ev.key === "Tab") {
      /* keep focus inside the viewer */
      var ring = [closeBtn, prev, next].filter(function (b) { return !b.disabled; });
      var first = ring[0], last = ring[ring.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  });
})();
