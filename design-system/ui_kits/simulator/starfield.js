// Lightweight starfield for the simulator backdrop. Plain canvas, no deps.
// Draws a parallax star field with a faint center reticle + horizon glow.
// Cruise = slow drift; flight = streaking. Call MSNStarfield.mount(canvas).
(function () {
  function mount(canvas, getState) {
    const ctx = canvas.getContext('2d');
    let raf, w, h, stars = [];
    const N = 320;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      stars = Array.from({ length: N }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 0.9 + 0.1,
        c: pick(),
      }));
    }
    function pick() {
      const r = Math.random();
      if (r > 0.92) return '#8aa4ff';
      if (r > 0.84) return '#ffe88a';
      if (r > 0.78) return '#ffaa44';
      return '#cfe7e6';
    }

    function frame() {
      const st = (getState && getState()) || {};
      const beta = st.beta || 0.05;
      const paused = st.paused;
      const flight = st.mode === 'flight';
      ctx.clearRect(0, 0, w, h);
      // void wash + faint horizon glow
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      g.addColorStop(0, flight ? 'rgba(70,224,210,0.05)' : 'rgba(18,40,60,0.18)');
      g.addColorStop(1, 'rgba(3,5,10,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      const speed = paused ? 0 : beta * (flight ? 0.05 : 0.006);
      for (const s of stars) {
        // perspective from center
        const px = cx + (s.x / s.z) * cx;
        const py = cy + (s.y / s.z) * cy;
        const r = (1.4 - s.z) * 1.6 + 0.3;
        // streak length grows with speed + proximity
        const len = speed * 1400 * (1.2 - s.z);
        const ang = Math.atan2(py - cy, px - cx);
        const ex = px - Math.cos(ang) * len;
        const ey = py - Math.sin(ang) * len;
        ctx.globalAlpha = Math.min(1, (1.1 - s.z));
        if (len > 1.5) {
          ctx.strokeStyle = s.c; ctx.lineWidth = r;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
        } else {
          ctx.fillStyle = s.c;
          ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
        }
        // advance toward viewer
        if (!paused) {
          s.z -= speed;
          if (s.z <= 0.08) { s.z = 1.0; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; }
        }
      }
      ctx.globalAlpha = 1;
      // center reticle
      ctx.strokeStyle = 'rgba(70,224,210,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 3, cy);
      ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy - 3);
      ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + 10);
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    }

    resize(); seed();
    window.addEventListener('resize', resize);
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }
  window.MSNStarfield = { mount };
})();
