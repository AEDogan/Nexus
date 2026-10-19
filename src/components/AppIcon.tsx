import { 
  FolderGit2, 
  Globe, 
  FileText, 
  Cpu, 
  AppWindow
} from 'lucide-react';

interface AppIconProps {
  name: string;
  icon: string;
  customUrl?: string;
  iconDataUrl?: string;
  size?: number;
  className?: string;
}

// 1. Antigravity Atom / Orbital Real Brand SVG
const AntigravityBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <defs>
      <linearGradient id="agGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="agCore" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
      <filter id="agGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Dark rounded canvas backplate */}
    <rect width="64" height="64" rx="14" fill="#0c1322" />
    {/* Elliptical Orbital Ring 1 (Horizontal) */}
    <ellipse
      cx="32"
      cy="32"
      rx="24"
      ry="9"
      stroke="url(#agGrad1)"
      strokeWidth="2.5"
      transform="rotate(-25 32 32)"
      strokeDasharray="90 10"
      opacity="0.9"
    />
    {/* Elliptical Orbital Ring 2 (Tilted Right) */}
    <ellipse
      cx="32"
      cy="32"
      rx="24"
      ry="9"
      stroke="url(#agGrad1)"
      strokeWidth="2.5"
      transform="rotate(35 32 32)"
      strokeDasharray="90 10"
      opacity="0.9"
    />
    {/* Elliptical Orbital Ring 3 (Vertical tilt) */}
    <ellipse
      cx="32"
      cy="32"
      rx="24"
      ry="9"
      stroke="#22d3ee"
      strokeWidth="2"
      transform="rotate(95 32 32)"
      opacity="0.6"
    />
    {/* Orbit Particles */}
    <circle cx="12" cy="22" r="2.5" fill="#38bdf8" filter="url(#agGlow)" />
    <circle cx="50" cy="40" r="2.5" fill="#a855f7" filter="url(#agGlow)" />
    <circle cx="34" cy="10" r="2.2" fill="#2dd4bf" filter="url(#agGlow)" />
    {/* Glowing Center Core */}
    <circle cx="32" cy="32" r="7.5" fill="url(#agCore)" filter="url(#agGlow)" />
    <circle cx="30" cy="30" r="2.5" fill="#ffffff" opacity="0.8" />
  </svg>
);

// 2. Visual Studio Code Authentic Ribbon SVG
const VSCodeBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <path
      d="M174.5 253.2c5.9 3.2 13.2 2.7 18.6-1.3l55.8-42.6c5.5-4.2 8.6-10.7 8.6-17.6V64.3c0-6.9-3.1-13.4-8.6-17.6L193.1 4.1c-5.4-4-12.7-4.5-18.6-1.3L77.3 53.6c-4.3 2.3-7.3 6.4-8.1 11.2l-64 48.6c-6.9 5.2-6.9 15.6 0 20.8l64 48.6c.8 4.8 3.8 8.9 8.1 11.2l97.2 59.2z"
      fill="#0065a9"
    />
    <path
      d="M193.1 4.1c-5.4-4-12.7-4.5-18.6-1.3L77.3 53.6c-4.3 2.3-7.3 6.4-8.1 11.2l97 73.6 82.5-62.7c5.5-4.2 8.6-10.7 8.6-17.6V64.3c0-6.9-3.1-13.4-8.6-17.6L193.1 4.1z"
      fill="#007acc"
    />
    <path
      d="M77.3 202.4l97.2 50.8c5.9 3.2 13.2 2.7 18.6-1.3l55.8-42.6c5.5-4.2 8.6-10.7 8.6-17.6V191.7c0 6.9-3.1 13.4-8.6 17.6l-82.5-62.7-89.1 55.8z"
      fill="#1f8ad2"
    />
    <path
      d="M5.2 134.2c-6.9-5.2-6.9-15.6 0-20.8l64-48.6L77.3 71v114l-8.1 6.2-64-57z"
      fill="#0066b8"
    />
    <path
      d="M166.2 128l82.5-62.7v125.4L166.2 128z"
      fill="#007acc"
    />
  </svg>
);

