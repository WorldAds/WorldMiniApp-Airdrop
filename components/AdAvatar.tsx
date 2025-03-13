// UserAvatar.js
import Image from 'next/image';

const AdAvatar = () => {
  return (
    <div className="w-12">
      <div className="w-12">
      <Image 
          className="w-12 h-12 rounded-full"
          src="/icons/AdAvatar.png"
          alt="AdAvatar"
          width={48}
          height={48}
          layout="intrinsic" 
        />
      </div>
    </div>
  );
};

export default AdAvatar;
