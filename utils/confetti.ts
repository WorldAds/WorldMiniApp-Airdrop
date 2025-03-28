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
    zIndex: options?.zIndex || 999,  // 设置高 z-index 确保在最上层
  };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  // 如果提供了元素，使用元素位置作为起点
  if (element) {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    // 从元素中心爆发
    confetti({
      ...defaults,
      particleCount: options?.particleCount || 100,
      origin: { x, y },
    });
    
    return;
  }

  // 如果没有提供元素，在屏幕中间爆开
  confetti({
    ...defaults,
    particleCount: options?.particleCount || 100,
    origin: { x: 0.5, y: 0.4 }, // 屏幕中间位置（y轴稍微上移一点，视觉上更居中）
  });
}
