/* ---------- Tema düğmesi (açık / koyu) ---------- */
(function () {
  var root = document.documentElement;
  try { var saved = localStorage.getItem("tema"); if (saved) root.dataset.theme = saved; } catch (e) {}
  var btn = document.querySelector(".theme-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("tema", root.dataset.theme); } catch (e) {}
    window.dispatchEvent(new Event("temadegisti"));
  });
})();

/* ---------- Arka plan: yavaşça süzülen turuncu ve gri noktalar ----------
   Yakın noktalar ince çizgiyle bağlanır, fare yaklaşınca noktalar ona uzanır. */
(function () {
  var c = document.querySelector(".bg-field");
  if (!c || !c.getContext) return;
  var ctx = c.getContext("2d"), W, H, pts = [], col = {}, mouse = { x: -1e4, y: -1e4 };
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function colors() {
    var s = getComputedStyle(document.documentElement);
    col.a = s.getPropertyValue("--accent").trim();
    col.b = s.getPropertyValue("--muted").trim();
  }
  function size() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * r; c.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0);
    var n = Math.min(60, Math.round(W * H / 22000));
    while (pts.length < n) pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: Math.random() * 1.8 + 1, o: Math.random() < .35
    });
    pts.length = n;
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) line(p.x, p.y, q.x, q.y, col.b, (1 - d / 130) * .25);
      }
      var m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (m < 180) line(p.x, p.y, mouse.x, mouse.y, col.a, (1 - m / 180) * .5);
      ctx.globalAlpha = p.o ? .75 : .4;
      ctx.fillStyle = p.o ? col.a : col.b;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(draw);
  }
  function line(x1, y1, x2, y2, s, a) {
    ctx.globalAlpha = a; ctx.strokeStyle = s; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  addEventListener("resize", function () { size(); if (still) draw(); });
  addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", function () { mouse.x = mouse.y = -1e4; });
  addEventListener("temadegisti", colors);
  colors(); size(); draw();
})();
