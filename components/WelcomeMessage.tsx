'use client';

export default function WelcomeMessage() {
  return (
    <div className="flex justify-center items-center text-white text-left space-y-2 p-4 rounded-lg w-[100%] max-h-40 overflow-y-auto hide-scrollbar ">
      <div className="w-[80%]">
        <p className="text-lg text-center">Welcome to WorldAds!</p>
        <p>You can watch these ads and get rewards based on its rank and popularity.</p>
        <p>We hope you'll discover more amazing products we have to offer.</p>
        <p>Thank you for being part of our journey!</p>
      </div>
    </div>
  );
}
