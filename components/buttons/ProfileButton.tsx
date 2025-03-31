'use client';

import Image from 'next/image';
import profileIcon from '../../public/icons/profile.png';
import { useRouter } from 'next/navigation';

export default function ProfileButton() {
  const router = useRouter();
  
  return (
    <div 
      className="flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
      onClick={() => router.push('/data-center')}
      role="button"
      aria-label="Profile"
    >
      <Image
        src={profileIcon}
        alt="Profile"
        width={32}
        height={32}
        className="mb-0.5"
      />
      <h1 className="text-[12px] font-medium bg-gradient-to-b from-[#9818FD] to-[#FD1288] bg-clip-text text-transparent">
        Profile
      </h1>
    </div>
  );
}
