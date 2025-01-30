'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AdModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageNumber: number | null;
}

export default function AdModal({ isOpen, onOpenChange, imageNumber }: AdModalProps) {
  if (!imageNumber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0">
        <DialogTitle className="sr-only">
          Advertisement {imageNumber}
        </DialogTitle>
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={`/images/${imageNumber}.webp`}
            alt={`Advertisement ${imageNumber}`}
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}