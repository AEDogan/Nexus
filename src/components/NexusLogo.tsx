import React from 'react';

export type NexusLogoStyle = 
  | 'hyper-x'
  | 'neon-vortex'
  | 'cyber-shield'
  | 'infinity-loop'
  | 'falcon-wings'
  | 'rocket-spark'
  | 'hex-reactor'
  | 'power-bolt'
  | 'cyber-saturn'
  | 'apex-trident';

export interface NexusLogoInfo {
  id: NexusLogoStyle;
  name: string;
  desc: string;
}

export const NEXUS_LOGOS: NexusLogoInfo[] = [
  { id: 'hyper-x', name: "Hyper-X", desc: "Kalın fütüristik çift açılı neon 'X' amblemi ve elmas çekirdek" },
  { id: 'neon-vortex', name: "Neon Vortex", desc: "Dinamik 4 bıçaklı fırıldak çarkı ve merkez enerji nodu" },
  { id: 'cyber-shield', name: "Siber Kalkan", desc: "Köşeli zırh amblemi, V-çentiği ve camgöbeği lazer çekirdeği" },
  { id: 'infinity-loop', name: "Sonsuzluk", desc: "Kalın 3D degrade sonsuzluk döngüsü ve merkez odak" },
  { id: 'falcon-wings', name: "Siber Kanatlar", desc: "İki yana açılan aerodinamik çift katmanlı hız kanatları" },
  { id: 'rocket-spark', name: "Roket Kıvılcımı", desc: "45° açılı fırlatıcı roketi ve parlayan alev kuyruğu" },
  { id: 'hex-reactor', name: "Altıgen Reaktör", desc: "Ağır siber altıgen plaka ve üçlü enerji bıçakları" },
  { id: 'power-bolt', name: "Siber Şimşek", desc: "Çift açılı kalın yıldırım oku ve parıltılı enerji çizgisi" },
  { id: 'cyber-saturn', name: "Siber Gezegen", desc: "3D derinlikli küre ve onu çevreleyen kalın neon halka" },
  { id: 'apex-trident', name: "Zirve Mızrağı", desc: "Üçlü simetrik sivri delta dişleri ve neon taban kalkanı" },
];

interface NexusLogoProps {
  styleId?: NexusLogoStyle;
  size?: number;
  className?: string;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({
  styleId = 'hyper-x',
  size = 22,
  className = ''
}) => {
  switch (styleId) {
    case 'hyper-x':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="hxGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="hxGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <polygon points="20,18 40,18 80,82 60,82" fill="url(#hxGrad1)" />
          <polygon points="80,18 60,18 20,82 40,82" fill="url(#hxGrad2)" />
          <polygon points="50,36 64,50 50,64 36,50" fill="#ffffff" filter="drop-shadow(0 0 6px #00f2fe)" />
        </svg>
      );

    case 'neon-vortex':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="vxG1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="vxG2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path d="M50 50 L50 14 C68 14 84 28 84 48 L50 50 Z" fill="url(#vxG1)" />
          <path d="M50 50 L86 50 C86 68 72 84 52 84 L50 50 Z" fill="url(#vxG2)" />
          <path d="M50 50 L50 86 C32 86 16 72 16 52 L50 50 Z" fill="url(#vxG1)" />
          <path d="M50 50 L14 50 C14 32 28 16 48 16 L50 50 Z" fill="url(#vxG2)" />
          <circle cx="50" cy="50" r="10" fill="#ffffff" filter="drop-shadow(0 0 6px #38bdf8)" />
        </svg>
      );

    case 'cyber-shield':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="csG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <polygon points="50,12 86,26 76,70 50,88 24,70 14,26" fill="url(#csG)" />
          <polygon points="50,26 72,36 50,74 28,36" fill="#090e17" />
          <polygon points="50,36 62,44 50,64 38,44" fill="#38bdf8" />
          <circle cx="50" cy="46" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        </svg>
      );

    case 'infinity-loop':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="infG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path 
            d="M32 30 C16 30 12 44 12 50 C12 56 16 70 32 70 C44 70 50 56 50 50 C50 44 56 30 68 30 C84 30 88 44 88 50 C88 56 84 70 68 70 C56 70 50 56 50 50 C50 44 44 30 32 30 Z" 
            stroke="url(#infG)" 
            strokeWidth="13" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="32" cy="50" r="5" fill="#ffffff" opacity="0.9" />
          <circle cx="68" cy="50" r="5" fill="#ffffff" opacity="0.9" />
        </svg>
      );

    case 'falcon-wings':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="fwG1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="fwG2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <polygon points="50,30 84,18 78,36 50,52 22,36 16,18" fill="url(#fwG1)" />
          <polygon points="50,46 86,38 78,54 50,68 22,54 14,38" fill="url(#fwG2)" />
          <polygon points="46,62 54,62 50,84" fill="#2dd4bf" />
          <polygon points="50,16 60,34 50,42 40,34" fill="#ffffff" filter="drop-shadow(0 0 6px #38bdf8)" />
        </svg>
      );

    case 'rocket-spark':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="rsBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <polygon points="32,48 16,52 26,34" fill="#0284c7" />
          <polygon points="52,68 48,84 66,74" fill="#0284c7" />
          <path d="M78 18 C84 24 84 32 78 40 L52 66 L34 48 L60 22 C68 16 74 16 78 18 Z" fill="url(#rsBody)" />
          <circle cx="62" cy="36" r="6" fill="#ffffff" filter="drop-shadow(0 0 4px #2dd4bf)" />
          <polygon points="34,66 20,86 36,76 28,94 46,74" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" />
        </svg>
      );

    case 'hex-reactor':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="hrG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <polygon points="50,12 86,32 86,68 50,88 14,68 14,32" fill="url(#hrG)" />
          <polygon points="50,24 74,38 74,62 50,76 26,62 26,38" fill="#090e17" />
          <polygon points="50,32 68,64 32,64" fill="#00f2fe" />
          <circle cx="50" cy="53" r="5" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        </svg>
      );

    case 'power-bolt':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="pbG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <polygon points="56,12 22,50 46,50 38,88 78,44 54,44" fill="url(#pbG)" filter="drop-shadow(0 0 8px rgba(0,242,254,0.6))" />
          <polygon points="56,12 48,26 42,50 64,44 44,78 48,64 54,44 34,44" fill="#ffffff" opacity="0.65" />
        </svg>
      );

    case 'cyber-saturn':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="csSph" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <g transform="rotate(-25 50 50)">
            <path d="M 12 50 A 42 16 0 0 1 88 50" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="50" r="26" fill="url(#csSph)" />
            <path d="M 12 50 A 42 16 0 0 0 88 50" stroke="#00f2fe" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 0 6px #00f2fe)" />
            <circle cx="44" cy="42" r="6" fill="#ffffff" opacity="0.75" />
          </g>
        </svg>
      );

    case 'apex-trident':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <defs>
            <linearGradient id="atCenter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="atSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <polygon points="24,28 36,46 32,76 20,76 16,46" fill="url(#atSide)" />
          <polygon points="76,28 84,46 80,76 68,76 64,46" fill="url(#atSide)" />
          <polygon points="50,14 62,38 56,76 44,76 38,38" fill="url(#atCenter)" />
          <rect x="18" y="76" width="64" height="8" rx="4" fill="#2dd4bf" />
          <polygon points="50,26 56,38 50,50 44,38" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        </svg>
      );

    default:
      return null;
  }
};
