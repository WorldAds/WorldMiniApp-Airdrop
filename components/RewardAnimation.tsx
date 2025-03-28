"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import confetti from "canvas-confetti"
import { CoinsIcon } from "lucide-react"

interface ParticleProps {
  id: number
  size: number
  color: string
}

interface RewardAnimationProps {
  amount: number
  onComplete: () => void
}

export default function RewardAnimation({ amount, onComplete }: RewardAnimationProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const coinRef = useRef<HTMLDivElement>(null)
  const amountRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  // Generate particles
  useEffect(() => {
    const colors = ["#FFD700", "#E6BE8A", "#FFC000", "#FFDF00"]
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles(newParticles)
  }, [])

  // Main animation sequence
  useEffect(() => {
    // Create a context for all animations
    const ctx = gsap.context(() => {
      // Coin animation
      if (coinRef.current) {
        gsap.fromTo(
          coinRef.current,
          { scale: 0, opacity: 0, y: 20 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "back.out(1.7)",
            delay: 0.5,
          },
        )

        // Floating animation
        gsap.to(coinRef.current, {
          y: "+=10",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }

      // Text animations
      if (amountRef.current && textRef.current) {
        gsap.fromTo(
          [amountRef.current, textRef.current],
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.8,
            ease: "power2.out",
          },
        )

        // Pulsing text effect
        gsap.to(amountRef.current, {
          scale: 1.05,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }, containerRef)

    // Trigger confetti
    if (confettiCanvasRef.current) {
      try {
        const myConfetti = confetti.create(confettiCanvasRef.current, {
          resize: true,
          useWorker: true,
        })

        // First burst
        myConfetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#E6BE8A", "#FFC000", "#FFDF00"],
        })

        // Second burst after a delay
        setTimeout(() => {
          myConfetti({
            particleCount: 50,
            angle: 60,
            spread: 80,
            origin: { x: 0 },
            colors: ["#FFD700", "#E6BE8A", "#FFC000", "#FFDF00"],
          })
        }, 250)
      } catch (error) {
        console.error("Confetti error:", error)
      }
    }

    // Set complete state after animation
    const timer = setTimeout(() => {
      setIsComplete(true)
    }, 2500)

    // Cleanup function
    return () => {
      ctx.revert() // This will kill all GSAP animations created in this context
      clearTimeout(timer)
    }
  }, [amount])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <canvas ref={confettiCanvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-10" />

      <div ref={containerRef} className="relative z-20 flex flex-col items-center justify-center">
        {/* Particles */}
        <div className="absolute w-full h-full pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: [0, 0.7, 0.5],
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        {/* Coin */}
        <div
          ref={coinRef}
          className="relative mb-8 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-500 flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 0 20px 2px rgba(255, 215, 0, 0.6)" }}
        >
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 flex items-center justify-center overflow-hidden">
              {/* Coin face */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CoinsIcon className="w-16 h-16 text-yellow-600" />
              </div>

              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 to-transparent opacity-70 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Coin edge */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-600 opacity-30" />
        </div>

        {/* Text content */}
        <div className="text-center relative z-10">
          <h2
            ref={amountRef}
            className="text-5xl font-bold mb-2 text-yellow-400"
            style={{ textShadow: "0 0 10px rgba(255, 215, 0, 0.6)" }}
          >
            +{amount} WADS
          </h2>
          <p ref={textRef} className="text-xl text-gray-300 mb-8">
            Reward Earned!
          </p>

          {isComplete && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 font-semibold px-8 py-6 text-lg rounded-full"
              >
                Collect Reward
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="fixed inset-0 bg-black/80 z-0" />
    </div>
  )
}
