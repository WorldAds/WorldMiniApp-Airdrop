import { FC } from 'react';

interface VideoRewardAnimationProps {
  amount: number;
  onComplete: () => void;
}

declare const VideoRewardAnimation: FC<VideoRewardAnimationProps>;

export default VideoRewardAnimation;
export type { VideoRewardAnimationProps };
