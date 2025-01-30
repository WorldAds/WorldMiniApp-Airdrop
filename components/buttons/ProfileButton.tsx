'use client';

import Image from 'next/image';
import profileIcon from '../../public/icons/profile.png';

export default function ProfileButton() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src={profileIcon}
        alt="profileIcon"
        width={37}
        height={37}
      />
      <h1 className="text-[14px] bg-gradient-to-b from-[#9818FD] to-[#FD1288] bg-clip-text text-transparent">Profile</h1>
    </div>
  );
}