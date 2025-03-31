import { FC } from 'react';

interface RewardAnimationProps {
  amount: number;
  onComplete: () => void;
}

declare const RewardAnimation: FC<RewardAnimationProps>;

export default RewardAnimation;
export type { RewardAnimationProps };
