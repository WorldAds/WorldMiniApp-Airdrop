"use client";

export default function UserAvatar() {
  return (
    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1">
      <div className="w-full h-full rounded-full bg-[#1E1B2E] flex items-center justify-center">
        <span className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#AC54F1] to-[#EB489A]">
          W
        </span>
      </div>
    </div>
  );
}