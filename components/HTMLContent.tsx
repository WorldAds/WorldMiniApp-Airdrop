"use client";

import { useEffect, useRef, useState } from 'react';

interface HTMLContentProps {
  htmlUrl: string;
  onLoad?: () => void;
  fallbackContent?: React.ReactNode;
}

export default function HTMLContent({ htmlUrl, onLoad, fallbackContent }: HTMLContentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe loading
  useEffect(() => {
    const handleIframeLoad = () => {
      setLoading(false);
      if (onLoad) {
        onLoad();
      }
    };

    const handleIframeError = () => {
      setError("Failed to load HTML content");
      setLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
    }

    // Set a timeout to handle cases where the iframe might not load
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("HTML content loading timed out");
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      }
      clearTimeout(timeoutId);
    };
  }, [htmlUrl, onLoad, loading]);

  // If there's an error or loading fails, show fallback content
  if (error) {
    if (fallbackContent) {
      return <div className="w-full h-full">{fallbackContent}</div>;
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-500 font-bold">{error}</p>
          <p className="text-gray-700 mt-2">Failed to load HTML content</p>
        </div>
      </div>
    );
  }

  // Create a style to make the iframe non-interactive
  const nonInteractiveStyle: React.CSSProperties = {
    pointerEvents: 'none', // Disable all pointer events
    userSelect: 'none',    // Prevent text selection
    overflow: 'hidden',    // Prevent scrolling
  };

  // Render the actual webpage in a non-interactive iframe
  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-gray-700">Loading content...</p>
        </div>
      )}
      
      {/* Transparent overlay to prevent any interactions */}
      <div className="absolute inset-0 z-10" />
      
      {/* Actual iframe to display the HTML content */}
      <iframe 
        ref={iframeRef}
        src={htmlUrl}
        className="w-full h-full border-0 rounded-lg"
        style={nonInteractiveStyle}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        scrolling="no"
      />
    </div>
  );
}
