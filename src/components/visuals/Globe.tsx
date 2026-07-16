import { useRef, useEffect } from "react";

export interface GlobeProps {
  /** Rendered width & height in CSS px. Default 34 (the rail icon). */
  size?: number;
  /** Spin rate in radians/second. Default 0.22. */
  speed?: number;
  /** Pixel-block size for the dither. Smaller = finer. Default 3. */
  cell?: number;
  /** Show the soft radial glow behind the sphere. Default false. */
  glow?: boolean;
  /** CSS color for the glow's inner stop. */
  glowColor?: string;
}

/**
 * Globe — the spinning dithered pixel globe from atlas (the small one in the
 * top-left nav rail). Canvas-based: an orthographic sphere with analytic
 * continents, ordered (Bayer) dithering, and a blue/cyan palette.
 *
 * Defaults match the top-left rail icon (34px, no glow). Bump `size`, lower
 * `speed`, and set `glow` for the big hero version.
 *
 *   <Globe />                                // rail icon
 *   <Globe size={184} speed={0.16} glow />   // hero
 */
export default function Globe({
  size = 34,
  speed = 0.22,
  cell = 3,
  glow = false,
  glowColor = "rgba(58,120,240,0.30)",
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef<number>(0.6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.47;
    const DEG = Math.PI / 180;

    // continents: [lonDeg(E+), latDeg(N+), radiusDeg]
    const blobs: [number, number, number][] = [
      // North America
      [-100, 45, 20], [-92, 40, 15], [-112, 44, 14], [-120, 38, 9],
      [-83, 33, 12], [-99, 24, 9], [-90, 30, 9], [-78, 40, 7],
      // Greenland
      [-43, 72, 11], [-32, 67, 8],
      // South America
      [-62, -8, 14], [-60, -20, 13], [-68, -34, 8], [-72, -43, 6], [-50, -4, 9],
      // Africa
      [18, 6, 16], [24, -6, 15], [20, 22, 15], [12, 12, 10], [30, -27, 9], [41, 9, 7],
      // Europe
      [10, 48, 10], [22, 52, 11], [42, 56, 12], [5, 44, 7], [28, 41, 6],
      // Asia
      [90, 50, 26], [100, 38, 20], [75, 32, 14], [80, 22, 11], [115, 42, 16],
      [60, 52, 18], [130, 50, 12], [105, 16, 8], [70, 60, 16],
      // Australia / islands
      [134, -25, 13], [145, -33, 7], [120, -2, 6], [110, -6, 6],
    ];

    function isLand(lon: number, lat: number): boolean {
      const lonD = lon / DEG;
      const latD = lat / DEG;
      const cosL = Math.cos(lat);
      for (let k = 0; k < blobs.length; k++) {
        const b = blobs[k];
        let dLon = lonD - b[0];
        while (dLon > 180) dLon -= 360;
        while (dLon < -180) dLon += 360;
        dLon *= cosL;
        const dLat = latD - b[1];
        if (dLon * dLon + dLat * dLat < b[2] * b[2]) return true;
      }
      return false;
    }

    const bayer: number[][] = [
      [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
    ].map((row) => row.map((v) => (v + 0.5) / 16));

    // light direction (upper-left, toward viewer)
    let lx = -0.45;
    let ly = -0.55;
    let lz = 0.7;
    const ll = Math.hypot(lx, ly, lz);
    lx /= ll;
    ly /= ll;
    lz /= ll;

    const OCEAN_DEEP = "#050d22";
    const OCEAN_DARK = "#0a1c46";
    const OCEAN_LIT = "#143a86";
    const LAND_SHADOW = "#0d3f86";
    const LAND_BASE = "#1f74cc";
    const LAND_LIT = "#46c8ff";
    const LAND_HOT = "#9af2ff";

    function render(rot: number): void {
      const c = ctx as CanvasRenderingContext2D;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      c.clearRect(0, 0, size, size);

      for (let py = 0; py < size; py += cell) {
        const rj = ((py / cell) | 0) % 4;
        for (let px = 0; px < size; px += cell) {
          const x = px + cell / 2;
          const y = py + cell / 2;
          const nx = (x - cx) / r;
          const ny = (y - cy) / r;
          const d2 = nx * nx + ny * ny;
          if (d2 > 1) continue;
          const nz = Math.sqrt(1 - d2);
          const sx = nx * cosR + nz * sinR;
          const sz = -nx * sinR + nz * cosR;
          const lon = Math.atan2(sx, sz);
          let sy = ny;
          if (sy < -1) sy = -1;
          else if (sy > 1) sy = 1;
          const lat = Math.asin(-sy);
          const land = isLand(lon, lat);

          let bright = nx * lx + ny * ly + nz * lz;
          if (bright < 0) bright = 0;
          bright *= Math.pow(nz, 0.4); // limb darkening

          const idx = bayer[rj][((px / cell) | 0) % 4];
          let col: string;
          if (land) {
            if (bright < 0.15) col = LAND_SHADOW;
            else if (bright > 0.72) col = idx < (bright - 0.72) / 0.28 ? LAND_HOT : LAND_LIT;
            else col = idx < bright / 0.72 ? LAND_LIT : LAND_BASE;
          } else {
            if (bright < 0.1) col = OCEAN_DEEP;
            else col = idx < bright ? OCEAN_LIT : OCEAN_DARK;
          }
          c.fillStyle = col;
          c.fillRect(px, py, cell, cell);
        }
      }
    }

    let raf = 0;
    let last = performance.now();
    function frame(now: number): void {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      rotRef.current += speed * dt;
      render(rotRef.current);
      raf = requestAnimationFrame(frame);
    }

    render(rotRef.current); // paint frame 0 immediately (robust if RAF is throttled)
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, speed, cell]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: "-16%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 50% 50%, ${glowColor}, rgba(58,120,240,0.05) 52%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          position: "relative",
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </div>
  );
}
