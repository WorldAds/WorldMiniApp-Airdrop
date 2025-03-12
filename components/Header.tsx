'use client';

import { ArrowLeft, Wallet } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 p-6 z-50">
      <div className="max-w-7xl mx-auto flex justify-center items-center text-center">        
        <h1 className="text-3xl md:text-xl font-semibold text-white">
          Ads Watching
        </h1>
      </div>
    </header>
  );
}