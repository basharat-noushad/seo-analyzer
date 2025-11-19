/**
 * AdSlot Component
 *
 * Renders Google AdSense ad slots with reserved space to prevent CLS.
 * Shows placeholder in development, real ads in production.
 *
 * Usage:
 *   <AdSlot position="top" adSlot="1234567890" />
 *
 * Important:
 *   - Replace PUBLISHER_ID with your ca-pub-XXXXXXXXXXXX
 *   - Replace adSlot with your actual ad slot IDs
 *   - Reserved heights prevent Cumulative Layout Shift
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  /** Position/type of ad slot */
  position: 'top' | 'middle' | 'bottom' | 'sidebar';

  /** Your ad slot ID from AdSense (e.g., '1234567890') - Optional, uses placeholder if not provided */
  adSlot?: string;

  /** Ad format - 'auto' is recommended for responsive */
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

  /** Enable full-width responsive ads */
  fullWidthResponsive?: boolean;

  /** Optional custom className */
  className?: string;
}

// TODO: Replace with your actual AdSense publisher ID
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXX';

/**
 * Default placeholder ad slot IDs
 * Replace these with your actual ad slot IDs from AdSense
 */
const DEFAULT_AD_SLOTS = {
  top: '0000000001',
  middle: '0000000002',
  bottom: '0000000003',
  sidebar: '0000000004',
};

/**
 * Ad dimensions with reserved heights for CLS prevention
 * These min-heights ensure space is reserved before ads load
 */
const AD_DIMENSIONS = {
  top: {
    width: 'w-full max-w-[728px]',
    height: 'min-h-[90px]', // Leaderboard 728x90
    description: 'Leaderboard (728x90)',
  },
  middle: {
    width: 'w-full',
    height: 'min-h-[250px] md:min-h-[90px]', // Mobile banner / Leaderboard
    description: 'Mobile Banner / Leaderboard',
  },
  bottom: {
    width: 'w-full max-w-[728px]',
    height: 'min-h-[90px]', // Leaderboard 728x90
    description: 'Leaderboard (728x90)',
  },
  sidebar: {
    width: 'w-full max-w-[300px]',
    height: 'min-h-[600px]', // Wide Skyscraper 300x600
    description: 'Wide Skyscraper (300x600)',
  },
};

export function AdSlot({
  position,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasInitialized = useRef(false);
  const [isProduction, setIsProduction] = useState(false);

  // Use provided adSlot or default placeholder
  const effectiveAdSlot = adSlot || DEFAULT_AD_SLOTS[position];

  useEffect(() => {
    // Check if running in production
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  useEffect(() => {
    // Only initialize AdSense in production
    if (!isProduction) return;

    // Only initialize once per component instance
    if (hasInitialized.current) return;

    // Check if running in browser
    if (typeof window === 'undefined') return;

    try {
      // Initialize AdSense ad
      // The adsbygoogle array is created by the AdSense script
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});

      hasInitialized.current = true;

      console.log(`[AdSense] Initialized ad slot: ${position} (${effectiveAdSlot})`);
    } catch (error) {
      console.error('[AdSense] Error initializing ad:', error);
    }
  }, [isProduction, position, effectiveAdSlot]);

  const dimensions = AD_DIMENSIONS[position];

  // Development mode: Show placeholder
  if (!isProduction) {
    return (
      <div
        className={`${dimensions.width} ${dimensions.height} mx-auto my-8 ${className}`}
        data-ad-position={position}
      >
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
          <svg
            className="w-12 h-12 mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <div className="text-sm font-semibold">AdSense Placeholder</div>
          <div className="text-xs mt-1">Position: {position}</div>
          <div className="text-xs">Size: {dimensions.description}</div>
          <div className="text-xs opacity-60 mt-1">Slot: {effectiveAdSlot}</div>
          <div className="text-xs opacity-40 mt-2 italic">
            (Real ads in production)
          </div>
        </div>
      </div>
    );
  }

  // Production mode: Real AdSense
  return (
    <div
      className={`ad-slot-container ${dimensions.width} ${dimensions.height} mx-auto my-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden ${className}`}
      data-ad-position={position}
      data-ad-slot={effectiveAdSlot}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={effectiveAdSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
