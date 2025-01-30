'use client';

import Image from 'next/image';
import { Card } from './ui/card';
import { Play } from 'lucide-react';

interface AdCardProps {
  imageNumber: number;
  onClick: (imageNumber: number) => void;
  isViewed: boolean;
  isVideo?: boolean;
}

export default function AdCard({ imageNumber, onClick, isViewed, isVideo }: AdCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-shadow relative w-full aspect-[4/3]"
      onClick={() => onClick(imageNumber)}
    >
      <div className="relative w-full h-full">
        <Image
          src={`/images/${imageNumber}.webp`}
          alt="Advertisement"
          fill
          className="object-cover rounded-lg"
        />
        {!isViewed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <p className="text-white text-sm md:text-base text-center">Watch this ads to get rewards</p>
          </div>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 p-2 rounded-full">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}