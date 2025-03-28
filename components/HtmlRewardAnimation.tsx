"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"

interface RewardAnimationProps {
  amount: number
  onComplete: () => void
}

// Define a type for the animation points
interface AnimationPoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  speedFactor: number;
}

export default function HtmlRewardAnimation({ amount, onComplete }: RewardAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowLayerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const gsapAnimationRef = useRef<gsap.Context | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Main animation effect
  useEffect(() => {
    // Important: Set initial opacity to 0 to prevent flicker
    if (containerRef.current) {
      containerRef.current.style.opacity = "0"
    }

    // Initialize animation only after a small delay to ensure DOM is ready
    animationTimeoutRef.current = setTimeout(() => {
      initializeAnimation()
    }, 50)

    return () => {
      // Clean up all animations and timers
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (gsapAnimationRef.current) {
        gsapAnimationRef.current.revert()
      }
    }
  }, [])

  // Initialize all animations
  const initializeAnimation = () => {
    if (!containerRef.current || !canvasRef.current || !glowLayerRef.current || !contentRef.current) return

    // First make container visible with GSAP to avoid flicker
    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => {
        // Start canvas animation
        initializeCanvasAnimation()

        // Start GSAP animations
        initializeGsapAnimations()
      },
    })
  }

  // Canvas animation
  const initializeCanvasAnimation = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create grid points
    const points: AnimationPoint[] = []
    const gridSize = 30
    const spacing = Math.max(canvas.width, canvas.height) / gridSize

    for (let x = 0; x < canvas.width + spacing; x += spacing) {
      for (let y = 0; y < canvas.height + spacing; y += spacing) {
        points.push({
          x,
          y,
          originX: x,
          originY: y,
          color: Math.random() > 0.8 ? "#FFD700" : "#3498db",
          size: Math.random() * 2 + 1,
          speedFactor: Math.random() * 0.5 + 0.5,
        })
      }
    }

    // Animation variables
    let animationTime = 0
    const center = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update time
      animationTime += 0.01

      // Draw points
      for (const point of points) {
        // Calculate distance from center
        const dx = point.originX - center.x
        const dy = point.originY - center.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Wave effect
        const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2
        const normalizedDistance = distance / maxDistance

        // Different animation phases
        let phase = 0
        if (animationTime < 1) {
          // Appearance phase - points move from outside to their positions
          phase = 1 - animationTime
          point.x = point.originX + dx * phase * 2
          point.y = point.originY + dy * phase * 2
        } else if (animationTime > 2) {
          // Disappearance phase - points scatter outward
          phase = (animationTime - 2) / 1
          if (phase > 1) phase = 1
          point.x = point.originX + dx * phase * 3
          point.y = point.originY + dy * phase * 3
        } else {
          // Normal animation phase - more dynamic movement
          const wave = Math.sin(animationTime * 2 + normalizedDistance * 5) * 8
          const uniqueOffset = Math.sin(animationTime * point.speedFactor + point.originX * 0.01) * wave

          // Create more dynamic, flowing motion
          point.x = point.originX + uniqueOffset
          point.y = point.originY + Math.cos(animationTime * point.speedFactor + point.originY * 0.01) * wave
        }

        // Draw point with glow effect
        ctx.save()

        // Outer glow
        const glow = point.size * 3
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glow)

        gradient.addColorStop(0, point.color)
        gradient.addColorStop(1, "transparent")

        ctx.beginPath()
        ctx.arc(point.x, point.y, glow, 0, Math.PI * 2)
        ctx.fillStyle = gradient

        // Fade out during disappearance
        if (animationTime > 2) {
          const alpha = 1 - (animationTime - 2) / 1
          ctx.globalAlpha = alpha > 0 ? alpha : 0
        } else {
          ctx.globalAlpha = animationTime < 1 ? animationTime * 0.3 : 0.3
        }

        ctx.fill()

        // Inner point
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fillStyle = point.color

        // Fade out during disappearance
        if (animationTime > 2) {
          const alpha = 1 - (animationTime - 2) / 1
          ctx.globalAlpha = alpha > 0 ? alpha : 0
        } else {
          ctx.globalAlpha = animationTime < 1 ? animationTime : 1
        }

        ctx.fill()
        ctx.restore()
      }

      // Handle animation completion
      if (animationTime > 3) {
        onComplete()
        return
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()
  }

  // GSAP animations
  const initializeGsapAnimations = () => {
    if (!containerRef.current || !glowLayerRef.current || !contentRef.current) return

    gsapAnimationRef.current = gsap.context(() => {
      const container = containerRef.current
      const glowLayer = glowLayerRef.current
      const content = contentRef.current

      if (!container || !glowLayer || !content) return

      // Create innovative glow effects
      const createGlowEffects = () => {
        // Create orbital glow rings
        for (let i = 0; i < 5; i++) {
          const ring = document.createElement("div")

          // Ring style
          ring.className = "absolute rounded-full border-2 opacity-0"

          // Size
          const size = 100 + i * 60
          ring.style.width = `${size}px`
          ring.style.height = `${size}px`

          // Position
          ring.style.left = "50%"
          ring.style.top = "50%"
          ring.style.transform = "translate(-50%, -50%)"

          // Color
          if (i % 2 === 0) {
            ring.style.borderColor = "rgba(255, 215, 0, 0.3)"
            ring.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.5)"
          } else {
            ring.style.borderColor = "rgba(52, 152, 219, 0.3)"
            ring.style.boxShadow = "0 0 20px rgba(52, 152, 219, 0.5)"
          }

          glowLayer.appendChild(ring)

          // Animate ring
          gsap.to(ring, {
            opacity: 0.7,
            duration: 0.5,
            delay: 0.2 + i * 0.1,
            ease: "power1.out",
          })

          // Orbital animation
          gsap.to(ring, {
            rotation: 360,
            duration: 15 + i * 5,
            repeat: -1,
            ease: "none",
          })

          // Pulse animation
          gsap.to(ring, {
            scale: 1.1,
            opacity: 0.4,
            duration: 2 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })

          // Exit animation
          gsap.to(ring, {
            opacity: 0,
            scale: 1.5,
            duration: 0.7,
            delay: 2,
            ease: "power2.in",
          })
        }

        // Create floating light orbs
        for (let i = 0; i < 15; i++) {
          const orb = document.createElement("div")

          // Orb style
          orb.className = "absolute rounded-full opacity-0"

          // Size
          const size = Math.random() * 10 + 5
          orb.style.width = `${size}px`
          orb.style.height = `${size}px`

          // Position - start from center
          orb.style.left = "50%"
          orb.style.top = "50%"
          orb.style.transform = "translate(-50%, -50%)"

          // Color and glow
          const isGold = Math.random() > 0.5
          if (isGold) {
            orb.style.backgroundColor = "#FFD700"
            orb.style.boxShadow = "0 0 15px 5px rgba(255, 215, 0, 0.7)"
          } else {
            orb.style.backgroundColor = "#3498db"
            orb.style.boxShadow = "0 0 15px 5px rgba(52, 152, 219, 0.7)"
          }

          glowLayer.appendChild(orb)

          // Animate orb
          gsap.to(orb, {
            opacity: 0.8,
            duration: 0.5,
            delay: 0.5 + Math.random() * 0.5,
            ease: "power1.out",
          })

          // Floating animation - unique path for each orb
          const radius = 100 + Math.random() * 150
          const speed = 5 + Math.random() * 10
          const startAngle = Math.random() * 360

          gsap.to(orb, {
            motionPath: {
              path: `M0,0 C${Math.cos(startAngle) * radius},${Math.sin(startAngle) * radius} ${Math.cos(startAngle + 2) * radius},${Math.sin(startAngle + 2) * radius} 0,0`,
              autoRotate: false,
            },
            duration: speed,
            repeat: -1,
            ease: "none",
          })

          // Exit animation
          gsap.to(orb, {
            opacity: 0,
            scale: 2,
            duration: 0.7,
            delay: 2,
            ease: "power2.in",
          })
        }
      }

      // Create token animation with enhanced glow
      const animateToken = () => {
        const token = content.querySelector(".token-container")
        const tokenValue = content.querySelector(".token-value")
        const tokenLabel = content.querySelector(".token-label")

        if (!token || !tokenValue || !tokenLabel) return

        // Initial state
        gsap.set([token, tokenValue, tokenLabel], { opacity: 0 })
        gsap.set(token, { scale: 0.5 })
        gsap.set(tokenValue, { y: 20 })
        gsap.set(tokenLabel, { y: -20 })

        // Token container animation
        gsap.to(token, {
          scale: 1,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: "elastic.out(1, 0.5)",
        })

        // Token value animation
        gsap.to(tokenValue, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.5,
          ease: "back.out(1.7)",
        })

        // Token label animation
        gsap.to(tokenLabel, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.6,
          ease: "back.out(1.7)",
        })

        // Pulse animation
        gsap.to(token, {
          scale: 1.05,
          duration: 1,
          repeat: 3,
          yoyo: true,
          delay: 1.5,
          ease: "sine.inOut",
        })

        // Exit animation
        gsap.to(token, {
          scale: 1.5,
          opacity: 0,
          duration: 0.7,
          delay: 2,
          ease: "back.in(1.7)",
        })
      }

      // Animate text elements with staggered reveal
      const animateText = () => {
        const title = content.querySelector(".reward-title")
        const description = content.querySelector(".reward-description")

        if (!title || !description) return

        // Initial state
        gsap.set([title, description], { opacity: 0, y: 30 })

        // Title animation
        gsap.to(title, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.8,
          ease: "back.out(1.7)",
        })

        // Description animation
        gsap.to(description, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 1,
          ease: "back.out(1.7)",
        })

        // Exit animation
        gsap.to([title, description], {
          y: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 2,
          ease: "power2.in",
        })
      }

      // Run animations
      createGlowEffects()
      animateToken()
      animateText()
    })
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-black/80"
      style={{ opacity: 0 }} // Important: Start with opacity 0 to prevent flicker
    >
      {/* Innovative canvas background with glow */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Glow effects layer */}
      <div ref={glowLayerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

      {/* Content container */}
      <div ref={contentRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex flex-col items-center">
          {/* Token display with enhanced glow */}
          <div className="token-container relative mb-8 w-40 h-40 flex items-center justify-center">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-xl border border-white/10" />

            {/* Inner glow */}
            <div
              className="absolute inset-4 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#3498db]/20"
              style={{ boxShadow: "0 0 30px 5px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.3)" }}
            />

            {/* Token value with glow */}
            <div className="relative flex flex-col items-center justify-center z-10">
              <span
                className="token-value text-6xl font-bold text-white"
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.8)" }}
              >
                {amount}
              </span>
              <span
                className="token-label text-lg font-medium text-[#FFD700]"
                style={{ textShadow: "0 0 10px rgba(255, 215, 0, 0.8)" }}
              >
                WADS
              </span>
            </div>

            {/* Animated rings with glow */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#FFD700]/50"
              style={{ boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)" }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#3498db]/50"
              style={{ boxShadow: "0 0 15px rgba(52, 152, 219, 0.5)" }}
              animate={{
                scale: [1.2, 1.7, 1.2],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: 1,
              }}
            />
          </div>

          {/* Text content with glow */}
          <h2
            className="reward-title text-4xl font-bold text-white mb-3"
            style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
          >
            Reward Earned
          </h2>

          <p
            className="reward-description text-xl text-white/90 text-center max-w-xs"
            style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}
          >
            Your premium tokens have been added to your wallet
          </p>
        </div>
      </div>
    </div>
  )
}




