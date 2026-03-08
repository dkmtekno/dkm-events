"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Fireflies() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (windowSize.width === 0) return null;

    const fireflies = Array.from({ length: 30 }).map((_, i) => {
        const startX = Math.random() * windowSize.width;
        const startY = Math.random() * windowSize.height;
        const moveX = (Math.random() - 0.5) * 400; // random movement range
        const moveY = (Math.random() - 0.5) * 400;
        const duration = 15 + Math.random() * 20; // 15 to 35 seconds
        const delay = Math.random() * 10;
        const size = 3 + Math.random() * 4; // 3px to 7px

        return (
            <motion.div
                key={i}
                className="absolute rounded-full bg-brand-accent"
                style={{
                    width: size,
                    height: size,
                    boxShadow: `0 0 ${size * 3}px ${size}px rgba(255, 170, 0, 0.4)`
                }}
                initial={{ x: startX, y: startY, opacity: 0 }}
                animate={{
                    x: startX + moveX,
                    y: startY + moveY,
                    opacity: [0, 0.8, 0.2, 0.9, 0], // pulsing effect
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: delay,
                    ease: "easeInOut"
                }}
            />
        );
    });

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {fireflies}
        </div>
    );
}
