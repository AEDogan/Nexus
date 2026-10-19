import React from 'react';
import { NexusApp, ThemeConfig } from '../types';
import { ContextMenu } from './ContextMenu';
import { AppIcon } from './AppIcon';
import { 
  MoreVertical, 
  Star, 
  ShieldCheck,
  GripVertical
} from 'lucide-react';

interface AppCardProps {
  app: NexusApp;
  theme: ThemeConfig;
  index?: number;
  activeMenuId: string | null;
  draggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, app: NexusApp) => void;
  onDragOver?: (e: React.DragEvent, app: NexusApp) => void;
  onDragLeave?: (e: React.DragEvent, app: NexusApp) => void;
  onDrop?: (e: React.DragEvent, app: NexusApp) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onOpenMenu: (id: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onLaunch: (app: NexusApp) => void;
  onStop: (app: NexusApp) => void;
  onRestart: (app: NexusApp) => void;
  onToggleFavorite: (app: NexusApp) => void;
  onEdit: (app: NexusApp) => void;
  onOpenLocation: (app: NexusApp) => void;
  onRemove: (app: NexusApp) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  theme,
  index: _index,
  activeMenuId,
  draggable = true,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onOpenMenu,
  onCloseMenu,
  onLaunch,
  onStop,
  onRestart,
  onToggleFavorite,
  onEdit,
  onOpenLocation,
  onRemove
}) => {
  const dragOccurredRef = React.useRef(false);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const isMenuOpen = activeMenuId === app.id;
  const isRunning = app.status === 'running';

  React.useEffect(() => {
    if (isMenuOpen && menuBtnRef.current) {
      setTriggerRect(menuBtnRef.current.getBoundingClientRect());
    } else if (!isMenuOpen) {
      setTriggerRect(null);
    }
  }, [isMenuOpen]);

  return (
    <div
      data-testid={`app-card-${app.id}`}
      data-launch-id={`app-launch-btn-${app.id}`}
      draggable={draggable}
      onPointerDownCapture={() => { dragOccurredRef.current = false; }}
      onClickCapture={(e) => {
        if (dragOccurredRef.current) {
          e.preventDefault();
          e.stopPropagation();
          dragOccurredRef.current = false;
        }
      }}
      onDragStart={(e) => {
        dragOccurredRef.current = true;
        onDragStart?.(e, app);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, app);
      }}
      onDragLeave={(e) => onDragLeave?.(e, app)}
      onDrop={(e) => {
        e.preventDefault();
        dragOccurredRef.current = true;
        onDrop?.(e, app);
      }}
      onDragEnd={(e) => {
        dragOccurredRef.current = true;
        onDragEnd?.(e);
      }}
      className={`group no-drag relative rounded-2xl px-3 py-2.5 transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
        isDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.015]'
      } ${
        isDragOver ? 'ring-2 ring-teal-400 border-teal-400' : ''
      }`}
      style={{
        backgroundColor: theme.cardBg,
        border: isDragOver ? '1.5px solid #2dd4bf' : `1px solid ${theme.cardBorder}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: isMenuOpen ? 50 : 1,
        minHeight: '52px',
        boxShadow: isRunning 
          ? `0 0 20px -4px ${theme.accentBg}, 0 4px 18px rgba(0,0,0,0.25)` 
          : (theme.cardShadow || '0 4px 20px 0 rgba(0, 0, 0, 0.2)'),
      }}
      onClick={() => onLaunch(app)}
      title={`${app.name} (Tıkla ve Başlat)`}
    >
      {/* Light sheen on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%)'
        }}
      />
      {/* Subtle top edge metallic highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] opacity-40 group-hover:opacity-80 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)'
        }}
      />

      {/* LEFT: DRAG HANDLE + ICON + NAME + STATUS */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
        {/* Drag Handle */}
        <div 
          className="cursor-grab active:cursor-grabbing text-teal-400/30 group-hover:text-teal-400 transition-colors shrink-0 -ml-0.5" 
          title="Sıralamak için tut ve kaydır"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={13} />
        </div>

        {/* Icon Container (Solid Opaque - Never affected by transparency) */}
        <div
          className="w-8 h-8 rounded-xl shadow-xs flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200"
          style={{
            backgroundColor: theme.isLight ? '#ffffff' : '#0f172a',
            border: `1px solid ${theme.cardBorder}`
          }}
        >
          <AppIcon name={app.name} icon={app.icon} customUrl={app.iconDataUrl} iconDataUrl={app.iconDataUrl} size={20} />
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3
              className="text-xs font-semibold tracking-wide truncate transition-colors drop-shadow-sm"
              style={{ color: theme.textPrimary }}
              title={app.name}
            >
              {app.name}
            </h3>
            {app.runAsAdmin && (
              <span title="Yönetici olarak çalışır" className="text-amber-400 shrink-0">
                <ShieldCheck size={12} />
              </span>
            )}
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Çalışıyor" />
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: FAVORITE & CONTEXT MENU */}
      <div className="flex items-center gap-1 shrink-0 no-drag ml-2 relative z-10">
        {app.favorite && (
          <span title="Favori" className="p-0.5 text-amber-400">
            <Star size={12} className="fill-amber-400" />
          </span>
        )}
        <button
          ref={menuBtnRef}
          data-testid={`app-menu-btn-${app.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setTriggerRect(e.currentTarget.getBoundingClientRect());
            onOpenMenu(app.id, e);
          }}
          className="p-1 rounded-lg opacity-40 group-hover:opacity-100 hover:bg-white/10 transition-all"
          style={{ color: theme.textPrimary }}
          title="Seçenekler"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* CONTEXT MENU */}
      {isMenuOpen && (
        <ContextMenu
          app={app}
          theme={theme}
          triggerRect={triggerRect}
          onLaunch={onLaunch}
          onStop={onStop}
          onRestart={onRestart}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onOpenLocation={onOpenLocation}
          onRemove={onRemove}
          onClose={onCloseMenu}
        />
      )}
    </div>
  );
};
