import { useEffect, useRef, useState } from "react";
import { Text } from "./text";

import minecraftClockSpriteSheet from "@/assets/minecraft-clock.png";

 function getClockIndex(now: Date) {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const normalizedMinutes = (totalMinutes + 720) % 1440; // Add 720 to shift start to 12:00, mod 1440 for 24h cycle
    return Math.floor(normalizedMinutes / 1440 * 64);
}

 async function renderMinecraftClock(index: number): Promise<HTMLCanvasElement> {
    const img = new Image();
    img.src = minecraftClockSpriteSheet;
    
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
    });


    const left = index % 8 * 16;
    const top = Math.floor(index / 8) * 16;

    // Create canvas for the sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Disable image smoothing for nearest-neighbor scaling
    ctx.imageSmoothingEnabled = false;

    // Extract and scale the sprite
    ctx.drawImage(
        img,
        left, top, 16, 16,  // Source rectangle
        0, 0, 32, 32        // Destination rectangle (scaled up)
    );

    return canvas;
}

export default function MinecraftClock({onPng, disabled}: {onPng: (png: string) => void, disabled: boolean}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [index, setIndex] = useState(0);

    function renderClock() {
        renderMinecraftClock(index).then((renderedCanvas) => {
            if(!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            if(!ctx) return;
            canvasRef.current.width = renderedCanvas.width;
            canvasRef.current.height = renderedCanvas.height;
            ctx.drawImage(renderedCanvas, 0, 0);

            const png = canvasRef.current.toDataURL("image/png");
            onPng(png);
        })
    }

    useEffect(() => {
        if(disabled) return;
        renderClock();
    }, [index, disabled])


    useEffect(() => {
        const interval = setInterval(() => {
            const newIndex = getClockIndex(new Date());
            if(newIndex !== index) {
                setIndex(newIndex);
            }
            // setIndex(index => {
            //     index++
            //     if(index >= 64) index = 0;
            //     return index;
            // });
            

        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])


    return <section>
  
        <Text variant="h4">Minecraft Clock</Text>
        <Text variant="muted">Index: {index}</Text>
        <canvas ref={canvasRef} />
    </section>
}