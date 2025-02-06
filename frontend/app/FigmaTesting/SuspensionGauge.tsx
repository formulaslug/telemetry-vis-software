import { useEffect, useRef, useCallback } from "react";
import colors from "tailwindcss/colors";

interface SuspensionInfo {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
}

function SuspensionCanvas({ s1, s2, s3, s4 }: SuspensionInfo) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const drawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaleFactor = canvas.height;
    
    // // Background gradient
    // const gradient = context.createLinearGradient(
    //   0,
    //   canvas.height,
    //   0,
    //   canvas.height - scaleFactor
    // );
    // gradient.addColorStop(0.88, "rgba(89, 255, 0, 0.2)");
    // gradient.addColorStop(0, "rgba(255, 0, 0, 0.2)");

    // Draw background sections
    context.fillStyle = colors.neutral[800];
    for (let i = 0; i < 4; i++) {
      context.fillRect(
        (canvas.width / 4) * i,
        canvas.height,
        canvas.width / 4,
        -scaleFactor
      );
    }

    // // Foreground gradient
    // const frontGradient = context.createLinearGradient(
    //   0,
    //   canvas.height,
    //   0,
    //   canvas.height - scaleFactor
    // );
    // frontGradient.addColorStop(0.88, "rgba(89, 255, 0, 1)");
    // frontGradient.addColorStop(0, "rgba(255, 0, 0, 1)");

    // Draw foreground sections
    context.fillStyle = colors.neutral[700];
    const values = [s1, s2, s3, s4];
    values.forEach((value, i) => {
      context.fillRect(
        (canvas.width / 4) * i,
        canvas.height,
        canvas.width / 4,
        Math.abs(value) * -scaleFactor
      );
    });
  }, [s1, s2, s3, s4]);

  const handleResize = useCallback((canvas: HTMLCanvasElement) => {
    const parent = canvas.parentElement;
    if (!parent) return;

    // Use devicePixelRatio for better resolution on high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = parent.clientWidth;
    const displayHeight = parent.clientHeight;

    // Set the canvas size accounting for device pixel ratio
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Scale the canvas context to counter the pixel ratio scaling
    const context = canvas.getContext("2d");
    if (context) {
      context.scale(dpr, dpr);
    }

    // Set display size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    drawCanvas(canvas);
  }, [drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize ResizeObserver
    observerRef.current = new ResizeObserver(() => {
      handleResize(canvas);
    });

    observerRef.current.observe(canvas.parentElement || canvas);

    // Initial draw
    handleResize(canvas);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas(canvas);
  }, [s1, s2, s3, s4, drawCanvas]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function SuspensionGauge({ s1, s2, s3, s4 }: SuspensionInfo) {
  return (
    <div className="w-full h-full bg-neutral-900 rounded-[4%] overflow-hidden flex justify-center items-center">
      <div className="w-[90%] h-[90%] flex flex-row justify-center items-center">
        <div className="flex relative h-full w-[5%] flex-col left-[2.5%]">
          <div className="h-[95%] w-full flex flex-col justify-between text-[1.5vmin] items-end">
            {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((value) => (
              <p key={value}>{value}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center w-full h-full">
          <div className="w-[90%] h-[90%] rounded-[4%] overflow-hidden">
            <SuspensionCanvas s1={s1} s2={s2} s3={s3} s4={s4} />
          </div>
          <div className="w-[90%] h-[5%] flex flex-row justify-evenly">
            {[s1, s2, s3, s4].map((value, index) => (
              <p key={index} className="w-[25%] text-center text-[1.5vmin]">
                {value.toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}