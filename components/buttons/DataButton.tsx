'use client';

import Image from 'next/image';
import dataIcon from '../../public/icons/data.png';
import { useRouter } from 'next/navigation';
export default function DataButton() {
  const router = useRouter();
  return (
      <div className="flex flex-col items-center justify-center" onClick={() => router.push('/data-center')}>
        <Image 
          src={dataIcon}
          alt="dataIcon"
          width={37}
          height={37}
        />
        <h1 className="text-[14px] bg-gradient-to-b from-[#9818FD] to-[#FD1288] bg-clip-text text-transparent">Data</h1>
      </div>
  );
}