(() => {
  "use strict";
  const canvas = document.querySelector("#terrain");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const follower = document.querySelector(".cursor-follower");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  let width = 0,
    height = 0,
    frame = 0,
    time = 0,
    last = 0;
  const mouse = { x: -1000, y: -1000, active: false };
  const cursor = { x: 0, y: 0 };
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced.matches) draw();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const spacing = width < 700 ? 34 : 27;
    for (let row = -5; row < height / spacing + 6; row++) {
      ctx.beginPath();
      const base = row * spacing;
      for (let x = -20; x <= width + 20; x += 12) {
        const wave =
          Math.sin(x * 0.004 + row * 0.19 + time * 0.23) * 32 +
          Math.sin(x * 0.0018 - row * 0.12 - time * 0.16) * 55;
        const distance = Math.hypot(x - mouse.x, base + wave - mouse.y);
        const influence =
          mouse.active && !reduced.matches
            ? Math.exp((-distance * distance) / 55000)
            : 0;
        const y =
          base + wave + influence * Math.sin(x * 0.012 + row * 0.3 + time) * 30;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle =
        row % 5 === 0 ? "rgba(169,73,67,0.24)" : "rgba(157,150,145,0.085)";
      ctx.lineWidth = row % 5 === 0 ? 1 : 0.7;
      ctx.stroke();
    }
    if (mouse.active && !reduced.matches) {
      const glow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        240,
      );
      glow.addColorStop(0, "rgba(169,73,67,0.07)");
      glow.addColorStop(1, "rgba(169,73,67,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }
  }
  function tick(now) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    time += delta;
    const ease = 1 - Math.exp(-delta * 18);
    cursor.x += (mouse.x - cursor.x) * ease;
    cursor.y += (mouse.y - cursor.y) * ease;
    follower.style.transform = `translate3d(${cursor.x - follower.offsetWidth / 2}px, ${cursor.y - follower.offsetHeight / 2}px, 0)`;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (reduced.matches || !fine.matches) leave();
    draw();
    if (!document.hidden && !reduced.matches)
      frame = requestAnimationFrame(tick);
  }
  function leave() {
    mouse.active = false;
    follower.classList.remove("visible", "active");
  }
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch")
        return;
      if (!mouse.active) {
        cursor.x = event.clientX;
        cursor.y = event.clientY;
      }
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
      follower.classList.add("visible");
      follower.classList.toggle(
        "active",
        Boolean(event.target.closest("a, button")),
      );
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", leave);
  window.addEventListener("blur", leave);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  fine.addEventListener("change", sync);
  resize();
  sync();
})();
