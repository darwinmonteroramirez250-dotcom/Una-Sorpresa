  const canvas = document.getElementById("heartCanvas");
    const ctx = canvas.getContext("2d");
    const intro = document.getElementById("intro");
    const surprise = document.getElementById("surprise");
    const message = document.getElementById("message");
    const button = document.getElementById("surpriseBtn");

    const PARTICLE_COUNT = 650;
    let particles = [];
    let animationId = null;
    let startTime = 0;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function heartPoint(t, scale) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

      // Canvas Y grows downward, so invert the heart vertically.
      return {
        x: x * scale,
        y: -y * scale
      };
    }

    function randomStar(x, y, size, alpha = 1) {
      return { x, y, size, alpha };
    }

    function createParticles() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scale = Math.min(width, height) / 27.5;

      particles = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = (Math.PI * 2 * i) / PARTICLE_COUNT;
        const target = heartPoint(t, scale);

        // Small random variation gives the heart its scattered/starry look.
        const tx = width / 2 + target.x + (Math.random() - 0.5) * 28;
        const ty = height / 2 + target.y + (Math.random() - 0.5) * 28;

        const sx = Math.random() * width;
        const sy = Math.random() * height;

        particles.push({
          sx,
          sy,
          tx,
          ty,
          x: sx,
          y: sy,
          size: 1.4 + Math.random() * 3.2,
          rotation: Math.random() * Math.PI,
          twinkle: Math.random() * Math.PI * 2,
          drift: 0.8 + Math.random() * 1.8
        });
      }

      // Add a few extra particles to make the heart look denser.
      for (let i = 0; i < 130; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = 0.80 + Math.random() * 0.28;
        const target = heartPoint(t, scale * r);

        const tx = width / 2 + target.x + (Math.random() - 0.5) * 35;
        const ty = height / 2 + target.y + (Math.random() - 0.5) * 35;

        particles.push({
          sx: Math.random() * width,
          sy: Math.random() * height,
          tx,
          ty,
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.1 + Math.random() * 2.8,
          rotation: Math.random() * Math.PI,
          twinkle: Math.random() * Math.PI * 2,
          drift: 0.6 + Math.random() * 1.6
        });
      }
    }

    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function drawStar(p, alpha) {
      const twinkle = 0.65 + 0.35 * Math.sin(p.twinkle);
      const a = alpha * twinkle;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(181,108,255,${Math.min(0.95, a)})`;
      ctx.strokeStyle = `rgba(215,173,255,${Math.min(1, a)})`;
      ctx.lineWidth = Math.max(0.7, p.size * 0.35);
      ctx.lineCap = "round";

      const len = p.size * 1.7;

      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.moveTo(0, -len);
      ctx.lineTo(0, len);
      ctx.stroke();

      ctx.restore();
    }

    function drawBackground() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Very subtle ambient glow behind the heart.
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, 20,
        w / 2, h / 2, Math.min(w, h) * 0.42
      );
      gradient.addColorStop(0, "rgba(150, 78, 255, 0.10)");
      gradient.addColorStop(0.45, "rgba(90, 35, 170, 0.04)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 2600, 1);
      const eased = easeInOutSine(progress);

      drawBackground();

      for (const p of particles) {
        p.x = p.sx + (p.tx - p.sx) * eased;
        p.y = p.sy + (p.ty - p.sy) * eased;

        if (progress >= 1) {
          p.x += Math.sin(now * 0.0012 * p.drift + p.twinkle) * 0.45;
          p.y += Math.cos(now * 0.0010 * p.drift + p.twinkle) * 0.45;
        }

        drawStar(p, progress >= 1 ? 0.95 : 0.25 + progress * 0.75);
        p.twinkle += 0.018;
      }

      if (progress >= 1 && !message.classList.contains("show")) {
        message.classList.add("show");
      }

      animationId = requestAnimationFrame(animate);
    }

    function startSurprise() {
      intro.classList.add("hidden");
      surprise.classList.add("show");
      surprise.setAttribute("aria-hidden", "false");
      message.classList.remove("show");

      createParticles();

      startTime = performance.now();
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (surprise.classList.contains("show")) {
        createParticles();
      }
    });

    button.addEventListener("click", startSurprise);

    resizeCanvas();