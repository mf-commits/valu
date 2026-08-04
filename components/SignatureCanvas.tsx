"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type SignatureCanvasHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  toDataUrl: () => string;
};

type Props = {
  onChange?: (empty: boolean) => void;
  compact?: boolean;
  ariaLabel?: string;
};

// Canvas de signature tactile + souris, sans dépendance externe.
const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(
  function SignatureCanvas({ onChange, compact, ariaLabel }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const hasDrawn = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const ratio = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();
        const prevDrawing = canvas.toDataURL();
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#111827";
        }
        void prevDrawing;
      };

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    function getPos(e: React.MouseEvent | React.TouchEvent) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0] ?? e.changedTouches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      const mouseEvent = e as React.MouseEvent;
      return { x: mouseEvent.clientX - rect.left, y: mouseEvent.clientY - rect.top };
    }

    function start(e: React.MouseEvent | React.TouchEvent) {
      e.preventDefault();
      drawing.current = true;
      lastPoint.current = getPos(e);
    }

    function move(e: React.MouseEvent | React.TouchEvent) {
      if (!drawing.current) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !lastPoint.current) return;
      const point = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPoint.current = point;
      if (!hasDrawn.current) {
        hasDrawn.current = true;
        onChange?.(false);
      }
    }

    function end() {
      drawing.current = false;
      lastPoint.current = null;
    }

    useImperativeHandle(ref, () => ({
      clear() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn.current = false;
        onChange?.(true);
      },
      isEmpty() {
        return !hasDrawn.current;
      },
      toDataUrl() {
        return canvasRef.current?.toDataURL("image/png") ?? "";
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel || "Zone de signature"}
        role="img"
        className={`${
          compact ? "h-14" : "h-40"
        } w-full touch-none rounded-lg border-2 border-dashed border-slate-300 bg-white cursor-crosshair`}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
    );
  }
);

export default SignatureCanvas;
