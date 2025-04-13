import confetti from 'canvas-confetti';

export const triggerConfetti = (
  element?: Element | SVGSVGElement, 
  options?: {
    duration?: number;
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    zIndex?: number;
  }
) => {
  const duration = options?.duration || 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: options?.startVelocity || 30,
    spread: options?.spread || 360,
    ticks: 60,
    zIndex: options?.zIndex || 999,  // Set high z-index to ensure it's on top
  };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  // If an element is provided, use the element's position as the starting point
  if (element) {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    // Burst from the center of the element
    confetti({
      ...defaults,
      particleCount: options?.particleCount || 100,
      origin: { x, y },
    });
    
    return;
  }

  // If no element is provided, burst in the middle of the screen
  confetti({
    ...defaults,
    particleCount: options?.particleCount || 100,
    origin: { x: 0.5, y: 0.4 }, // Middle of the screen (y-axis slightly moved up for better visual centering)
  });
}
