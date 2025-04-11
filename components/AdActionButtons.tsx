import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { triggerConfetti } from "@/utils/confetti";
import CommentDrawer from "./comments/CommentDrawer";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  adId: string;
  completed?: boolean;
  onVideoStateChange?: (shouldPause: boolean) => void;
}
import profileIcon from "../public/icons/profile.png";
import { useRouter } from "next/navigation";

const AdActionButtons: React.FC<Props> = ({ 
  adId, 
  completed = false,
  onVideoStateChange = () => {} // Default no-op function
}) => {
  const { user } = useAuth();
  const [isFavourited, setIsFavourited] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const favouriteButtonRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const handleFavouriteClick = () => {
    if (!isFavourited) {

      triggerConfetti(undefined, {
        particleCount: 100,
        spread: 360,
        startVelocity: 25,
        duration: 1000,
        zIndex: 9999  
      });
    }
    
    setIsFavourited(!isFavourited);
  };

  return (
    <div className="absolute bottom-[6%] right-4 flex flex-col space-y-5 z-20 items-end">
      {/* About Advertiser Avatar */}
      <div className="w-[30px] h-[30px] rounded-full bg-white overflow-hidden">
        <Image
          src={profileIcon}
          alt="Advertiser Avatar"
          width={30}
          height={30}
        />
      </div>

      <svg
        ref={favouriteButtonRef}
        width="32"
        height="32"
        viewBox="0 0 43 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`cursor-pointer transition-opacity duration-200 ${isFavourited ? 'opacity-100' : 'opacity-30'}`}
        onClick={handleFavouriteClick}
        onMouseEnter={() => setActiveButton('favorite')}
        onMouseLeave={() => setActiveButton(null)}
      >
        <g transform="scale(1.79167)">
          <path
            d="M16.5 3.75c-1.74 0-3.41 1.01-4.5 2.25C10.91 4.76 9.24 3.75 7.5 3.75C4.42 3.75 2 6.17 2 9.25c0 4.16 6.25 8.25 10 11.25 3.75-3 10-7.09 10-11.25c0-3.08-2.42-5.5-5.5-5.5z"
            fill={isFavourited ? "red" : "white"}
          />
        </g>
      </svg>

      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="8586"
        width="30"
        height="30"
        className={`cursor-pointer transition-opacity duration-200 ${activeButton === 'comment' || isCommentDrawerOpen ? 'opacity-100' : 'opacity-30'}`}
        onMouseEnter={() => setActiveButton('comment')}
        onMouseLeave={() => setActiveButton(null)}
        onClick={() => setIsCommentDrawerOpen(true)}
      >
        <path
          d="M512 0C226.742857 0 0 197.485714 0 446.171429c0 138.971429 73.142857 270.628571 190.171429 351.085714L190.171429 1024l226.742857-138.971429c29.257143 7.314286 65.828571 7.314286 95.085714 7.314286 285.257143 0 512-197.485714 512-446.171429C1024 197.485714 797.257143 0 512 0zM256 512C219.428571 512 190.171429 482.742857 190.171429 446.171429S219.428571 380.342857 256 380.342857c36.571429 0 65.828571 29.257143 65.828571 65.828571S292.571429 512 256 512zM512 512C475.428571 512 446.171429 482.742857 446.171429 446.171429S475.428571 380.342857 512 380.342857c36.571429 0 65.828571 29.257143 65.828571 65.828571S548.571429 512 512 512zM768 512C731.428571 512 702.171429 482.742857 702.171429 446.171429s29.257143-65.828571 65.828571-65.828571c36.571429 0 65.828571 29.257143 65.828571 65.828571S804.571429 512 768 512z"
          p-id="8587"
          fill="#ffffff"
        ></path>
      </svg>

      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="10474"
        width="30"
        height="30"
        className={`cursor-pointer transition-opacity duration-200 ${activeButton === 'share' ? 'opacity-100' : 'opacity-30'}`}
        onMouseEnter={() => setActiveButton('share')}
        onMouseLeave={() => setActiveButton(null)}
      >
        <path
          d="M567.383372 836.902781C566.140687 847.684903 569.101201 858.869069 577.434502 867.129271 577.507601 867.20237 577.653799 867.23892 577.726898 867.348568 584.378919 874.219886 593.662508 878.605834 604.006035 878.605834 615.372949 878.605834 625.131683 873.08685 631.856803 864.936297L994.940173 466.838445C1002.652131 459.163036 1005.941591 448.965708 1005.429897 438.951127 1005.941591 428.899997 1002.652131 418.739219 994.940173 411.06381L629.846577 10.772984C615.372949-3.590995 591.908129-3.590995 577.434502 10.772984 569.101201 19.033186 566.140687 30.217352 567.383372 40.999474L567.383372 256.568803C264.241287 256.568803 18.518568 502.291522 18.518568 805.433607 18.518568 883.17453 34.892772 957.041199 64.059325 1024.03655 107.370558 795.419026 325.534906 621.772047 566.762029 621.772047 566.762029 634.271998 567.383372 836.902781 567.383372 836.902781ZM640.592149 549.294261 640.592149 745.821268 920.452161 438.951127 640.592149 132.044438 640.592149 329.74103C640.592149 329.74103 549.218238 328.790741 530.212465 329.375534 272.099443 337.379889 92.860381 631.311483 91.690795 768.810943 170.564754 667.568651 377.764233 548.672919 530.212465 548.672919 554.15243 548.672919 640.592149 549.294261 640.592149 549.294261Z"
          fill="#ffffff"
          p-id="10475"
        ></path>
      </svg>

      {/* User Avatar */}
      <div
        className="w-[30px] h-[30px] rounded-full bg-white overflow-hidden"
        onClick={() => {
          // Check if user is logged in before navigating to profile
          if (user) {
            router.push("/data-center?tab=profile");
          } else {
            // If not logged in, navigate to wallet auth page for manual login
            router.push("/wallet-auth");
          }
        }}
      >
        {user?.avatarUrl ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.avatarUrl}`}
            alt="User Avatar"
            width={30}
            height={30}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={profileIcon}
            alt="User Avatar"
            width={30}
            height={30}
          />
        )}
      </div>
      {/* Comment Drawer */}
      <CommentDrawer
        adId={adId}
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        onVideoStateChange={onVideoStateChange}
      />
    </div>
  );
};

export default AdActionButtons;
