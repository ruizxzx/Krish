'use client';

import { useEffect, useRef } from 'react';

export default function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    let frame = 0;
    let lastFrame = 0;
    let image: ImageData;

    const resize = () => {
      canvas.width = Math.max(1, Math.ceil(innerWidth * 0.8));
      canvas.height = Math.max(1, Math.ceil(innerHeight * 0.8));
      context.imageSmoothingEnabled = false;
      image = context.createImageData(canvas.width, canvas.height);
    };

    const draw = (time: number) => {
      if (time - lastFrame >= 90) {
        const pixels = image.data;
        for (let index = 0; index < pixels.length; index += 4) {
          const shade = Math.floor(Math.random() * 256);
          pixels[index] = shade;
          pixels[index + 1] = shade;
          pixels[index + 2] = shade;
          pixels[index + 3] = 255;
        }
        context.putImageData(image, 0, 0);
        lastFrame = time;
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="film-grain" aria-hidden="true" />;
}