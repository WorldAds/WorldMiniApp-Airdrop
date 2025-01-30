import Image from 'next/image';

interface LazyImageProps {
  imageId: number;
}

export default function LazyImage({ imageId }: LazyImageProps) {
  return (
    <div className="w-full h-full relative">
      <Image
        src={`/images/${imageId}.webp`}
        alt={`Advertisement ${imageId}`}
        fill
        className="object-cover rounded-lg"
      />
    </div>
  );
}
