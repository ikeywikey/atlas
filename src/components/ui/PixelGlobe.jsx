import { useRef, useEffect } from "react";

/**
 * PixelGlobe — a pixelated spinning globe drawn to a transparent <canvas>.
 * Seamless loop (one rotation per `rotationSeconds`), no dependencies.
 *
 * <PixelGlobe className="absolute inset-0 m-auto" size={520} accent="#4fe3c4" />
 *
 * The canvas background is transparent — only the globe disc paints, so it
 * sits cleanly on top of whatever is behind it.
 */

// coarse world map as horizontal land runs [row, c0, c1]
const MAPW = 64, MAPH = 32;
const RUNS = [
  [1,25,29],[1,46,54],[2,9,15],[2,24,30],[2,40,58],[3,7,18],[3,25,30],[3,33,60],
  [4,6,20],[4,26,30],[4,31,61],[5,7,21],[5,30,62],[6,8,21],[6,30,61],[7,9,21],[7,31,60],
  [8,10,21],[8,30,60],[9,11,20],[9,30,58],[10,12,20],[10,29,41],[10,42,57],
  [11,13,18],[11,29,40],[11,42,52],[11,53,57],[12,14,17],[12,28,40],[12,43,49],[12,52,57],
  [13,15,18],[13,28,41],[13,44,48],[13,52,56],[14,16,18],[14,29,42],[14,52,55],
  [15,18,21],[15,30,42],[15,52,56],[16,18,24],[16,31,41],[16,53,57],[17,18,25],[17,32,40],[17,54,58],
  [18,18,26],[18,33,39],[18,53,59],[19,19,26],[19,33,38],[19,52,60],[20,19,25],[20,34,38],[20,52,60],
  [21,20,24],[21,34,37],[21,53,59],[22,20,23],[22,35,36],[22,54,57],[23,21,23],[24,21,22],[25,21,22],
];
const LAND = (() => {
  const g = Array.from({ length: MAPH }, () => new Uint8Array(MAPW));
  for (const [r, c0, c1] of RUNS) for (let c = c0; c <= c1; c++) g[r][c] = 1;
  return g;
})();

function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export default function PixelGlobe({
  size = 520,             // overall square box in CSS px (globe + glow halo)
  accent = "#4fe3c4",     // land color
  ocean = "#16323b",      // sea color
  shade = "#0a0d12",      // dark/night side tint
  rotationSeconds = 16,   // seconds per full rotation
  fps = 12,               // stepped frame rate for the retro look
  detail = 54,            // sphere resolution (higher = finer pixels)
  glow = true,            // soft atmospheric halo
  className = "",
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = size * dpr;
    cv.height = size * dpr;
    ctx.scale(dpr, dpr);

    const R = detail;
    const TILT = 0.41;
    const displayD = size * 0.72;          // globe diameter; remainder is glow margin
    const cx = size / 2, cy = size / 2;
    const x0 = cx - displayD / 2, y0 = cy - displayD / 2;

    const [lr, lg, lb] = hexToRgb(accent);
    const [or_, og, ob] = hexToRgb(ocean);
    const [sr, sg, sb] = hexToRgb(shade);
    const [gr_, gg, gb] = hexToRgb(accent);

    // fixed view-space light
    let Lx = -0.55, Ly = 0.42, Lz = 0.72;
    const Ln = Math.hypot(Lx, Ly, Lz); Lx /= Ln; Ly /= Ln; Lz /= Ln;

    const D = 2 * R + 1;
    const off = document.createElement("canvas");
    off.width = D; off.height = D;
    const octx = off.getContext("2d");
    const img = octx.createImageData(D, D);
    const data = img.data;

    function frame(theta) {
      ctx.clearRect(0, 0, size, size);

      if (glow) {
        const g = ctx.createRadialGradient(cx, cy, displayD * 0.32, cx, cy, size * 0.5);
        g.addColorStop(0, `rgba(${gr_},${gg},${gb},0.22)`);
        g.addColorStop(0.5, `rgba(${gr_},${gg},${gb},0.06)`);
        g.addColorStop(1, `rgba(${gr_},${gg},${gb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }

      const ca = Math.cos(TILT), sa = Math.sin(TILT);
      for (let iy = 0; iy < D; iy++) {
        const ny = (iy - R) / R;
        for (let ix = 0; ix < D; ix++) {
          const nx = (ix - R) / R;
          const r2 = nx * nx + ny * ny;
          const o = (iy * D + ix) * 4;
          if (r2 > 1) { data[o + 3] = 0; continue; }
          const z = Math.sqrt(1 - r2);
          const Yv = -ny;
          const lamb = clamp(nx * Lx + Yv * Ly + z * Lz, 0, 1);
          const limb = 0.55 + 0.45 * z;

          const Xt = nx;
          const Yt = Yv * ca - z * sa;
          const Zt = Yv * sa + z * ca;
          const lat = Math.asin(clamp(Yt, -1, 1));
          let u = (Math.atan2(Xt, Zt) + theta + Math.PI) / (2 * Math.PI);
          u -= Math.floor(u);
          const col = Math.min(MAPW - 1, (u * MAPW) | 0);
          const row = Math.min(MAPH - 1, Math.max(0, ((Math.PI / 2 - lat) / Math.PI * MAPH) | 0));
          const isLand = LAND[row][col] === 1;

          let cr, cg, cb;
          if (isLand) {
            const f = (0.30 + 0.70 * lamb) * limb;
            const night = (1 - lamb) * 0.55;
            cr = lr * f * (1 - night) + sr * night;
            cg = lg * f * (1 - night) + sg * night;
            cb = lb * f * (1 - night) + sb * night;
          } else {
            const f = (0.22 + 0.45 * lamb) * limb;
            cr = or_ * f; cg = og * f; cb = ob * f;
          }
          data[o] = cr; data[o + 1] = cg; data[o + 2] = cb; data[o + 3] = 255;
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, x0, y0, displayD, displayD);
    }

    let raf;
    const start = performance.now();
    const loop = (now) => {
      const t = (now - start) / 1000;
      const ts = fps > 0 ? Math.floor(t * fps) / fps : t;
      const theta = (ts / rotationSeconds) * Math.PI * 2;
      frame(theta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size, accent, ocean, shade, rotationSeconds, fps, detail, glow]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: size, height: size, background: "transparent", ...style }}
    />
  );
}
