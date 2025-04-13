"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface ImageRewardAnimationProps {
  amount: number;
  onComplete: () => void;
}

interface Particle {
  element: HTMLDivElement;
}

interface Sparkle {
  element: HTMLDivElement;
}

export default function ImageRewardAnimation({
  amount,
  onComplete,
}: ImageRewardAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ImageRewardAnimation mounted

    if (!containerRef.current || !particlesRef.current || !glowRef.current) {
      // Required refs not available
      return;
    }

    // Create gold dust particles
    const particleCount = 40;
    const particles: Particle[] = [];

    // Create gold dust particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");

      // Small gold dust particles
      particle.className = "absolute rounded-full opacity-80 z-10";

      // Small gold dust sizes
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Gold dust colors
      const colors = [
        "bg-yellow-300",
        "bg-amber-300",
        "bg-yellow-200",
        "bg-amber-200",
        "bg-yellow-400",
        "bg-amber-400",
      ];

      particle.classList.add(colors[Math.floor(Math.random() * colors.length)]);

      // Set initial position at center
      particle.style.left = "50%";
      particle.style.top = "50%";
      particle.style.transform = "translate(-50%, -50%)";

      particlesRef.current.appendChild(particle);
      particles.push({ element: particle });
    }

    // Create light sparkles
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement("div");
      sparkle.className =
        "absolute w-1 h-1 rounded-full bg-white shadow-[0_0_5px_2px_rgba(255,255,255,0.8)] z-30";
      sparkle.style.left = "50%";
      sparkle.style.top = "50%";
      sparkle.style.transform = "translate(-50%, -50%)";

      glowRef.current.appendChild(sparkle);
      sparkles.push({ element: sparkle });
    }

    // Create GSAP animations
    const ctx = gsap.context(() => {
      // Animate particles
      particles.forEach((particle) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const duration = 0.5 + Math.random() * 0.8; // Shortened duration

        gsap.to(particle.element, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          opacity: 0,
          duration: duration,
          ease: "power2.out",
        });
      });

      // Animate sparkles
      sparkles.forEach((sparkle) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 80;
        const duration = 0.4 + Math.random() * 0.6; // Shortened duration

        gsap.to(sparkle.element, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          opacity: 0,
          duration: duration,
          ease: "power2.out",
        });
      });

      // Animate glow
      gsap.fromTo(
        glowRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1.5,
          opacity: 0.8,
          duration: 0.6, // Shortened duration
          ease: "power2.out",
        }
      );

      // Fade out glow
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 2,
        duration: 1.2, // Shortened duration
        delay: 0.6, // Shortened delay
        ease: "power2.out",
      });

      // GSAP animation timeline
      const tl = gsap.timeline();

      // Gold dust burst animation
      tl.to(
        particles.map((p) => p.element),
        {
          duration: 0.8,
          x: () => gsap.utils.random(-150, 150),
          y: () => gsap.utils.random(-150, 150),
          opacity: 0.8,
          scale: () => gsap.utils.random(0.8, 1.5),
          ease: "power3.out",
          stagger: {
            amount: 0.3,
            from: "center",
          },
        }
      );

      // Fade out gold dust
      tl.to(
        particles.map((p) => p.element),
        {
          duration: 1.5,
          opacity: 0,
          delay: 1.5,
          stagger: {
            amount: 0.5,
            from: "random",
          },
          ease: "power2.in",
        }
      );

      // Sparkle animation
      tl.to(
        sparkles.map((s) => s.element),
        {
          duration: 0.1,
          opacity: 1,
          scale: 0,
          stagger: 0.05,
        },
        0.5
      );

      tl.to(
        sparkles.map((s) => s.element),
        {
          duration: 0.5,
          x: () => gsap.utils.random(-80, 80),
          y: () => gsap.utils.random(-80, 80),
          scale: () => gsap.utils.random(1, 2),
          opacity: () => gsap.utils.random(0.5, 1),
          ease: "power2.out",
          stagger: 0.02,
        },
        0.6
      );

      tl.to(
        sparkles.map((s) => s.element),
        {
          duration: 0.8,
          opacity: 0,
          delay: 1,
          stagger: 0.03,
        },
        1.2
      );

      // WADS text - positioned below the coin and appears after coin animation
      const wadsTl = gsap.timeline();

      wadsTl.to(
        ".wads-text",
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        },
        2.5
      );

      wadsTl.to(
        ".wads-text",
        {
          scale: 1,
          y: 0,
          duration: 0.5,
        },
        2.5
      );

      wadsTl.to(
        ".reward-text",
        {
          opacity: 1,
          duration: 0.3,
        },
        2.8
      );
    });

    // Set timeout to call onComplete after animation finishes
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000); // Shortened total duration to 3 seconds

    // Cleanup
    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [amount, onComplete]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div ref={particlesRef} className="absolute inset-0" />
      <div ref={glowRef} className="absolute inset-0" />

      {/* Realistic gold coin animation */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Coin shadow */}
            <motion.div
              className="absolute w-40 h-8 rounded-full bg-black/30 blur-md"
              style={{ x: "-50%", y: "calc(100% + 10px)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Realistic gold coin - Using CSS animation */}
            <div
              className="relative w-40 h-40 rounded-full animate-coin-spin"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front face of coin */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-lg overflow-hidden"
                style={{
                  backfaceVisibility: "visible",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Coin ridges */}
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={`ridge-front-${i}`}
                    className="absolute w-0.5 h-full bg-yellow-600/20 left-1/2 top-0 origin-bottom animate-ridge-rotate"
                    style={{
                      transform: `translateX(-50%) rotate(${i * 9}deg)`,
                    }}
                  />
                ))}

                {/* Inner circle */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-[6px] border-yellow-300/50 animate-inner-circle">
                  <div className="text-5xl font-bold text-yellow-100">W</div>
                </div>

                {/* Outer rim */}
                <div className="absolute inset-0 rounded-full border-[8px] border-yellow-400/70 animate-outer-rim" />

                {/* Light reflection */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/80 via-transparent to-transparent rounded-full animate-light-reflection" />
                </div>

                {/* Sparkle effects */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-[1px] animate-sparkle" />
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full blur-[1px] animate-sparkle" />
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-white rounded-full blur-[1px] animate-sparkle" />
              </div>
            </div>

            {/* WADS text */}
            <motion.div
              className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="text-2xl font-bold text-yellow-300 mb-1">
                + 5 WADS
              </div>
              <motion.div
                className="text-lg text-yellow-200 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.3 }}
              >
                Reward Earned
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Add to style file or inline style
const styles = `
@keyframes coinSpin {
  0% { transform: rotateY(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: rotateY(1080deg); opacity: 1; }
}

@keyframes ridgeRotate {
  0% { transform: translateX(-50%) rotate(0deg); }
  100% { transform: translateX(-50%) rotate(360deg); }
}

@keyframes innerCircle {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes outerRim {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes lightReflection {
  0% { transform: translate(100%, 100%); opacity: 0; }
  100% { transform: translate(-100%, -100%); opacity: 0.7; }
}

@keyframes sparkle {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.9; }
  100% { transform: scale(0); opacity: 0; }
}

.animate-coin-spin {
  animation: coinSpin 2s ease-out forwards;
}

.animate-ridge-rotate {
  animation: ridgeRotate 2s linear forwards;
}

.animate-inner-circle {
  animation: innerCircle 1s ease-out forwards;
}

.animate-outer-rim {
  animation: outerRim 1s ease-out forwards;
}

.animate-light-reflection {
  animation: lightReflection 2s linear forwards;
}

.animate-sparkle {
  animation: sparkle 1s ease-out 0.5s forwards;
}
`;

// Add style to document
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export type { ImageRewardAnimationProps };
