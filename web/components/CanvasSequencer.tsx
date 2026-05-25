"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 193;
const FRAME_PATH = (n: number) =>
  `/frames/ezgif-frame-${String(n).padStart(3, "0")}.jpg`;

function preloadFrames(onProgress: (n: number) => void): Promise<HTMLImageElement[]> {
  const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);
  let loaded = 0;
  return new Promise((resolve) => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i + 1);
      img.onload = img.onerror = () => {
        loaded++;
        onProgress(loaded);
        if (loaded === TOTAL_FRAMES) resolve(imgs);
      };
      imgs[i] = img;
    }
  });
}

export default function CanvasSequencer() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const framesRef    = useRef<HTMLImageElement[]>([]);
  const frameIdxRef  = useRef(0);
  const rafRef       = useRef(0);
  const [progress, setProgress] = useState(0);
  const ready = progress === TOTAL_FRAMES;

  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    const img    = framesRef.current[idx];
    if (!canvas || !img?.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || cw, ih = img.naturalHeight || ch;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(frameIdxRef.current);
    };
    resize();
    window.addEventListener("resize", resize);

    let targetIdx = 0, ticking = false;
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const frac = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      targetIdx = Math.round(frac * (TOTAL_FRAMES - 1));
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          if (targetIdx !== frameIdxRef.current) {
            frameIdxRef.current = targetIdx;
            drawFrame(targetIdx);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    preloadFrames((n) => setProgress(n)).then((imgs) => {
      framesRef.current = imgs;
      drawFrame(0);
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pct = Math.round((progress / TOTAL_FRAMES) * 100);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 -z-20" style={{ willChange: "transform" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>

      {/* Stronger overlay — image shows but text always readable */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: [
            /* heavy top band for hero text */
            "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.50) 35%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.65) 100%)",
          ].join(", "),
        }}
      />

      {/* Loading screen */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <p className="mb-6 text-stone-400 tracking-[0.3em] text-xs uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Loading
        </p>
        <div className="w-40 h-px bg-stone-800 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-stone-300 transition-all duration-150" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-4 text-stone-600 text-xs tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {pct}%
        </p>
      </div>
    </>
  );
}