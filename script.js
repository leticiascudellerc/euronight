(function () {
  // text the script sets itself comes from lang.js when a language is loaded, English otherwise
  function tr(key, fallback) { return (window.currentStrings && window.currentStrings[key]) || fallback; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // grey camera: one click flashes, the first photo zooms out of the lens, then the reel scrolls sideways
  var N = 20, printed = N;
  function src(i, s) { return "photos/" + String(i).padStart(2, "0") + s + ".webp"; }
  var shootEl = document.getElementById("shoot"), gcam = document.getElementById("gcam"), reel = document.getElementById("reel");
  var flashScreen = document.getElementById("flashScreen"), flashwin = document.getElementById("flashwin");
  for (var k = 1; k <= N; k++) {
    var sl = document.createElement("button"); sl.className = "slide"; sl.type = "button"; sl.dataset.i = k;
    sl.setAttribute("aria-label", "Open photo " + k + " of " + N + " full size");
    var im = document.createElement("img"); im.src = src(k, "f"); im.alt = "Guests at a past EuroNight"; im.loading = k <= 2 ? "eager" : "lazy";
    sl.appendChild(im); reel.appendChild(sl);
  }
  var slides = [].slice.call(reel.children), active = 0;
  function setActive(n) {
    active = Math.max(0, Math.min(N - 1, n));
    slides.forEach(function (s, j) { s.classList.toggle("active", j === active); });
    document.getElementById("reelCount").innerHTML = "<b>" + String(active + 1).padStart(2, "0") + "</b> / " + N;
  }
  function goTo(n) { setActive(n); var s = slides[active]; reel.scrollTo({ left: s.offsetLeft - (reel.clientWidth - s.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" }); }
  var scT; reel.addEventListener("scroll", function () {
    clearTimeout(scT); scT = setTimeout(function () {
      var mid = reel.scrollLeft + reel.clientWidth / 2, best = 0, bd = 1e9;
      slides.forEach(function (s, j) { var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = j; } });
      setActive(best);
    }, 60);
  }, { passive: true });
  document.getElementById("reelPrev").addEventListener("click", function () { goTo(active - 1); });
  document.getElementById("reelNext").addEventListener("click", function () { goTo(active + 1); });
  reel.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); } });
  reel.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    var max = reel.scrollWidth - reel.clientWidth;
    if ((e.deltaY > 0 && reel.scrollLeft < max - 1) || (e.deltaY < 0 && reel.scrollLeft > 0)) { e.preventDefault(); reel.scrollLeft += e.deltaY; }
  }, { passive: false });

  var opening = false;
  gcam.addEventListener("click", function () {
    if (opening) return; opening = true;
    gcam.classList.add("pressed");
    flashwin.classList.add("pop");
    setTimeout(function () { flashwin.classList.remove("pop"); gcam.classList.remove("pressed"); }, 220);
    if (!reduce) { flashScreen.classList.remove("go"); void flashScreen.offsetWidth; flashScreen.classList.add("go"); }
    var lensR = document.getElementById("camLens").getBoundingClientRect();
    setTimeout(function () {
      shootEl.classList.add("open");
      reel.classList.remove("ready");
      slides.forEach(function (s, j) { s.classList.toggle("later", j > 0); });
      reel.scrollLeft = 0; setActive(0);
      var first = slides[0], fr = first.getBoundingClientRect();
      if (reduce) { slides.forEach(function (s) { s.classList.remove("later"); }); reel.classList.add("ready"); opening = false; reel.focus({ preventScroll: true }); return; }
      // zoom: a round crop of photo 1 grows from the lens into the first slide
      first.style.visibility = "hidden";
      var z = document.createElement("div"); z.className = "zoomer";
      z.innerHTML = '<img alt="" src="' + src(1, "f") + '">';
      Object.assign(z.style, { left: lensR.left + "px", top: lensR.top + "px", width: lensR.width + "px", height: lensR.height + "px" });
      document.body.appendChild(z);
      var anim = z.animate([
        { left: lensR.left + "px", top: lensR.top + "px", width: lensR.width + "px", height: lensR.height + "px", borderRadius: "50%" },
        { left: fr.left + "px", top: fr.top + "px", width: fr.width + "px", height: fr.height + "px", borderRadius: "10px" }
      ], { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      anim.onfinish = function () {
        first.style.visibility = ""; z.remove();
        slides.forEach(function (s, j) { setTimeout(function () { s.classList.remove("later"); }, Math.min(j, 4) * 90); });
        setTimeout(function () { reel.classList.add("ready"); opening = false; reel.focus({ preventScroll: true }); }, 450);
      };
    }, 260);
  });
  document.getElementById("reelBack").addEventListener("click", function () {
    shootEl.classList.remove("open"); gcam.focus();
  });
  var lb = document.getElementById("lb"), lbImg = document.getElementById("lbImg"), lbCnt = document.getElementById("lbCnt"), cur = 1, lastFocus = null;
  function show(i) { var M = Math.max(printed, 1); cur = (i - 1 + M) % M + 1; lbImg.src = src(cur, "f"); lbImg.alt = "Photo " + cur + " from a past EuroNight"; lbCnt.textContent = cur + " / " + Math.max(printed, 1); }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; document.getElementById("lbX").focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  reel.addEventListener("click", function (e) { var b = e.target.closest(".slide"); if (!b) return; var j = +b.dataset.i - 1; if (j !== active) goTo(j); else openLb(j + 1); });
  document.getElementById("lbX").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { show(cur - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });

  // scroll reveals: only things below the fold start hidden, so the page is complete at rest
  var io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      if (el.matches("section.block")) { el.classList.add("drawing"); requestAnimationFrame(function () { el.classList.remove("pending"); }); }
      else { var d = (+el.dataset.i - 1) % 4; setTimeout(function () { el.classList.remove("pending"); }, d * 90); }
    });
  }, { threshold: 0.15 }) : null;
  function arm(el) {
    if (!io) return;
    if (el.getBoundingClientRect().top > innerHeight * 0.9) { el.classList.add("pending"); io.observe(el); }
  }
  document.querySelectorAll("section.block").forEach(arm);

  // club Instagram preview cards. Fill in handles and add post images (posts: ["ig/greek-1.webp", ...]) here.
  var CLUBS = {
    itasa:   { name: "Italian Student Association", handle: "itasaubc", bio: "", posts: [] },
    greek:   { name: "Greek Student Association", handle: "ubc_greeksa", bio: "", posts: [] },
    turkish: { name: "Turkish Student Association", handle: "tsaubc", bio: "", posts: [] },
    franco:  { name: "UBC Francophone", handle: "ubc_francophone", bio: "", posts: [] },
    xisc:    { name: "Exchange and International Student Club", handle: "ubcxisc", bio: "", posts: [] },
    balkan:  { name: "Balkan Student Association", handle: "ubc.balkan", bio: "", posts: [] },
    rssc:    { name: "Russian-Speaking Student Community", handle: "", bio: "", posts: [] }
  };
  var ig = document.getElementById("ig"), igCard = document.getElementById("igCard"), igLast = null;
  function openIg(stop) {
    var c = CLUBS[stop.dataset.club]; if (!c) return;
    igLast = stop;
    igCard.style.setProperty("--c", getComputedStyle(stop).getPropertyValue("--c"));
    document.getElementById("igName").textContent = c.name;
    document.getElementById("igHandle").textContent = c.handle ? "@" + c.handle : c.name;
    var bio = document.getElementById("igBio"); bio.textContent = c.bio; bio.hidden = !c.bio;
    var av = document.getElementById("igAvatar"), logo = stop.querySelector("img");
    av.src = logo ? logo.src : ""; av.alt = c.name + " logo";
    var posts = document.getElementById("igPosts"); posts.innerHTML = "";
    c.posts.forEach(function (p) { var im = document.createElement("img"); im.src = p; im.alt = "Recent post from " + c.name; posts.appendChild(im); });
    posts.hidden = c.posts.length === 0;
    var open = document.getElementById("igOpen"), note = document.getElementById("igNote");
    if (c.handle) { open.href = "https://www.instagram.com/" + c.handle + "/"; open.hidden = false; note.hidden = true; }
    else { open.hidden = true; note.hidden = false; }
    ig.hidden = false; document.body.style.overflow = "hidden";
    document.getElementById("igClose").focus();
  }
  function closeIg() { ig.hidden = true; document.body.style.overflow = ""; if (igLast) igLast.focus(); }
  document.querySelectorAll(".stop[data-club]").forEach(function (s) {
    s.addEventListener("click", function () { openIg(s); });
    s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIg(s); } });
  });
  document.getElementById("igClose").addEventListener("click", closeIg);
  ig.addEventListener("click", function (e) { if (e.target === ig) closeIg(); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && !ig.hidden) closeIg(); });

  // ----- interactive layer -----
  var COLORS = ["#ff3ea5", "#3ef2ff", "#78ff6e", "#f4b942", "#b06bff"];
  function pick() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // cursor light + hero parallax
  var cl = document.getElementById("cursorLight"), band = document.querySelector(".hero-band");
  if (fine && !reduce) {
    addEventListener("pointermove", function (e) {
      cl.classList.add("on");
      cl.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    }, { passive: true });
    document.addEventListener("pointerleave", function () { cl.classList.remove("on"); });
    band.addEventListener("pointermove", function (e) {
      var r = band.getBoundingClientRect();
      band.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      band.style.setProperty("--my", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    }, { passive: true });
    band.addEventListener("pointerleave", function () { band.style.setProperty("--mx", 0); band.style.setProperty("--my", 0); });
  }

  // disco ball: tap to throw light across the hero
  var ball = document.getElementById("ball"), spots = document.getElementById("spots");
  function burst(n) {
    var br = ball.querySelector(".ball").getBoundingClientRect(), hr = band.getBoundingClientRect();
    var cx = br.left + br.width / 2 - hr.left, cy = br.top + br.height / 2 - hr.top;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span"); s.className = "spot";
      var a = Math.random() * Math.PI * 2, d = 200 + Math.random() * Math.max(hr.width, 500) * 0.7;
      var c = pick(); s.style.background = c; s.style.boxShadow = "0 0 12px 3px " + c;
      s.style.left = cx + "px"; s.style.top = cy + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.abs(Math.sin(a)) * d * 0.8 + "px");
      s.style.animationDelay = (Math.random() * 0.25) + "s";
      spots.appendChild(s);
      setTimeout(function (el) { el.remove(); }.bind(null, s), 2300);
    }
  }
  ball.addEventListener("click", function () {
    if (reduce) return;
    ball.classList.add("burst"); burst(42);
    setTimeout(function () { ball.classList.remove("burst"); }, 1400);
    
  });
  if (!reduce) setInterval(function () { if (!document.hidden) burst(4); }, 2600);

  // dance floor
  var fg = document.getElementById("floorGrid"), tiles = [], cols = 38, rows = 9;
  // tiny pixel font for the date spelled in tiles
  var GLYPH = {
    "T": ["111","010","010","010","010"], "H": ["101","101","111","101","101"], "U": ["101","101","101","101","111"],
    "2": ["111","001","111","100","111"], "6": ["111","100","111","101","111"],
    "N": ["1001","1101","1011","1001","1001"], "O": ["111","101","101","101","111"], "V": ["101","101","101","101","010"],
    "E": ["111","100","111","100","111"], "P": ["111","101","111","100","100"], "I": ["111","010","010","010","111"]
  };
  function wordWidth(w) { var n = 0; for (var i = 0; i < w.length; i++) n += w[i] === " " ? 2 : GLYPH[w[i]][0].length + (i < w.length - 1 && w[i + 1] !== " " ? 1 : 0); return n; }
  function stamp(set, w, top) {
    var x = Math.round((cols - wordWidth(w)) / 2);
    for (var i = 0; i < w.length; i++) {
      if (w[i] === " ") { x += 2; continue; }
      var g = GLYPH[w[i]];
      g.forEach(function (row, y) { for (var k = 0; k < row.length; k++) if (row[k] === "1") set[(top + y) * cols + x + k] = true; });
      x += g[0].length + (i < w.length - 1 && w[i + 1] !== " " ? 1 : 0);
    }
  }
  var floorFrames = [], frameIx = 0;
  function buildFloor() {
    var small = innerWidth <= 760;
    cols = small ? 14 : 38; rows = small ? 13 : 15;
    fg.style.setProperty("--cols", cols);
    fg.innerHTML = ""; tiles = [];
    var a = {}, b = {};
    // desktop shows both lines; phones flip between the date and the venue
    if (small) { stamp(a, "26", 1); stamp(a, "NOV", 7); stamp(b, "THE", 1); stamp(b, "PIT", 7); floorFrames = [a, b]; }
    else { stamp(a, "THU 26 NOV", 2); stamp(a, "THE PIT", 8); floorFrames = [a]; }
    frameIx = 0;
    for (var i = 0; i < cols * rows; i++) {
      var d = document.createElement("div"); d.className = "tile"; d.dataset.i = i;
      d.style.animationDelay = ((i % cols) * 0.06) + "s";
      fg.appendChild(d); tiles.push(d);
    }
    paintFrame();
  }
  function paintFrame() {
    var f = floorFrames[frameIx] || {};
    tiles.forEach(function (d, i) { d.classList.toggle("date", !!f[i]); });
  }
  setInterval(function () {
    if (floorFrames.length < 2 || document.hidden) return;
    frameIx = (frameIx + 1) % floorFrames.length; paintFrame();
  }, 3000);
  function light(tile, c, ms) {
    if (!tile) return;
    tile.style.setProperty("--tc", c || pick()); tile.classList.add("lit");
    clearTimeout(tile._t); tile._t = setTimeout(function () { tile.classList.remove("lit"); }, ms || 120);
  }
  function at(x, y) { return (x >= 0 && y >= 0 && x < cols && y < rows) ? tiles[y * cols + x] : null; }
  function wave(i, c) {
    var x0 = i % cols, y0 = Math.floor(i / cols);
    tiles.forEach(function (t, k) {
      var x = k % cols, y = Math.floor(k / cols), d = Math.round(Math.hypot(x - x0, y - y0));
      setTimeout(function () { light(t, c, 160); }, d * 70);
    });
  }
  buildFloor();
  var lastCols = cols;
  addEventListener("resize", function () { if ((innerWidth <= 760 ? 14 : 38) !== lastCols) { buildFloor(); lastCols = cols; } });
  fg.addEventListener("pointermove", function (e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.classList.contains("tile")) light(el, null, 140);
  });
  fg.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".tile"); if (el) wave(+el.dataset.i, pick());
  });
  // idle sparkle so the floor is never dead
  if (!reduce) setInterval(function () { if (document.hidden) return; for (var n = 0; n < 3; n++) { var tt = tiles[Math.floor(Math.random() * tiles.length)]; if (!tt.classList.contains("date")) light(tt, null, 400); } }, 220);

  // drop the beat: a short choreographed light show
  var dropping = false;
  document.getElementById("dropBtn").addEventListener("click", function () {
    if (dropping) return; dropping = true; var btn = this; btn.textContent = tr("dancing", "Dancing...");
    var beat = 0, total = 16;
    var iv = setInterval(function () {
      var c = COLORS[beat % COLORS.length];
      if (beat < 4) { tiles.forEach(function (t, k) { if ((k % cols + Math.floor(k / cols) + beat) % 2 === 0) light(t, c, 220); }); }
      else if (beat < 8) { var band0 = Math.floor((beat - 4) * cols / 4), band1 = Math.floor((beat - 3) * cols / 4); tiles.forEach(function (t, k) { var x = k % cols; if (x >= band0 && x < band1) light(t, c, 260); }); }
      else if (beat < 12) { wave(Math.floor(rows / 2) * cols + Math.floor(cols / 2), c); }
      else { tiles.forEach(function (t) { if (Math.random() < 0.5) light(t, pick(), 240); }); }
      if (beat % 4 === 0 && !reduce) burst(10);
      beat++;
      if (beat >= total) { clearInterval(iv); dropping = false; btn.textContent = tr("again", "Again!");
        fg.classList.add("finale"); setTimeout(function () { fg.classList.remove("finale"); }, 1600); }
    }, 300);
  });

  // request slips: flip on tap, light the floor tiles behind the card
  var ft = document.getElementById("faqTiles"), ftiles = [];
  function buildFaqTiles() {
    var r = ft.getBoundingClientRect(), colsF = Math.max(1, Math.floor((r.width + 4) / 38)), rowsF = Math.ceil((r.height + 4) / 38);
    var need = colsF * rowsF;
    if (ftiles.length === need) return;
    ft.innerHTML = ""; ftiles = [];
    for (var i = 0; i < need; i++) { var d = document.createElement("div"); d.className = "ftile"; ft.appendChild(d); ftiles.push(d); }
  }
  function flash(tile, c, ms) {
    tile.style.setProperty("--tc", c); tile.classList.add("lit");
    clearTimeout(tile._t); tile._t = setTimeout(function () { tile.classList.remove("lit"); }, ms);
  }
  buildFaqTiles(); addEventListener("resize", buildFaqTiles);
  if (!reduce) setInterval(function () { if (document.hidden || !ftiles.length) return; for (var n = 0; n < 2; n++) flash(ftiles[Math.floor(Math.random() * ftiles.length)], pick(), 900); }, 700);
  document.querySelectorAll(".drink").forEach(function (card) {
    card.addEventListener("click", function () {
      var open = card.getAttribute("aria-expanded") !== "true";
      card.setAttribute("aria-expanded", open);
      if (!open) return;
      var cr = card.getBoundingClientRect(), c = getComputedStyle(card).getPropertyValue("--liq").trim() || pick();
      ftiles.forEach(function (tl) {
        var r = tl.getBoundingClientRect();
        if (r.right > cr.left - 40 && r.left < cr.right + 40 && r.bottom > cr.top - 40 && r.top < cr.bottom + 40) {
          var d = Math.hypot(r.left + r.width / 2 - (cr.left + cr.width / 2), r.top + r.height / 2 - (cr.top + cr.height / 2));
          setTimeout(function () { flash(tl, c, 700); }, reduce ? 0 : d * 1.5);
        }
      });
    });
  });

  // nav: solid after the hero starts scrolling, menu toggle on phones
  var nav = document.getElementById("nav"), mb = document.getElementById("menuBtn"), nl = document.getElementById("navLinks");
  function onScroll() { nav.classList.toggle("solid", scrollY > 40 || nl.classList.contains("open")); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  mb.addEventListener("click", function () {
    var open = nl.classList.toggle("open"); mb.setAttribute("aria-expanded", open); mb.textContent = open ? tr("close", "Close") : tr("menu", "Menu"); onScroll();
  });
  nl.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () {
    nl.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.textContent = tr("menu", "Menu"); onScroll();
  }); });

  // highlight the nav link for the section on screen
  if ("IntersectionObserver" in window) {
    var navLinks = {}; nl.querySelectorAll('a[href^="#"]').forEach(function (a) { navLinks[a.getAttribute("href").slice(1)] = a; });
    var secIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = navLinks[e.target.id]; if (!a || a.classList.contains("nav-cta")) return; if (e.isIntersecting) { Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("here"); }); a.classList.add("here"); } });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(navLinks).forEach(function (id) { var s = document.getElementById(id); if (s) secIo.observe(s); });
  }

  // background video: respect reduced motion, offer pause
  var v = document.getElementById("bgvid"), vb = document.getElementById("vidToggle");
  if (reduce) { v.removeAttribute("autoplay"); v.pause(); vb.textContent = "▶"; vb.setAttribute("aria-label","Play video"); }
  else { var p = v.play(); if (p && p.catch) p.catch(function () { vb.textContent = "▶"; vb.setAttribute("aria-label","Play video"); }); }
  vb.addEventListener("click", function () {
    if (v.paused) { v.play(); vb.textContent = "❚❚"; vb.setAttribute("aria-label","Pause video"); } else { v.pause(); vb.textContent = "▶"; vb.setAttribute("aria-label","Play video"); }
  });

  // countdown to 26 Nov 2026, 10 PM Vancouver time (PST, UTC-8)
  var target = Date.UTC(2026, 10, 27, 6, 0, 0);
  function pad(x) { return String(x).padStart(2, "0"); }
  function tick() {
    var ms = Math.max(0, target - Date.now());
    var s = Math.floor(ms / 1000);
    document.getElementById("d").textContent = Math.floor(s / 86400);
    document.getElementById("h").textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById("m").textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById("s").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  // quiet starfield
  var cv = document.getElementById("stars"), ctx = cv.getContext("2d"), stars = [];
  function size() {
    var dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.round(innerWidth * innerHeight / 9000);
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6.28 });
  }
  function draw(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    stars.forEach(function (s) {
      var a = reduce ? 0.6 : 0.35 + 0.35 * Math.sin(t / 1400 + s.p);
      ctx.fillStyle = "rgba(238,240,250," + a + ")";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  size(); addEventListener("resize", size); requestAnimationFrame(draw);
})();
