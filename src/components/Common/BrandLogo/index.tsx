import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'full' | 'stacked';
  className?: string;
}

const BrandLogo = ({ variant = 'full', className = '' }: BrandLogoProps) => (
  <div
    className={`flex items-center justify-center ${
      variant === 'stacked' ? 'flex-col' : 'flex-row'
    } ${className}`}
  >
    <div
      className={`relative shrink-0 ${
        variant === 'stacked' ? 'h-28 w-28' : 'h-20 w-20'
      }`}
    >
      <Image
        src="/xmage_icon.png"
        alt=""
        fill
        sizes={variant === 'stacked' ? '112px' : '80px'}
        className="object-contain"
        priority
      />
    </div>
    <span
      className={`font-mono font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.55)] ${
        variant === 'stacked' ? 'mt-1 text-5xl' : '-ml-1 text-4xl'
      }`}
    >
      <span className="text-cyan-300">{'}{'}</span>ma
      <span className="text-purple-400">G</span>e
    </span>
  </div>
);

export default BrandLogo;
