"use client";

export default function ProfileTab() {
  return (
    <div className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                    rounded-lg p-6 backdrop-blur-sm border border-white/10 w-[95%]">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">World ID</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            WLD_123456
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            John Doe
          </p>
        </div>
      </div>
    </div>
  );
}