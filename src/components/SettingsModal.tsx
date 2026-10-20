import React from 'react';
import { ThemeConfig, ThemeId, LayoutMode } from '../types';
import { THEMES } from '../themes';
import { NexusLogo, NexusLogoStyle } from './NexusLogo';
import { 
  Settings, 
  X, 
  Check, 
  RotateCcw, 
  Command, 
  Shield, 
  Eye, 
  Sparkles, 
  Sliders,
  PanelRightClose,
  Square,
  Maximize2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  glassOpacity: number;
  onGlassOpacityChange: (opacity: number) => void;
  layoutMode?: LayoutMode;
  onLayoutModeChange?: (mode: LayoutMode) => void;
    autoStart: boolean;
  onToggleAutoStart: () => void;
  autoDiscover: boolean;
  onToggleAutoDiscover: () => void;
  forceKill: boolean;
  onToggleForceKill: () => void;
  onResetLibrary: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  glassOpacity,
  onGlassOpacityChange,
  layoutMode = 'right-dock',
  onLayoutModeChange,
  currentLogo,
  onSelectLogo,
  autoStart,
  onToggleAutoStart,
  autoDiscover,
  onToggleAutoDiscover,
  forceKill,
  onToggleForceKill,
  onResetLibrary
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(THEMES);

  const opacityPills = [
    { value: 0, label: '%0', title: 'Tam Saydam Cam' },
    { value: 30, label: '%30', title: 'Hafif Cam' },
    { value: 60, label: '%60', title: 'Buzlu Cam' },
    { value: 80, label: '%80', title: 'Standart Akrilik' },
    { value: 100, label: '%100', title: 'Opak Mat' }
  ];

  return (
    <div
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        data-testid="settings-backdrop"
      />

      {/* MODAL WINDOW */}
      <div
        className="relative w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        style={{
          backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(16, 18, 24, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          color: currentTheme.textPrimary,
          boxShadow: currentTheme.isLight 
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.9)'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="flex justify-between items-center px-6 py-5 border-b"
          style={{ borderColor: currentTheme.cardBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: currentTheme.accentBg,
                border: `1px solid ${currentTheme.cardBorder}`
              }}
            >
              <Settings size={20} style={{ color: currentTheme.accent }} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-wide">NEXUS Ayarları</h2>
              <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                Görünüm, cam saydamlığı, sistem entegrasyonu ve kısayollar
              </p>
            </div>
          </div>

          <button
            data-testid="close-settings-btn"
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-all hover:bg-black/5"
            style={{ color: currentTheme.textPrimary }}
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* GLASS OPACITY & DENSITY SECTION */}
          <div 
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: currentTheme.badgeBg,
              borderColor: currentTheme.cardBorder
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                  <Sliders size={16} style={{ color: currentTheme.accent }} />
                  Cam Saydamlığı ve Yoğunluk
                </h3>
                <p className="text-xs mt-0.5" style={{ color: currentTheme.textSecondary }}>
                  Masaüstü arka plan geçirgenliği, akrilik derinliği ve porselen cam bulanıklığı
                </p>
              </div>
              <div 
                className="px-3 py-1 rounded-full font-mono text-xs font-bold border"
                style={{
                  backgroundColor: currentTheme.accentBg,
                  borderColor: currentTheme.cardBorder,
                  color: currentTheme.accent
                }}
              >
                %{glassOpacity}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3 pt-2">
              <input
                data-testid="glass-opacity-slider"
                type="range"
                min="0"
                max="100"
                value={glassOpacity}
                onChange={(e) => onGlassOpacityChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-black/10 transition-all"
              />

              {/* Opacity Pill Buttons: 0%, 30%, 60%, 80%, 100% */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {opacityPills.map((pill) => {
                  const isActive = glassOpacity === pill.value;
                  return (
                    <button
                      key={pill.value}
                      type="button"
                      data-testid={`opacity-pill-${pill.value}`}
                      onClick={() => onGlassOpacityChange(pill.value)}
                      className="py-1.5 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center transition-all duration-150 hover:scale-102 active:scale-95"
                      style={{
                        backgroundColor: isActive 
                          ? (currentTheme.isLight ? '#0d9488' : currentTheme.accent) 
                          : 'transparent',
                        borderColor: isActive ? currentTheme.accent : currentTheme.cardBorder,
                        color: isActive ? '#ffffff' : currentTheme.textPrimary,
                        boxShadow: isActive ? '0 2px 8px rgba(13, 148, 136, 0.3)' : 'none'
                      }}
                      title={pill.title}
                    >
                      <span>{pill.label}</span>
                      <span className={`text-[9px] font-normal truncate opacity-80 ${isActive ? 'text-white' : ''}`}>
                        {pill.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] leading-relaxed pt-1" style={{ color: currentTheme.textSecondary }}>
                {glassOpacity === 0 
                  ? 'Masaüstünüz arka plandan tamamen kristal netliğinde görünür; sadece kartlar cam üzerinde süzülür.' 
                  : glassOpacity <= 40 
                    ? 'Hafif geçirgen cam dokusu, yüksek okunabilirlik ile arka plan detaylarını korur.' 
                    : glassOpacity <= 80 
                      ? 'Dengeli akrilik cam dokusu; modern işletim sistemi estetiği sunar.' 
                      : 'Maksimum kontrast sağlayan yoğun ve mat koruyucu arka plan.'}
              </p>
            </div>
          </div>

          {/* WINDOW LAYOUT SECTION */}
          {onLayoutModeChange && (
            <div 
              className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{
                backgroundColor: currentTheme.badgeBg,
                borderColor: currentTheme.cardBorder
              }}
            >
              <div>
                <span className="text-xs font-semibold block">Pencere Düzeni & Vitrin Modu</span>
                <span className="text-[11px]" style={{ color: currentTheme.textSecondary }}>
                  Sağ kenara kenetlenen dikey panel, serbest kayan widget veya geniş vitrin
                </span>
              </div>
              <div 
                className="flex items-center rounded-xl p-1 border self-start sm:self-auto"
                style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.inputBg }}
              >
                <button
                  data-testid="mode-dock-btn"
                  onClick={() => onLayoutModeChange('right-dock')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    layoutMode === 'right-dock' ? 'shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: layoutMode === 'right-dock' ? currentTheme.accentBg : 'transparent',
                    color: layoutMode === 'right-dock' ? currentTheme.accent : currentTheme.textPrimary
                  }}
                  title="Sağ Kenar Çubuğu (Dikey 1/3)"
                >
                  <PanelRightClose size={13} />
                  <span>Dikey Kenar</span>
                </button>
                <button
                  data-testid="mode-floating-btn"
                  onClick={() => onLayoutModeChange('floating-widget')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    layoutMode === 'floating-widget' ? 'shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: layoutMode === 'floating-widget' ? currentTheme.accentBg : 'transparent',
                    color: layoutMode === 'floating-widget' ? currentTheme.accent : currentTheme.textPrimary
                  }}
                  title="Kompakt Kayan Widget"
                >
                  <Square size={13} />
                  <span>Kayan Widget</span>
                </button>
                <button
                  data-testid="mode-full-btn"
                  onClick={() => onLayoutModeChange('full')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    layoutMode === 'full' ? 'shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: layoutMode === 'full' ? currentTheme.accentBg : 'transparent',
                    color: layoutMode === 'full' ? currentTheme.accent : currentTheme.textPrimary
                  }}
                  title="Tam Vitrin Görünümü"
                >
                  <Maximize2 size={13} />
                  <span>Geniş Vitrin</span>
                </button>
              </div>
            </div>
          )}

          {/* THEMES SECTION */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                  <Sparkles size={16} style={{ color: currentTheme.accent }} />
                  Tasarım & Tema Sistemi (10 Seçenek)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: currentTheme.textSecondary }}>
                  Tester Tracker (Neo-Mint Glass) ve Vercel stillerini içeren cam & metalik temalar
                </p>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full font-mono font-medium"
                style={{
                  backgroundColor: currentTheme.accentBg,
                  color: currentTheme.accent,
                  border: `1px solid ${currentTheme.cardBorder}`
                }}
              >
                Aktif: {currentTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeList.map((theme) => {
                const isSelected = theme.id === currentTheme.id;
                return (
                  <button
                    key={theme.id}
                    data-testid={`theme-option-${theme.id}`}
                    onClick={() => onSelectTheme(theme.id)}
                    className="group relative flex items-start gap-3.5 p-3.5 rounded-2xl text-left transition-all duration-200 overflow-hidden"
                    style={{
                      backgroundColor: isSelected 
                        ? (currentTheme.isLight ? 'rgba(20, 184, 166, 0.12)' : currentTheme.accentBg) 
                        : (currentTheme.isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
                      border: `1px solid ${isSelected ? currentTheme.accent : currentTheme.cardBorder}`
                    }}
                  >
                    {/* Color Swatch */}
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 shadow-sm flex items-center justify-center border border-white/40"
                      style={{ background: theme.previewBg }}
                    >
                      {isSelected && <Check size={16} className="text-white drop-shadow" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wide">
                          {theme.name}
                        </span>
                        {theme.categoryName && (
                          <span 
                            className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: theme.isLight ? 'rgba(13, 148, 136, 0.12)' : 'rgba(255, 255, 255, 0.1)',
                              color: theme.isLight ? '#0f766e' : '#cbd5e1'
                            }}
                          >
                            {theme.categoryName}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        {theme.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* HEADER LOGO SECTION */}
          

          {/* GENERAL SETTINGS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide">Genel Davranış</h3>

            <div className="space-y-2">
              <label
                data-testid="toggle-auto-start"
                className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-black/5"
                style={{ border: `1px solid ${currentTheme.cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/5 opacity-80">
                    <Shield size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium block">Sistem Başlangıcında Çalıştır</span>
                    <span className="text-[11px]" style={{ color: currentTheme.textSecondary }}>
                      Windows açılışında NEXUS arka planda hazır beklesin
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={onToggleAutoStart}
                  className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                />
              </label>

              <label
                data-testid="toggle-auto-discover"
                className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-black/5"
                style={{ border: `1px solid ${currentTheme.cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/5 opacity-80">
                    <Eye size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium block">Otomatik Uygulama Keşfi</span>
                    <span className="text-[11px]" style={{ color: currentTheme.textSecondary }}>
                      Masaüstü ve Başlat menüsündeki yeni kısayolları otomatik tespit et
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDiscover}
                  onChange={onToggleAutoDiscover}
                  className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                />
              </label>

              <label
                data-testid="toggle-force-kill"
                className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-black/5"
                style={{ border: `1px solid ${currentTheme.cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/5 opacity-80">
                    <Command size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium block">Zorla Kapatma (Force Kill) Modu</span>
                    <span className="text-[11px]" style={{ color: currentTheme.textSecondary }}>
                      Kapatma isteğine yanıt vermeyen süreçleri anında sonlandır
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={forceKill}
                  onChange={onToggleForceKill}
                  className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* QUICK LAUNCH SHORTCUT INFO */}
          <div
            className="p-4 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: currentTheme.accentBg,
              border: `1px solid ${currentTheme.cardBorder}`
            }}
          >
            <div>
              <span className="text-xs font-semibold block">Hızlı Başlat Kısayolu</span>
              <span className="text-[11px]" style={{ color: currentTheme.textSecondary }}>
                NEXUS penceresini anında çağırmak için global tuş kombinasyonu
              </span>
            </div>
            <div 
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-xl border shadow-sm"
              style={{
                backgroundColor: currentTheme.isLight ? '#ffffff' : '#000000',
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textPrimary
              }}
            >
              <span className="opacity-70">Ctrl</span>
              <span className="opacity-50">+</span>
              <span className="font-bold">Space</span>
            </div>
          </div>

          {/* RESET DATA */}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
              Tüm kütüphaneyi varsayılan veri setine döndür:
            </span>
            <button
              data-testid="reset-library-btn"
              onClick={onResetLibrary}
              className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 hover:bg-red-500/10 text-red-500 border border-red-500/20 transition-all"
            >
              <RotateCcw size={14} /> Kütüphaneyi Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