// 3. PowerShell / Windows Terminal Authentic Brand SVG
const PowerShellBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <defs>
      <linearGradient id="psBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#012456" />
        <stop offset="100%" stopColor="#0d3b82" />
      </linearGradient>
      <linearGradient id="psPrompt" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    {/* Terminal body */}
    <rect width="64" height="64" rx="14" fill="url(#psBg)" />
    <rect x="2" y="2" width="60" height="60" rx="12" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* PowerShell chevron chevron prompt >_ */}
    <path
      d="M17 21L29 32L17 43"
      stroke="url(#psPrompt)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cursor bar */}
    <rect x="33" y="39" width="16" height="5" rx="2.5" fill="#f8fafc" />
    {/* Subtle top window dots */}
    <circle cx="16" cy="11" r="2" fill="#ef4444" opacity="0.7" />
    <circle cx="23" cy="11" r="2" fill="#f59e0b" opacity="0.7" />
    <circle cx="30" cy="11" r="2" fill="#10b981" opacity="0.7" />
  </svg>
);

// 4. Python Authentic Dual Snake SVG
const PythonBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <defs>
      <linearGradient id="pyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#387eb8" />
        <stop offset="100%" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="pyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffe873" />
        <stop offset="100%" stopColor="#ffd43b" />
      </linearGradient>
    </defs>
    <path
      d="M63.5 12c-27 0-25.3 11.7-25.3 11.7l.03 12.1h25.7v3.6H23.5S12 38.1 12 64.9s10.1 26 10.1 26h6.1v-8.6s-.3-10.2 10-10.2h25.6s9.7.2 9.7-9.5V26.4s1.4-14.4-20-14.4zm-7.3 7.3a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z"
      fill="url(#pyBlue)"
    />
    <path
      d="M64.5 116c27 0 25.3-11.7 25.3-11.7l-.03-12.1H64.1v-3.6h40.4S116 89.9 116 63.1s-10.1-26-10.1-26h-6.1v8.6s.3 10.2-10 10.2H64.2s-9.7-.2-9.7 9.5v36.2s-1.4 14.4 20 14.4zm7.3-7.3a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6z"
      fill="url(#pyYellow)"
    />
  </svg>
);

// 5. Notion Authentic Brand SVG
const NotionBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    {/* White / Charcoal rounded base */}
    <rect width="64" height="64" rx="14" fill="#ffffff" />
    <rect x="2" y="2" width="60" height="60" rx="12" stroke="#e2e8f0" strokeWidth="2" />
    {/* Notion Cube 'N' Geometry */}
    <path
      d="M17.5 17.5C18.6 16.5 19.9 16 21.6 16.2L45.4 18c1.7.2 2.6 1 3.1 2.2l.4 27.2c0 1.5-.7 2.6-2 3.1l-25.1 1.7c-1.5.1-2.6-.5-3.3-1.6L16.2 47c-.5-.7-.7-1.6-.7-2.6V20.3c0-1.1.7-2.1 2-2.8z"
      fill="#000000"
    />
    <path
      d="M24 23.5L39.5 24.8V42L24 40.5V23.5z"
      fill="#ffffff"
    />
    <path
      d="M27.2 26.5V37.8L34.5 27.5V38.5"
      stroke="#000000"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 6. Cyberpunk / Gaming Authentic Brand SVG
const CyberpunkBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <rect width="64" height="64" rx="14" fill="#090a0f" />
    {/* Cyberpunk Yellow geometric badge */}
    <path
      d="M14 18H48L52 24V46L46 50H18L12 44V22L14 18Z"
      fill="#fee715"
    />
    <path
      d="M18 24H44L47 28V42L43 45H21L17 41V27L18 24Z"
      fill="#090a0f"
    />
    {/* Cyan / Magenta Neon Accents */}
    <path d="M22 34H30" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
    <path d="M26 30V38" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
    <circle cx="38" cy="32" r="2.5" fill="#ff003c" />
    <circle cx="43" cy="36" r="2.5" fill="#00f0ff" />
    <circle cx="38" cy="40" r="2.5" fill="#fee715" />
  </svg>
);

// 7. Workgroup / Layers 3D Brand SVG
const WorkgroupBrandIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <rect width="64" height="64" rx="14" fill="#0f172a" />
    {/* Layer 1 (bottom) */}
    <path
      d="M32 46L14 36L32 26L50 36L32 46Z"
      fill="#0f766e"
      opacity="0.8"
    />
    {/* Layer 2 (middle) */}
    <path
      d="M32 38L14 28L32 18L50 28L32 38Z"
      fill="#14b8a6"
      opacity="0.9"
    />
    {/* Layer 3 (top glowing) */}
    <path
      d="M32 30L14 20L32 10L50 20L32 30Z"
      fill="#2dd4bf"
    />
    <circle cx="32" cy="20" r="3" fill="#ffffff" />
  </svg>
);

const WindowsFolderIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md transition-transform group-hover:scale-105 shrink-0"
  >
    <path fill="#FFA000" d="M40 12H22l-4-4H8C5.8 8 4 9.8 4 12v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z" />
    <path fill="#FFCA28" d="M40 14H8c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h32c1.1 0 2-.9 2-2V16c0-1.1-.9-2-2-2z" />
    <path fill="#FFE082" d="M42 20H6v16c0 1.1.9 2 2 2h32c1.1 0 2-.9 2-2V20z" />
  </svg>
);

const isDummyIcon = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/') && url.length < 500) return true;
  return url.length >= 700 && url.length <= 850 && url.includes('ACAAAAAgCAYAAABz');
};

const isSafeImageSource = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (isDummyIcon(trimmed)) return false;
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
};

export const AppIcon: React.FC<AppIconProps> = ({ 
  name, 
  icon, 
  customUrl, 
  iconDataUrl, 
  size = 32,
  className = ''
}) => {
  // 1. Real native Windows icon (base64) or uploaded image
  const candidate = (iconDataUrl && isSafeImageSource(iconDataUrl))
    ? iconDataUrl
    : (customUrl && isSafeImageSource(customUrl))
      ? customUrl
      : (icon && isSafeImageSource(icon))
        ? icon
        : null;
  const imageSource = candidate ? candidate.trim() : null;

  if (imageSource) {
    return (
      <img
        src={imageSource}
        alt={name}
        className={`object-contain drop-shadow-md transition-transform group-hover:scale-105 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // 2. Real Brand SVGs (Antigravity, VS Code, PowerShell/Terminal, Python, Notion, Cyberpunk, Workgroup)
  const key = `${icon || ''} ${name || ''}`.toLowerCase();

  // Folder / Directory
  if (key.includes('folder') || key.includes('klasör') || key.includes('dizin') || key.includes('dir') || icon === 'Folder' || icon === 'FolderGit2' || icon === 'project') {
    return <WindowsFolderIcon size={size} />;
  }

  // Antigravity (atom / orbital)
  if (key.includes('antigravity') || (key.includes('anti') && key.includes('gravity')) || icon === 'Antigravity') {
    return <AntigravityBrandIcon size={size} />;
  }

  // VS Code (ribbon)
  if (key.includes('vscode') || key.includes('vs code') || key.includes('visual studio code') || icon === 'VSCode' || icon === 'Code2') {
    return <VSCodeBrandIcon size={size} />;
  }

  // PowerShell / Terminal
  if (key.includes('power') || key.includes('shell') || key.includes('terminal') || key.includes('ps1') || key.includes('cmd') || icon === 'PowerShell' || icon === 'Terminal') {
    return <PowerShellBrandIcon size={size} />;
  }

  // Python
  if (key.includes('python') || key.includes('py') || key.includes('crime') || icon === 'Python') {
    return <PythonBrandIcon size={size} />;
  }

  // Notion
  if (key.includes('notion') || icon === 'Notion') {
    return <NotionBrandIcon size={size} />;
  }

  // Cyberpunk / Gaming
  if (key.includes('cyber') || key.includes('game') || key.includes('punk') || icon === 'Cyberpunk' || icon === 'Gamepad2') {
    return <CyberpunkBrandIcon size={size} />;
  }

  // Workgroup / Layers
  if (key.includes('group') || key.includes('workgroup') || key.includes('layer') || icon === 'Layers' || icon === 'Workgroup') {
    return <WorkgroupBrandIcon size={size} />;
  }

  // 3. Fallback clean Lucide icons
  const iconProps = { 
    size: Math.max(16, size - 4), 
    className: `text-teal-600 transition-transform group-hover:scale-105 shrink-0 ${className}` 
  };

  if (key.includes('doc') || key.includes('text') || icon === 'FileText') {
    return <FileText {...iconProps} />;
  }
  if (key.includes('cpu') || key.includes('clean') || key.includes('script') || icon === 'Cpu') {
    return <Cpu {...iconProps} />;
  }
  if (key.includes('git') || key.includes('project') || icon === 'FolderGit2') {
    return <FolderGit2 {...iconProps} />;
  }
  if (key.includes('web') || key.includes('browser') || key.includes('edge') || key.includes('chrome')) {
    return <Globe {...iconProps} />;
  }

  return <AppWindow {...iconProps} />;
};
