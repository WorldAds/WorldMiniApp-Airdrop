'use client';

import Image from 'next/image';
import watchIcon from '../../public/icons/watch.png';
import { useRouter } from 'next/navigation';
export default function WatchButton() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center" onClick={() => router.push('/ads')}>
      <Image
        src={watchIcon}
        alt="watchIcon"
        width={37}
        height={37}
      />
      <h1 className="text-[14px] bg-gradient-to-b from-[#9818FD] to-[#FD1288] bg-clip-text text-transparent">Watch</h1>
    </div>
  );
}