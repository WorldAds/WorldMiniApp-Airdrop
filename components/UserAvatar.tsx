// UserAvatar.js
import Image from 'next/image';

const UserAvatar = () => {
  return (
    <div className='w-full h-full'>
      <div className='w-full h-full'>
      <Image 
          className="rounded-full"
          src="/icons/UserAvatar.png"
          alt="AdAvatar"
          width={100}
          height={100}
          layout="intrinsic" 
        />
      </div>
    </div>
  );
};

export default UserAvatar;
