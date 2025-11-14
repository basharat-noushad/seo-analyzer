/**
 * AdSlot Component
 *
 * Placeholder for Google AdSense ads with reserved space to prevent CLS.
 * In production, replace the placeholder content with actual AdSense code.
 */

interface AdSlotProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

const AD_DIMENSIONS = {
  top: { width: 'max-w-3xl', height: 'min-h-[90px]' },      // 728x90 leaderboard
  middle: { width: 'max-w-xs', height: 'min-h-[600px]' },   // 300x600 sidebar
  bottom: { width: 'max-w-3xl', height: 'min-h-[90px]' },   // 728x90 leaderboard
  sidebar: { width: 'max-w-xs', height: 'min-h-[600px]' },  // 300x600
};

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const dimensions = AD_DIMENSIONS[position];

  return (
    <div className={`ad-slot ${dimensions.width} ${dimensions.height} ${className}`}>
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="ad-label">Advertisement</div>
        <div className="text-sm mt-2">Ad Slot: {position}</div>
        <div className="text-xs mt-1 opacity-60">
          {position === 'top' || position === 'bottom' ? '728x90' : '300x600'}
        </div>
      </div>
    </div>
  );
}
