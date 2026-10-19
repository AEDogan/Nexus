export type AppType = 'exe' | 'bat' | 'cmd' | 'ps1' | 'project' | 'group';

export interface NexusApp {
  id: string;
  name: string;
  category: string;
  type: AppType;
  path: string;
  arguments: string;
  workingDirectory: string;
  runAsAdmin: boolean;
  version: string;
  description: string;
  icon: string;
  iconDataUrl?: string;
  favorite: boolean;
  tags: string[];
  lastRun?: string;
  lastRunTime?: number;
  runCount?: number;
  status?: 'idle' | 'running' | 'stopping';
  // For workgroups:
  subApps?: string[];
}

export type LayoutMode = 'right-dock' | 'floating-widget' | 'full';

export type SortMode = 'custom' | 'name-asc' | 'name-desc' | 'most-used' | 'recently-used';

export type ThemeId = 
  | 'neo-mint-glass'
  | 'arctic-crystal'
  | 'opal-prism'
  | 'frost-glass'
  | 'rose-glass'
  | 'dark-steel'
  | 'obsidian-slate'
  | 'midnight-blue'
  | 'aurora-glass'
  | 'carbon-matrix';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  categoryName?: string;
  description: string;
  isLight: boolean;
  previewBg: string;
  bodyBg: string;
  gradientOverlay: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardShadow?: string;
  headerBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  buttonPlay: string;
  badgeBg: string;
  glassBackdrop: string;
  activeCategoryBg: string;
  inputBg: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}
