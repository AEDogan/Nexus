import React, { useState, useEffect } from 'react';
import { NexusApp, ThemeConfig, AppType } from '../types';
import { AppIcon } from './AppIcon';
import { 
  X, 
  Save, 
  PlusCircle, 
  FolderOpen, 
  Folder,
  Search, 
  Loader2, 
  ShieldCheck, 
  Compass 
} from 'lucide-react';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appData: Partial<NexusApp>) => void;
  categories: string[];
  initialApp?: NexusApp | null;
  theme: ThemeConfig;
  defaultCategory?: string;
}

interface ScannedShortcut {
  name: string;
  path: string;
  iconDataUrl: string | null;
}

export const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialApp,
  theme,
  defaultCategory
}) => {
  const isEditing = Boolean(initialApp);

  const resolveTargetCategory = React.useCallback(() => {
    if (initialApp?.category) return initialApp.category;
    if (defaultCategory && defaultCategory !== 'Tümü' && defaultCategory !== 'Favoriler') {
      return defaultCategory;
    }
    return categories.find((c) => c !== 'Tümü' && c !== 'Favoriler') || 'Genel';
  }, [initialApp, defaultCategory, categories]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(resolveTargetCategory);
  const [path, setPath] = useState('');
  const [type, setType] = useState<AppType>('exe');
  const [runAsAdmin, setRunAsAdmin] = useState(false);
  const [tagsStr, setTagsStr] = useState('');
  const [icon, setIcon] = useState('AppWindow');
  const [iconDataUrl, setIconDataUrl] = useState<string | undefined>(undefined);

  // Shortcut Scanner State
  const [isScanningShortcuts, setIsScanningShortcuts] = useState(false);
  const [showShortcutPicker, setShowShortcutPicker] = useState(false);
  const [scannedShortcuts, setScannedShortcuts] = useState<ScannedShortcut[]>([]);
  const [shortcutSearch, setShortcutSearch] = useState('');

  useEffect(() => {
    const targetCat = resolveTargetCategory();
    if (initialApp) {
      setName(initialApp.name);
      setCategory(initialApp.category || targetCat);
      setType(initialApp.type || 'exe');
      setPath(initialApp.path || '');
      setRunAsAdmin(Boolean(initialApp.runAsAdmin));
      setTagsStr((initialApp.tags || []).join(', '));
      setIcon(initialApp.icon || (initialApp.type === 'project' ? 'Folder' : initialApp.name));
      setIconDataUrl(initialApp.iconDataUrl);
    } else {
      setName('');
      setCategory(targetCat);
      setType('exe');
      setPath('');
      setRunAsAdmin(false);
      setTagsStr('');
      setIcon('AppWindow');
      setIconDataUrl(undefined);
    }
    setShowShortcutPicker(false);
    setShortcutSearch('');
  }, [initialApp, isOpen, resolveTargetCategory]);

  if (!isOpen) return null;

  const handleBrowseFile = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.selectFile) {
      try {
        const fileResult = await (window as any).electronAPI.selectFile();
        if (fileResult) {
          setPath(fileResult.filePath);
          if (!name.trim()) {
            setName(fileResult.fileName);
          }
          if (fileResult.iconDataUrl) {
            setIconDataUrl(fileResult.iconDataUrl);
          }
          if (fileResult.detectedType) {
            setType(fileResult.detectedType);
            setIcon(fileResult.detectedType === 'project' ? 'Folder' : fileResult.fileName);
          }
        }
      } catch (err) {
        console.warn('File selection failed', err);
      }
    }
  };

  const handleBrowseFolder = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.selectFolder) {
      try {
        const folderResult = await (window as any).electronAPI.selectFolder();
        if (folderResult) {
          setPath(folderResult.filePath);
          if (!name.trim()) {
            setName(folderResult.fileName);
          }
          if (folderResult.iconDataUrl) {
            setIconDataUrl(folderResult.iconDataUrl);
          }
          setType('project');
          setIcon('Folder');
        }
      } catch (err) {
        console.warn('Folder selection failed', err);
      }
    }
  };

  const handlePathChange = async (newPath: string) => {
    setPath(newPath);
    const clean = newPath.trim().replace(/^"|"$/g, '');
    if (clean && typeof window !== 'undefined' && (window as any).electronAPI?.getFileInfo) {
      try {
        const info = await (window as any).electronAPI.getFileInfo(clean);
        if (info) {
          if (!name.trim() && info.fileName) {
            setName(info.fileName);
          }
          if (info.iconDataUrl) {
            setIconDataUrl(info.iconDataUrl);
          }
          if (info.detectedType) {
            setType(info.detectedType);
            if (info.detectedType === 'project') setIcon('Folder');
            else if (!icon || icon === 'AppWindow') setIcon(info.fileName);
          }
        }
      } catch {
        // ignore
      }
    }
  };

  const handleScanShortcuts = async () => {
    setShowShortcutPicker(true);
    if (scannedShortcuts.length > 0) return;

    if (typeof window !== 'undefined' && (window as any).electronAPI?.scanShortcuts) {
      setIsScanningShortcuts(true);
      try {
        const list = await (window as any).electronAPI.scanShortcuts();
        setScannedShortcuts(list || []);
      } catch (err) {
        console.warn('Failed to scan shortcuts', err);
      } finally {
        setIsScanningShortcuts(false);
      }
    }
  };

  const handleSelectShortcut = (shortcut: ScannedShortcut) => {
    setName(shortcut.name);
    setPath(shortcut.path);
    if (shortcut.iconDataUrl) {
      setIconDataUrl(shortcut.iconDataUrl);
    }
    setType('exe');
    setIcon(shortcut.name);
    setShowShortcutPicker(false);
  };

  const filteredShortcuts = scannedShortcuts.filter((sc) => {
    const q = shortcutSearch.toLowerCase().trim();
    if (!q) return true;
    return sc.name.toLowerCase().includes(q) || sc.path.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      ...(initialApp ? { id: initialApp.id } : {}),
      name: name.trim(),
      category,
      type,
      path: path.trim(),
      arguments: initialApp?.arguments || '',
      workingDirectory: initialApp?.workingDirectory || '',
      runAsAdmin,
      version: initialApp?.version || '1.0.0',
      description: initialApp?.description || '',
      tags: tags.length > 0 ? tags : (initialApp?.tags || ['Genel']),
      icon,
      iconDataUrl
    });
    onClose();
  };

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderColor: theme.cardBorder,
    color: theme.textPrimary
  };

  return (
    <div
      data-testid="app-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        data-testid="app-modal-backdrop"
      />

      <div
        className="relative w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        style={{
          backgroundColor: theme.isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(16, 18, 24, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: `1px solid ${theme.cardBorder}`,
          color: theme.textPrimary,
          boxShadow: theme.isLight
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.9)'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b"
          style={{ borderColor: theme.cardBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md shrink-0"
              style={{
                background: theme.buttonPlay,
                color: '#ffffff'
              }}
            >
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: theme.textPrimary }}>
                {isEditing ? 'Uygulamayı Düzenle' : 'Kütüphaneye Kısayol Ekle'}
              </h2>
              <p className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>
                {isEditing ? 'Uygulama ayrıntılarını güncelleyin.' : `"${category}" grubuna eklenecek kısayolu seçin.`}
              </p>
            </div>
          </div>
          <button
            data-testid="close-app-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            style={{ color: theme.textPrimary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SYSTEM SHORTCUT PICKER DRAWER */}
        {showShortcutPicker && (
          <div
            className="p-4 border-b animate-in slide-in-from-top duration-200"
            style={{
              backgroundColor: theme.isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.85)',
              borderColor: theme.cardBorder
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Compass size={14} style={{ color: theme.accent }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                  Sistem Kısayolları ({filteredShortcuts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutPicker(false)}
                className="text-[11px] font-semibold opacity-60 hover:opacity-100 px-2 py-0.5 rounded-lg"
              >
                Kapat ✕
              </button>
            </div>

            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-2.5 opacity-50" />
              <input
                type="text"
                placeholder="Kısayollarda ara..."
                value={shortcutSearch}
                onChange={(e) => setShortcutSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-400"
                style={inputStyle}
              />
            </div>

            {isScanningShortcuts ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: theme.accent }}>
                <Loader2 size={16} className="animate-spin" /> Masaüstü ve Başlat menüsü taranıyor...
              </div>
            ) : filteredShortcuts.length === 0 ? (
              <p className="text-xs text-center py-2 opacity-60">Kısayol bulunamadı.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredShortcuts.map((sc) => (
                  <button
                    key={sc.path}
                    type="button"
                    onClick={() => handleSelectShortcut(sc)}
                    className="w-full text-left p-1.5 rounded-xl flex items-center gap-2.5 hover:bg-teal-500/10 transition-colors border border-transparent hover:border-teal-500/20 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                      {sc.iconDataUrl ? (
                        <img src={sc.iconDataUrl} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <Compass size={14} style={{ color: theme.accent }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate group-hover:text-teal-400">{sc.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. DOSYA YOLU + GÖZAT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold tracking-wider uppercase" style={{ color: theme.textPrimary }}>
                Kısayol veya Dosya Yolu *
              </label>
              <button
                data-testid="scan-shortcuts-btn"
                type="button"
                onClick={handleScanShortcuts}
                className="text-[11px] font-semibold text-teal-500 hover:text-teal-400 flex items-center gap-1 transition-colors"
                title="Masaüstü ve Başlat menüsündeki kısayolları listele"
              >
                <Compass size={12} /> Sistemden Seç
              </button>
            </div>
            <div className="flex gap-2">
              <input
                data-testid="app-modal-path-input"
                type="text"
                placeholder="Örn: C:\Program Files\App.exe, .lnk veya Klasör yolu"
                value={path}
                onChange={(e) => handlePathChange(e.target.value)}
                className="flex-1 text-xs rounded-xl px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
                style={inputStyle}
                required
              />
              <button
                data-testid="browse-file-btn"
                type="button"
                onClick={handleBrowseFile}
                className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border hover:bg-black/5 dark:hover:bg-white/10 transition-all shrink-0 shadow-xs"
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.textPrimary
                }}
                title="Bilgisayardan Dosya veya Kısayol Seç"
              >
                <FolderOpen size={14} style={{ color: theme.accent }} />
                <span>Gözat...</span>
              </button>
              <button
                data-testid="browse-folder-btn"
                type="button"
                onClick={handleBrowseFolder}
                className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border hover:bg-black/5 dark:hover:bg-white/10 transition-all shrink-0 shadow-xs"
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.textPrimary
                }}
                title="Bilgisayardan Klasör Seç"
              >
                <Folder size={14} style={{ color: theme.accent }} />
                <span>Klasör...</span>
              </button>
            </div>
          </div>

          {/* 2. UYGULAMA ADI */}
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1.5" style={{ color: theme.textPrimary }}>
              Uygulama Adı *
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: theme.accentBg,
                  borderColor: theme.cardBorder
                }}
                title="Otomatik Algılanan Logo"
              >
                <AppIcon name={name || 'Uygulama'} icon={icon} customUrl={iconDataUrl} iconDataUrl={iconDataUrl} size={22} />
              </div>
              <input
                data-testid="app-modal-name-input"
                type="text"
                placeholder="Örn: Visual Studio Code"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 text-xs rounded-xl px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* ETİKETLER (İSTEĞE BAĞLI) */}
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1.5" style={{ color: theme.textPrimary }}>
              Etiketler (İsteğe Bağlı)
            </label>
            <input
              data-testid="app-modal-tags-input"
              type="text"
              placeholder="Virgülle ayırın: AI, Geliştirme, Araç, Hızlı"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full text-xs rounded-xl px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-teal-400"
              style={inputStyle}
            />
          </div>

          {/* 5. YÖNETİCİ OLARAK ÇALIŞTIR SEÇENEĞİ */}
          <div
            className="flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer"
            style={{
              backgroundColor: theme.isLight ? 'rgba(241, 245, 249, 0.6)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: theme.cardBorder
            }}
            onClick={() => setRunAsAdmin(!runAsAdmin)}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${runAsAdmin ? 'bg-amber-400/20 text-amber-400' : 'bg-black/5 dark:bg-white/5 opacity-50'}`}
              >
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-wide" style={{ color: theme.textPrimary }}>
                  Yönetici Olarak Çalıştır
                </div>
                <div className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
                  Windows UAC yönetici ayrıcalıklarıyla başlatır
                </div>
              </div>
            </div>
            <input
              data-testid="app-modal-admin-checkbox"
              type="checkbox"
              checked={runAsAdmin}
              onChange={(e) => setRunAsAdmin(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-400 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* ACTIONS */}
          <div
            className="flex items-center justify-end gap-3 pt-3 border-t"
            style={{ borderColor: theme.cardBorder }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              style={{ color: theme.textPrimary }}
            >
              İptal
            </button>
            <button
              data-testid="save-app-modal-btn"
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-102 active:scale-95"
              style={{
                background: theme.buttonPlay,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              <Save size={14} />
              <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Kütüphaneye Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
