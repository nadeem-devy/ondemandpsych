"use client";

import { useEffect, useRef, useCallback } from "react";

interface Neuron {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  phase: number;
  speed: number;
}

interface Synapse {
  from: number;
  to: number;
  fireOffset: number;
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const neuronsRef = useRef<Neuron[]>([]);
  const synapsesRef = useRef<Synapse[]>([]);
  const rafRef = useRef<number>(0);

  const initNeurons = useCallback((w: number, h: number) => {
    // Place neurons only around edges — avoid center content area (15%-85% x, 15%-85% y)
    const positions = [
      // Top edge
      [0.02, 0.04], [0.12, 0.02], [0.25, 0.06], [0.4, 0.03],
      [0.55, 0.05], [0.7, 0.02], [0.85, 0.04], [0.96, 0.06],
      // Left edge
      [0.02, 0.2], [0.04, 0.38], [0.03, 0.55], [0.02, 0.72], [0.05, 0.88],
      // Right edge
      [0.96, 0.18], [0.98, 0.35], [0.95, 0.52], [0.97, 0.7], [0.96, 0.85],
      // Bottom edge
      [0.05, 0.96], [0.18, 0.94], [0.35, 0.97], [0.5, 0.95],
      [0.65, 0.96], [0.8, 0.94], [0.92, 0.97],
      // Corner clusters
      [0.08, 0.1], [0.1, 0.16], [0.9, 0.08], [0.93, 0.14],
      [0.06, 0.85], [0.1, 0.92], [0.92, 0.88], [0.88, 0.92],
    ];

    neuronsRef.current = positions.map(([px, py]) => ({
      x: px * w,
      y: py * h,
      baseX: px * w,
      baseY: py * h,
      r: 2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.1 + Math.random() * 0.15,
    }));

    const synapses: Synapse[] = [];
    const neurons = neuronsRef.current;
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].baseX - neurons[j].baseX;
        const dy = neurons[i].baseY - neurons[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(w, h) * 0.25;
        if (dist < maxDist) {
          synapses.push({ from: i, to: j, fireOffset: Math.random() * Math.PI * 2 });
        }
      }
    }
    synapsesRef.current = synapses;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = parent.offsetWidth * dpr;
      canvas.height = parent.offsetHeight * dpr;
      canvas.style.width = parent.offsetWidth + "px";
      canvas.style.height = parent.offsetHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNeurons(parent.offsetWidth, parent.offsetHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);

    let time = 0;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.003; // Slow animation

      const neurons = neuronsRef.current;
      const synapses = synapsesRef.current;
      const mouse = mouseRef.current;
      const mouseRadius = 200;

      // Update neuron positions — slow gentle drift
      for (const n of neurons) {
        n.x = n.baseX + Math.sin(time * n.speed + n.phase) * 12;
        n.y = n.baseY + Math.cos(time * n.speed * 0.7 + n.phase) * 10;

        // Mouse attraction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 25;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force;
        }
      }

      // Draw synapses
      for (const s of synapses) {
        const a = neurons[s.from];
        const b = neurons[s.to];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(w, h) * 0.25;

        let opacity = 0.12 * (1 - dist / maxDist);

        // Slow pulse
        const pulse = Math.sin(time * 1.2 + s.fireOffset) * 0.5 + 0.5;
        opacity += pulse * 0.06;

        // Brighten near mouse
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const mouseDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
        if (mouseDist < mouseRadius) {
          opacity += (1 - mouseDist / mouseRadius) * 0.2;
        }

        if (opacity > 0.01) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(253, 176, 47, ${opacity})`;
          ctx.lineWidth = mouseDist < mouseRadius ? 1.2 : 0.8;
          ctx.stroke();
        }
      }

      // Draw neurons
      for (const n of neurons) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const mouseDist = Math.sqrt(dx * dx + dy * dy);

        let glowOpacity = 0.18;
        let radius = n.r;
        const pulse = Math.sin(time * 1 + n.phase) * 0.5 + 0.5;
        glowOpacity += pulse * 0.08;

        if (mouseDist < mouseRadius) {
          const proximity = 1 - mouseDist / mouseRadius;
          glowOpacity += proximity * 0.4;
          radius += proximity * 3;
        }

        // Outer glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 5);
        gradient.addColorStop(0, `rgba(253, 176, 47, ${glowOpacity * 0.6})`);
        gradient.addColorStop(0.4, `rgba(253, 176, 47, ${glowOpacity * 0.2})`);
        gradient.addColorStop(1, "rgba(253, 176, 47, 0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 176, 47, ${glowOpacity + 0.1})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [initNeurons]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      aria-hidden="true"
    />
  );
}
