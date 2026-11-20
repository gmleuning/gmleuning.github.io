/* Category pages: show one item at a time (chosen by #hash), and a lightbox for each item's images. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // ---- language: the 한국어 / English button (choice shared with the C.V.'s own switch) ----
  var isKo = function () { return root.classList.contains("ko"); };
  function setLang(ko) {
    root.classList.toggle("ko", ko);
    root.lang = ko ? "ko" : "en";
    var t = ko ? root.dataset.titleKo : root.dataset.titleEn;
    if (t) document.title = t;
    try { localStorage.setItem("cv-lang", ko ? "ko" : "en"); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-lang-toggle]")) setLang(!isKo());
  });

  // ---- one item at a time ----
  var items = [].slice.call(document.querySelectorAll(".item"));
  var links = [].slice.call(document.querySelectorAll(".list a[data-item]"));
  function show(id) {
    if (!items.length) return;
    var target = items.filter(function (a) { return a.id === id; })[0] || items[0];
    items.forEach(function (a) { a.classList.toggle("on", a === target); });
    links.forEach(function (l) { var on = l.dataset.item === target.id; l.classList.toggle("on", on); if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
  }
  function fromHash() { show(decodeURIComponent(location.hash.slice(1))); }
  if (items.length) {
    fromHash();
    addEventListener("hashchange", function () { fromHash(); if (innerWidth <= 760) { var on = document.querySelector(".item.on"); if (on) on.scrollIntoView({ block: "start" }); } else scrollTo(0, 0); });
  }

  // ---- lightbox ----
  var box, img, cap, count, list = [], idx = 0, last = null;
  function build() {
    box = document.createElement("div");
    box.className = "lb"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Images");
    box.innerHTML = '<button class="lb-x" type="button">close</button><button class="lb-p" type="button">prev</button>' +
      '<figure><img alt=""><figcaption><span class="lb-c"></span> <span class="lb-k"></span></figcaption></figure><button class="lb-n" type="button">next</button>';
    document.body.appendChild(box);
    img = box.querySelector("img"); cap = box.querySelector(".lb-c"); count = box.querySelector(".lb-k");
    box.querySelector(".lb-x").onclick = close;
    box.querySelector(".lb-p").onclick = function () { go(-1); };
    box.querySelector(".lb-n").onclick = function () { go(1); };
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    var x0 = null;
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
    });
  }
  function render() { img.src = list[idx]; count.textContent = list.length > 1 ? (idx + 1) + " / " + list.length : ""; }
  function go(d) { idx = (idx + d + list.length) % list.length; render(); }
  function open(l, i, title) {
    if (!box) build();
    var ko = isKo(), L = ko ? ["닫기", "이전", "다음", "이미지"] : ["close", "prev", "next", "Images"];
    box.querySelector(".lb-x").textContent = L[0]; box.querySelector(".lb-p").textContent = L[1]; box.querySelector(".lb-n").textContent = L[2];
    box.setAttribute("aria-label", L[3]);
    list = l; idx = i || 0; cap.textContent = title || ""; last = document.activeElement;
    box.querySelector(".lb-p").hidden = box.querySelector(".lb-n").hidden = list.length < 2;
    box.hidden = false; render(); box.querySelector(".lb-x").focus();
  }
  function close() { box.hidden = true; if (last) last.focus(); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-gallery]");
    if (!b) return;
    e.preventDefault();
    try { open(JSON.parse(b.dataset.gallery), +b.dataset.index || 0, (isKo() && b.dataset.titleKo) || b.dataset.title); } catch (err) {}
  });
})();
