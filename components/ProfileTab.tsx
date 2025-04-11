"use client";

import { useState, useRef } from "react";
import { User, useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Camera, Loader2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProfileTabProps {
  user: User | null;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const { updateAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div
        className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                      rounded-lg p-6 backdrop-blur-sm border border-white/10"
      >
        <div className="space-y-4 text-center">
          <p className="text-lg text-gray-400">
            Please connect your wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const success = await updateAvatar(file);
      if (!success) {
        setUploadError("Failed to update avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError("An error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                    rounded-lg p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="space-y-4 relative pb-16">
        <div className="flex justify-between items-center">
          <div>
            <label className="text-sm text-gray-400">Name</label>
            <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
              {user.nickname || "Not set"}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Wallet Address</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </p>
        </div>

        <Button
          className="absolute bottom-0 right-0 bg-gradient-to-r from-[#AC54F1] to-[#EB489A] text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          Edit
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E1B2E] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            {/* Avatar with upload button */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1E1B2E] flex items-center justify-center">
                  {user.avatarUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.avatarUrl}`}
                      alt="User Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#AC54F1] to-[#EB489A]">
                      {user.nickname
                        ? user.nickname.charAt(0).toUpperCase()
                        : "W"}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Upload error message */}
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}

            {/* Upload instruction */}
            <p className="text-gray-400 text-sm mt-2">Click to change avatar</p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-[#AC54F1]/50 hover:bg-[#AC54F1]/10 mr-2"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#AC54F1] to-[#EB489A] text-white"
              onClick={() => setIsDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
