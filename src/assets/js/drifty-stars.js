/**
 * Drifty Stars background. Vanilla-JS port of indienodes_v2's
 * AmbientBackground.svelte, kept as close to the original as this being a
 * separate, framework-free repo allows.
 *
 * Deliberately dropped from the source: the audio-reactive drift boost and
 * the big-hit particle burst. Both exist there because that app has a
 * player; this page never does, so `driftBoost` would always return exactly
 * 1 and the burst would never fire — dead code kept only for symmetry is
 * not a good reason to carry the audioLevelStore dependency into a repo that
 * has no audio to react to.
 *
 * Everything else matches: four CSS-only gradient blobs on slow orbits (see
 * style.css), a 2D canvas of drifting, independently-breathing particles
 * capped at 30fps, fewer particles under 768px, one static frame instead of
 * animation for prefers-reduced-motion, and a pause on tab visibilitychange.
 */
(function () {
  const canvas = document.getElementById("drifty-stars-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const colorVars = [
    "--ambient-particle-1",
    "--ambient-particle-2",
    "--ambient-particle-3",
    "--ambient-particle-4",
    "--ambient-particle-5",
  ];
  const colors = colorVars.map((name) =>
    rootStyle.getPropertyValue(name).trim(),
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;
  const PARTICLE_COUNT_DESKTOP = 60;
  const PARTICLE_COUNT_MOBILE = 24;
  const MOBILE_BREAKPOINT = 768;

  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener("resize", resize);

  const count =
    width < MOBILE_BREAKPOINT ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    r: Math.random() * 3 + 1.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: reducedMotion ? Math.random() * 0.4 + 0.2 : 0,
    target: Math.random() * 0.55 + 0.45,
    speed: Math.random() * 0.009 + 0.003,
    fadingIn: true,
  }));

  function paint() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reducedMotion) {
    paint();
    return;
  }

  let raf = 0;
  let last = 0;
  let paused = false;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (now - last < FRAME_MS) return;
    last = now;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      if (p.fadingIn) {
        p.opacity = Math.min(p.opacity + p.speed, p.target);
        if (p.opacity >= p.target) {
          p.fadingIn = false;
          p.target = Math.random() * 0.65;
        }
      } else {
        p.opacity = Math.max(p.opacity - p.speed, 0);
        if (p.opacity <= 0) {
          p.fadingIn = true;
          p.target = Math.random() * 0.65 + 0.15;
        }
      }
    }

    paint();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!paused) {
        paused = true;
        cancelAnimationFrame(raf);
      }
    } else if (paused) {
      paused = false;
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  });

  raf = requestAnimationFrame(tick);
})();
