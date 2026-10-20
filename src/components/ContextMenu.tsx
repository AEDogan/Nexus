import React from 'react';
import { createPortal } from 'react-dom';
import { NexusApp, ThemeConfig } from '../types';
import { Play, Power, RotateCw, Star, Edit, FolderOpen, Trash2, Shield } from 'lucide-react';

interface ContextMenuProps {
  app: NexusApp;
  theme: ThemeConfig;
  triggerRect?: DOMRect | null;
  onLaunch: (app: NexusApp) => void;
  onStop: (app: NexusApp) => void;
  onRestart: (app: NexusApp) => void;
  onToggleFavorite: (app: NexusApp) => void;
  onEdit: (app: NexusApp) => void;
  onOpenLocation: (app: NexusApp) => void;
  onRemove: (app: NexusApp) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  app,
  theme,
  triggerRect,
  onLaunch,
  onStop,
  onRestart,
  onToggleFavorite,
  onEdit,
  onOpenLocation,
  onRemove,
  onClose
}) => {
  const isRunning = app.status === 'running';
  const hoverClass = theme.isLight ? 'hover:bg-black/5' : 'hover:bg-white/10';

  const menuWidth = 224;
  const menuHeight = 310;
  const padding = 12;

  let posStyle: React.CSSProperties = {};

  if (triggerRect && typeof window !== 'undefined') {
    let left = triggerRect.right - menuWidth;
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    let top = triggerRect.bottom + 6;
    if (top + menuHeight > window.innerHeight - padding) {
      top = triggerRect.top - menuHeight - 6;
    }
    if (top < padding) {
      top = Math.max(padding, window.innerHeight - menuHeight - padding);
    }

    posStyle = {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`
    };
  } else {
    posStyle = {
      position: 'fixed',
      right: '16px',
      top: '64px'
    };
  }

  const menuContent = (
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} 
      />
      <div
        data-testid={`context-menu-${app.id}`}
        className="w-56 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 overflow-y-auto custom-scrollbar"
        style={{
          ...posStyle,
          maxHeight: 'calc(100vh - 24px)',
          backgroundColor: theme.isLight ? '#ffffff' : '#10131a',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.isLight
            ? '0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)'
            : '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
      <div 
        className="px-4 py-2.5 border-b flex items-center justify-between" 
        style={{ 
          borderColor: theme.cardBorder,
          backgroundColor: theme.isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)' 
        }}
      >
        <div className="truncate">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
            {app.name}
          </span>
        </div>
        {app.runAsAdmin && (
          <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
            <Shield size={10} /> Admin
          </span>
        )}
      </div>

      <div className="py-1">
        <button
          data-testid="context-menu-launch"
          onClick={() => { onLaunch(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: theme.textPrimary }}
        >
          <Play size={14} className="text-emerald-500" />
          <span>Başlat</span>
        </button>

        <button
          data-testid="context-menu-stop"
          onClick={() => { onStop(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: isRunning ? '#ef4444' : theme.textSecondary }}
        >
          <Power size={14} />
          <span>Kapat {isRunning ? '(Çalışıyor)' : ''}</span>
        </button>

        <button
          data-testid="context-menu-restart"
          onClick={() => { onRestart(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: theme.textPrimary }}
        >
          <RotateCw size={14} />
          <span>Yeniden Başlat</span>
        </button>

        <div className="h-px my-1 mx-2" style={{ backgroundColor: theme.cardBorder }} />

        <button
          data-testid="context-menu-favorite"
          onClick={() => { onToggleFavorite(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: theme.textPrimary }}
        >
          <Star size={14} className={app.favorite ? "text-amber-500 fill-amber-500" : ""} />
          <span>{app.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
        </button>

        <button
          data-testid="context-menu-edit"
          onClick={() => { onEdit(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: theme.textPrimary }}
        >
          <Edit size={14} />
          <span>Uygulama Özellikleri & Etiketler</span>
        </button>

        <button
          data-testid="context-menu-open-location"
          onClick={() => { onOpenLocation(app); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors ${hoverClass}`}
          style={{ color: theme.textPrimary }}
        >
          <FolderOpen size={14} />
          <span>Dosya Konumunu Aç</span>
        </button>

        <div className="h-px my-1 mx-2" style={{ backgroundColor: theme.cardBorder }} />

        <button
          data-testid="context-menu-remove"
          onClick={() => { onRemove(app); onClose(); }}
          className="w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors hover:bg-red-500/10 text-red-500"
        >
          <Trash2 size={14} />
          <span>Kütüphaneden Kaldır</span>
        </button>
      </div>
    </div>
  </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(menuContent, document.body);
  }
  return menuContent;
};
