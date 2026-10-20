import React, { useState, useEffect, useMemo } from 'react';
import { NexusApp, ThemeId, ToastMessage, LayoutMode, SortMode } from './types';
import { THEMES } from './themes';
import { INITIAL_APPS, INITIAL_CATEGORIES } from './initialData';
import { AppCard } from './components/AppCard';
import { AppIcon } from './components/AppIcon';
import { SettingsModal } from './components/SettingsModal';
import { AppModal } from './components/AppModal';
import { CategoryModal } from './components/CategoryModal';
import { ToastContainer } from './components/Toast';
import { NexusLogo, NexusLogoStyle } from './components/NexusLogo';
import {
  Search,
  Settings,
  Plus,
  Clock,
  DownloadCloud,
  X,
  FolderPlus,
  Minus,
  ArrowUpDown,
  ArrowDownAZ,
  ArrowUpZA,
  Flame,
  History,
  Move,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Lock
} from 'lucide-react';

type AppWithRunTime = NexusApp & { lastRunTime?: number };

const getLastRunTime = (app: NexusApp, now: number): number => {
  const timestamp = (app as AppWithRunTime).lastRunTime;
  if (typeof timestamp === 'number' && Number.isFinite(timestamp)) return timestamp;
  const label = app.lastRun?.trim().toLocaleLowerCase('tr');
  if (!label || label === 'henüz çalıştırılmadı') return 0;
  if (label === 'az önce') return now;
  if (label === 'dün') return now - 86400000;
  const relative = label.match(/^(\d+)\s*(dk|dakika|saat|gün|hafta|ay|yıl)\s+önce$/);
  if (relative) {
    const units: Record<string, number> = {
      dk: 60000, dakika: 60000, saat: 3600000, gün: 86400000,
      hafta: 604800000, ay: 2592000000, yıl: 31536000000
    };
    return now - Number(relative[1]) * units[relative[2]];
  }
  const parsed = Date.parse(app.lastRun!);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function App() {
  // --- THEME STATE ---
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('nexus_theme') as ThemeId) || 'neo-mint-glass';
  });
  const currentTheme = THEMES[themeId] || THEMES['neo-mint-glass'];

  // --- GLASS OPACITY STATE (0% to 100%) ---
  const [glassOpacity, setGlassOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_glass_opacity');
    if (saved !== null) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
    return 80;
  });

  useEffect(() => {
    localStorage.setItem('nexus_glass_opacity', String(glassOpacity));
  }, [glassOpacity]);

  // --- WIDGET & LAYOUT MODE STATE ---
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return (localStorage.getItem('nexus_layout_mode') as LayoutMode) || 'right-dock';
  });
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('nexus_is_pinned') === 'true';
  });

  const isInitialLayoutMount = React.useRef(true);

  useEffect(() => {
    localStorage.setItem('nexus_layout_mode', layoutMode);
    if (isInitialLayoutMount.current) {
      isInitialLayoutMount.current = false;
      return;
    }
    if (typeof window !== 'undefined' && (window as any).electronAPI?.setLayoutMode) {
      (window as any).electronAPI.setLayoutMode(layoutMode);
    }
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('nexus_is_pinned', String(isPinned));
    if (typeof window !== 'undefined' && (window as any).electronAPI?.setAlwaysOnTop) {
      (window as any).electronAPI.setAlwaysOnTop(isPinned);
    }
  }, [isPinned]);

  // --- REAL-TIME ADAPTIVE DESKTOP WALLPAPER LUMINANCE ---
  const [wallpaperIsDark, setWallpaperIsDark] = useState<boolean>(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (typeof window !== 'undefined' && (window as any).electronAPI?.getWallpaperLuminance) {
      (window as any).electronAPI.getWallpaperLuminance().then((res: any) => {
        if (res && typeof res.isDark === 'boolean') {
          setWallpaperIsDark(res.isDark);
        }
      }).catch(() => {});

      if ((window as any).electronAPI?.onWallpaperLuminanceChanged) {
        cleanup = (window as any).electronAPI.onWallpaperLuminanceChanged((res: any) => {
          if (res && typeof res.isDark === 'boolean') {
            setWallpaperIsDark(res.isDark);
          }
        });
      }
    }
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_theme', themeId);
    document.body.style.backgroundColor = 'transparent';
  }, [themeId]);

  // --- HEADER LOGO STYLE ---
  const [logoStyle, setLogoStyle] = useState<NexusLogoStyle>(() => {
    return (localStorage.getItem('nexus_header_logo') as NexusLogoStyle) || 'power-bolt';
  });

  const handleCycleLogo = () => {
    const cycle: NexusLogoStyle[] = [
      'power-bolt',
      'neon-vortex',
      'cyber-shield',
      'hyper-x',
      'infinity-loop',
      'falcon-wings',
      'rocket-spark',
      'hex-reactor',
      'cyber-saturn',
      'apex-trident'
    ];
    const currentIndex = cycle.indexOf(logoStyle);
    const nextStyle = cycle[(currentIndex + 1) % cycle.length];
    setLogoStyle(nextStyle);
    localStorage.setItem('nexus_header_logo', nextStyle);
  };

  const handleSelectLogo = (style: NexusLogoStyle) => {
    setLogoStyle(style);
    localStorage.setItem('nexus_header_logo', style);
  };

  // --- APPS & CATEGORIES STATE ---
  const [apps, setApps] = useState<NexusApp[]>(() => {
    const saved = localStorage.getItem('nexus_apps');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) => item && typeof item === 'object' && 'id' in item && 'name' in item
          )
        ) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved apps', e);
      }
    }
    return INITIAL_APPS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved categories', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('nexus_apps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('nexus_categories', JSON.stringify(categories));
  }, [categories]);

  // --- SORT MODE STATE ---
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    return (localStorage.getItem('nexus_sort_mode') as SortMode) || 'custom';
  });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('nexus_sort_mode', sortMode);
  }, [sortMode]);

  // --- RECENT APPS COLLAPSIBLE STATE ---
  const [isRecentOpen, setIsRecentOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_recent_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleRecentOpen = () => {
    setIsRecentOpen((prev) => {
      const next = !prev;
      localStorage.setItem('nexus_recent_open', String(next));
      return next;
    });
  };

  // --- CATEGORIES SCROLL & DRAG-TO-SCROLL STATE ---
  const categoriesRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingCatRef = React.useRef(false);
  const startXCatRef = React.useRef(0);
  const scrollLeftCatRef = React.useRef(0);
  const hasDraggedCatRef = React.useRef(false);

  const checkCategoryScroll = () => {
    const el = categoriesRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkCategoryScroll();
    const handleResize = () => checkCategoryScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoriesRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -160 : 160;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkCategoryScroll, 250);
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    const el = categoriesRef.current;
    if (!el) return;
    isDraggingCatRef.current = true;
    hasDraggedCatRef.current = false;
    startXCatRef.current = e.pageX - el.offsetLeft;
    scrollLeftCatRef.current = el.scrollLeft;
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCatRef.current) return;
    const el = categoriesRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXCatRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedCatRef.current = true;
    }
    el.scrollLeft = scrollLeftCatRef.current - walk;
    checkCategoryScroll();
  };

  const handleCatMouseUpOrLeave = () => {
    isDraggingCatRef.current = false;
    setTimeout(() => {
      hasDraggedCatRef.current = false;
    }, 50);
    checkCategoryScroll();
  };

  const handleCatWheel = (e: React.WheelEvent) => {
    const el = categoriesRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkCategoryScroll();
    }
  };

  // Automatically fetch genuine native Windows icons for all apps with file paths
  const attemptedPathsRef = React.useRef<Set<string>>(new Set());

  const isDummyIcon = (url?: string | null): boolean => {
    if (!url) return true;
    if (url.startsWith('data:image/') && url.length < 500) return true;
    return url.length >= 700 && url.length <= 850 && url.includes('ACAAAAAgCAYAAABz');
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.getFileIcon) return;

    const appsNeedingIcons = apps.filter(
      (item) => item.path && (!item.iconDataUrl || isDummyIcon(item.iconDataUrl)) && !attemptedPathsRef.current.has(item.path)
    );

    if (appsNeedingIcons.length === 0) return;

    let isMounted = true;

    const fetchIcons = async () => {
      let hasChanges = false;
      const updatedApps = [...apps];

      for (const item of appsNeedingIcons) {
        attemptedPathsRef.current.add(item.path);
        try {
          const realIcon = await (window as any).electronAPI.getFileIcon(item.path);
          if (realIcon && !isDummyIcon(realIcon) && isMounted) {
            const index = updatedApps.findIndex((a) => a.id === item.id);
            if (index !== -1) {
              updatedApps[index] = { ...updatedApps[index], iconDataUrl: realIcon };
              hasChanges = true;
            }
          }
        } catch (e) {
          console.warn('Icon auto-extract failed for', item.name);
        }
      }

      if (hasChanges && isMounted) {
        setApps(updatedApps);
        localStorage.setItem('nexus_apps', JSON.stringify(updatedApps));
      }
    };

    fetchIcons();

    return () => {
      isMounted = false;
    };
  }, [apps]);

  // One-time re-extraction with the improved extractor (fixes wrong icons saved by older versions,
  // e.g. Steam .url games that got the generic internet-shortcut glyph)
  useEffect(() => {
    const ICON_REV = '2';
    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!api?.getFileIcon || localStorage.getItem('nexus_icon_rev') === ICON_REV) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, string> = {};
      for (const item of apps) {
        if (!item.path) continue;
        const isShortcut = /\.(lnk|url)$/i.test(item.path);
        if (!isShortcut && item.iconDataUrl && !isDummyIcon(item.iconDataUrl)) continue;
        try {
          const icon = await api.getFileIcon(item.path);
          if (icon && !isDummyIcon(icon)) updates[item.id] = icon;
        } catch {
          // ignore
        }
      }
      if (cancelled) return;
      if (Object.keys(updates).length > 0) {
        setApps((prev) => prev.map((a) => (updates[a.id] ? { ...a, iconDataUrl: updates[a.id] } : a)));
      }
      localStorage.setItem('nexus_icon_rev', ICON_REV);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- SETTINGS TOGGLES ---
  const [autoStart, setAutoStart] = useState(() => localStorage.getItem('nexus_auto_start') === 'true');
  const [autoDiscover, setAutoDiscover] = useState(() => localStorage.getItem('nexus_auto_discover') !== 'false');
  const [forceKill, setForceKill] = useState(() => localStorage.getItem('nexus_force_kill') === 'true');

  useEffect(() => { localStorage.setItem('nexus_auto_start', String(autoStart)); }, [autoStart]);
  useEffect(() => { localStorage.setItem('nexus_auto_discover', String(autoDiscover)); }, [autoDiscover]);
  useEffect(() => { localStorage.setItem('nexus_force_kill', String(forceKill)); }, [forceKill]);

  // --- UI STATES ---
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] = useState<{
    x: number;
    y: number;
    category: string;
  } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<NexusApp | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Drag and Drop States
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  const [isDraggingExternal, setIsDraggingExternal] = useState<boolean>(false);
  const dragCounterRef = React.useRef(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Close menus on outside click or scroll
  useEffect(() => {
    const handleClose = () => {
      setActiveMenuId(null);
      setIsSortMenuOpen(false);
      setCategoryContextMenu(null);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  // --- ACTIONS ---
  const launchingSetRef = React.useRef<Set<string>>(new Set());

  const handleLaunch = async (app: NexusApp) => {
    if (launchingSetRef.current.has(app.id)) return;
    launchingSetRef.current.add(app.id);

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.launchApp) {
        try {
          const res = await (window as any).electronAPI.launchApp({
            path: app.path,
            arguments: app.arguments,
            workingDirectory: app.workingDirectory,
            type: app.type
          });

          if (res && res.success === false) {
            addToast('Uygulama Başlatılamadı', res.error || 'Bilinmeyen hata', 'error');
            return;
          }
        } catch (err: any) {
          console.error('Launch failed via Electron', err);
          addToast('Uygulama Başlatılamadı', err?.message || 'Bilinmeyen hata', 'error');
          return;
        }
      }

      setApps((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: 'running',
                lastRun: 'Az önce',
                lastRunTime: Date.now(),
                runCount: (item.runCount || 0) + 1
              }
            : item
        )
      );

      if (app.type === 'group') {
        const subList = app.subApps ? app.subApps.join(' ➔ ') : 'Araçlar';
        addToast(
          'Çalışma Grubu Başlatılıyor',
          `${app.name} ortamı sıralı hazırlanıyor: ${subList}`,
          'success'
        );
      } else if (app.type === 'project') {
        addToast(
          'Proje Çalışma Alanı Açıldı',
          `${app.name} projesi (${app.path || 'Yerel'}) başlatıldı.`,
          'success'
        );
      } else {
        addToast(
          'Uygulama Başlatıldı',
          `${app.name} (${app.type.toUpperCase()}) başarıyla çalıştırıldı.`,
          'success'
        );
      }
    } finally {
      setTimeout(() => launchingSetRef.current.delete(app.id), 1200);
    }
  };

  const handleStop = (app: NexusApp) => {
    setApps((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: 'idle' } : item))
    );
    addToast('Uygulama Kapatıldı', `${app.name} süreci sonlandırıldı.`, 'info');
  };

  const handleRestart = (app: NexusApp) => {
    handleStop(app);
    setTimeout(() => {
      handleLaunch(app);
      addToast('Yeniden Başlatıldı', `${app.name} yeniden başlatılıyor.`, 'info');
    }, 400);
  };

  const handleToggleFavorite = (app: NexusApp) => {
    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, favorite: !item.favorite } : item
      )
    );
    addToast(
      app.favorite ? 'Favorilerden Çıkarıldı' : 'Favorilere Eklendi',
      `${app.name} favori durumu güncellendi.`,
      'info'
    );
  };

  const handleRemoveApp = (app: NexusApp) => {
    setApps((prev) => prev.filter((item) => item.id !== app.id));
    addToast('Kütüphaneden Kaldırıldı', `${app.name} listeden silindi.`, 'warning');
  };

  const handleSaveApp = (appData: Partial<NexusApp>) => {
    if (appData.id) {
      setApps((prev) =>
        prev.map((item) =>
          item.id === appData.id ? ({ ...item, ...appData } as NexusApp) : item
        )
      );
      addToast('Uygulama Güncellendi', `${appData.name} detayları kaydedildi.`, 'success');
    } else {
      const fallbackCat = activeCategory !== 'Tümü' && activeCategory !== 'Favoriler'
        ? activeCategory
        : (categories.find((c) => c !== 'Tümü' && c !== 'Favoriler') || 'Genel');

      const newApp: NexusApp = {
        id: `app-${Date.now()}`,
        name: appData.name || 'Yeni Uygulama',
        category: appData.category || fallbackCat,
        type: appData.type || 'exe',
        path: appData.path || '',
        arguments: appData.arguments || '',
        workingDirectory: appData.workingDirectory || '',
        runAsAdmin: Boolean(appData.runAsAdmin),
        version: appData.version || '1.0.0',
        description: appData.description || '',
        icon: appData.icon || (appData.type === 'project' ? 'Folder' : (appData.name || 'AppWindow')),
        iconDataUrl: appData.iconDataUrl,
        favorite: false,
        tags: appData.tags || ['Genel'],
        lastRun: 'Henüz çalıştırılmadı',
        runCount: 0,
        status: 'idle'
      };
      setApps((prev) => [newApp, ...prev]);
      addToast('Uygulama Eklendi', `${newApp.name} kütüphaneye eklendi.`, 'success');
    }
  };

  const handleAddCategory = (catName: string) => {
    if (!categories.includes(catName)) {
      setCategories((prev) => [...prev, catName]);
      setActiveCategory(catName);
      addToast('Kategori Eklendi', `"${catName}" kategorisi oluşturuldu.`, 'success');
    } else {
      setActiveCategory(catName);
      addToast('Kategori Mevcut', `"${catName}" zaten mevcut.`, 'info');
    }
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    const trimmed = newName.trim();
    if (categories.includes(trimmed)) {
      addToast('Kategori Mevcut', `"${trimmed}" adında bir kategori zaten var.`, 'error');
      return;
    }
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setApps((prev) =>
      prev.map((app) => (app.category === oldName ? { ...app, category: trimmed } : app))
    );
    if (activeCategory === oldName) {
      setActiveCategory(trimmed);
    }
    addToast('Kategori Güncellendi', `"${oldName}" grubu "${trimmed}" olarak yeniden adlandırıldı.`, 'success');
  };

  const handleDeleteCategory = (catName: string) => {
    if (catName === 'Tümü' || catName === 'Favoriler') {
      addToast('Silinemez', 'Sistem kategorileri kaldırılamaz.', 'error');
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== catName));
    const fallbackCategory = categories.find((c) => c !== catName && c !== 'Tümü' && c !== 'Favoriler') || 'Genel';
    setApps((prev) =>
      prev.map((app) => (app.category === catName ? { ...app, category: fallbackCategory } : app))
    );
    if (activeCategory === catName) {
      setActiveCategory('Tümü');
    }
    addToast('Kategori Kaldırıldı', `"${catName}" grubu kaldırıldı. Uygulamaları "${fallbackCategory}" grubuna taşındı.`, 'info');
  };

  const handleResetLibrary = () => {
    setApps(INITIAL_APPS);
    setCategories(INITIAL_CATEGORIES);
    setSortMode('custom');
    addToast('Kütüphane Sıfırlandı', 'Varsayılan veri seti başarıyla geri yüklendi.', 'info');
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, app: NexusApp) => {
    setDraggedAppId(app.id);
    e.dataTransfer.setData('text/plain', app.id);
    e.dataTransfer.setData('application/nexus-app', app.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, app: NexusApp) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverAppId !== app.id) {
      setDragOverAppId(app.id);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, app: NexusApp) => {
    if (dragOverAppId === app.id) {
      setDragOverAppId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetApp: NexusApp) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDropFiles(e.dataTransfer.files);
      setDraggedAppId(null);
      setDragOverAppId(null);
      return;
    }
    const draggedId = draggedAppId || e.dataTransfer.getData('application/nexus-app') || e.dataTransfer.getData('text/plain');
    const targetId = targetApp.id;
    if (!draggedId || draggedId === targetId) {
      setDraggedAppId(null);
      setDragOverAppId(null);
      return;
    }

    setApps((prev) => {
      const sourceIndex = prev.findIndex((app) => app.id === draggedId);
      const targetIndex = prev.findIndex((app) => app.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const updated = [...prev];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });
    setSortMode('custom');

    setDraggedAppId(null);
    setDragOverAppId(null);
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverAppId(null);
    setDragOverCat(null);
  };

  // Drop onto category tab: moves app between categories or adds dropped external shortcut
  const handleDropOnCategory = (e: React.DragEvent, targetCat: string) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. External file dropped directly onto a category tab
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDropFiles(e.dataTransfer.files, targetCat);
      setDragOverCat(null);
      setDraggedAppId(null);
      return;
    }

    // 2. Internal app card dropped onto a category tab
    const draggedId = draggedAppId || e.dataTransfer.getData('application/nexus-app') || e.dataTransfer.getData('text/plain');
    if (!draggedId) {
      setDragOverCat(null);
      return;
    }

    const appToMove = apps.find((a) => a.id === draggedId);
    if (!appToMove) {
      setDragOverCat(null);
      setDraggedAppId(null);
      return;
    }

    if (targetCat === 'Favoriler') {
      if (appToMove.favorite) {
        addToast('Bilgi', `"${appToMove.name}" zaten favorilerde.`, 'info');
      } else {
        setApps((prev) =>
          prev.map((a) => (a.id === draggedId ? { ...a, favorite: true } : a))
        );
        addToast('Favorilere Eklendi', `"${appToMove.name}" favorilere eklendi.`, 'success');
      }
    } else if (targetCat === 'Tümü') {
      addToast('Bilgi', `"${appToMove.name}" zaten tüm uygulamalar listesinde bulunuyor.`, 'info');
    } else if (appToMove.category === targetCat) {
      addToast('Zaten Bu Grupta', `"${appToMove.name}" zaten "${targetCat}" grubunda.`, 'info');
    } else {
      setApps((prev) =>
        prev.map((a) => (a.id === draggedId ? { ...a, category: targetCat } : a))
      );
      addToast('Kategori Değiştirildi', `"${appToMove.name}" -> "${targetCat}" grubuna taşındı.`, 'success');
    }

    setDragOverCat(null);
    setDraggedAppId(null);
  };

  // Handle external files (shortcuts, exes, scripts) dropped from Windows Explorer / Desktop
  const handleDropFiles = async (files: FileList | File[], targetCat?: string) => {
    const destinationCat = (targetCat && targetCat !== 'Tümü' && targetCat !== 'Favoriler')
      ? targetCat
      : (activeCategory !== 'Tümü' && activeCategory !== 'Favoriler'
          ? activeCategory
          : (categories.find((c) => c !== 'Tümü' && c !== 'Favoriler') || 'Genel'));

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newApps: NexusApp[] = [];

    for (const file of fileList) {
      let filePath = '';
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getPathForFile) {
        try {
          filePath = (window as any).electronAPI.getPathForFile(file) || '';
        } catch {
          filePath = '';
        }
      }
      if (!filePath) {
        filePath = (file as any).path || file.name || '';
      }

      let fileName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Yeni Kısayol';
      let detectedType: NexusApp['type'] = 'exe';
      let iconDataUrl: string | undefined = undefined;

      // Extract file info and native icon from electron if available
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getFileInfo && filePath) {
        try {
          const info = await (window as any).electronAPI.getFileInfo(filePath);
          if (info) {
            if (info.fileName) fileName = info.fileName;
            if (info.detectedType) detectedType = info.detectedType;
            if (info.iconDataUrl) iconDataUrl = info.iconDataUrl;
          }
        } catch (err) {
          console.warn('Failed to resolve file info:', err);
        }
      } else if (typeof window !== 'undefined' && (window as any).electronAPI?.getFileIcon && filePath) {
        try {
          const iconUrl = await (window as any).electronAPI.getFileIcon(filePath);
          if (iconUrl) iconDataUrl = iconUrl;
        } catch {
          // ignore
        }
      }

      const ext = filePath.split('.').pop()?.toLowerCase();
      if (ext === 'bat') detectedType = 'bat';
      else if (ext === 'cmd') detectedType = 'cmd';
      else if (ext === 'ps1') detectedType = 'ps1';

      const newApp: NexusApp = {
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: fileName,
        category: destinationCat,
        type: detectedType,
        path: filePath,
        arguments: '',
        workingDirectory: '',
        runAsAdmin: false,
        version: '1.0.0',
        description: `Sürükle-bırak ile eklendi: ${fileName}`,
        icon: detectedType === 'project' ? 'Folder' : (fileName || 'AppWindow'),
        iconDataUrl,
        favorite: false,
        tags: ['Masaüstü', destinationCat],
        lastRun: 'Henüz çalıştırılmadı',
        runCount: 0,
        status: 'idle'
      };

      newApps.push(newApp);
    }

    if (newApps.length > 0) {
      setApps((prev) => [...newApps, ...prev]);
      if (newApps.length === 1) {
        addToast('Kısayol Eklendi', `"${newApps[0].name}" doğrudan "${destinationCat}" kategorisine eklendi.`, 'success');
      } else {
        addToast('Kısayollar Eklendi', `${newApps.length} adet kısayol "${destinationCat}" kategorisine eklendi.`, 'success');
      }
    }
  };

  // Window drag listeners for external file drop
  const handleWindowDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      dragCounterRef.current += 1;
      setIsDraggingExternal(true);
    }
  };

  const handleWindowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleWindowDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingExternal(false);
      }
    }
  };

  const handleWindowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingExternal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDropFiles(e.dataTransfer.files);
    }
  };

  // Electron Window Controls
  const handleMinimize = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.windowControl) {
      (window as any).electronAPI.windowControl('minimize');
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.windowControl) {
      (window as any).electronAPI.windowControl('close');
    }
  };

  // --- FILTERED APPS ---
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return apps.filter((app) => {
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.tags.some((tag) => tag.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === 'Tümü') return true;
      if (activeCategory === 'Favoriler') return app.favorite;
      return app.category === activeCategory;
    });
  }, [apps, activeCategory, searchQuery]);

  // --- SORTED APPS ---
  const sortedApps = useMemo(() => {
    const list = [...filteredApps];
    switch (sortMode) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
      case 'most-used':
        return list.sort((a, b) => (b.runCount || 0) - (a.runCount || 0));
      case 'recently-used':
        const now = Date.now();
        return list.sort((a, b) => getLastRunTime(b, now) - getLastRunTime(a, now));
      case 'custom':
      default:
        return list;
    }
  }, [filteredApps, sortMode]);

  // --- RECENT APPS ---
  const recentApps = useMemo(() => {
    const now = Date.now();
    return [...apps]
      .filter((a) => getLastRunTime(a, now) > 0)
      .sort((a, b) => getLastRunTime(b, now) - getLastRunTime(a, now))
      .slice(0, 5);
  }, [apps]);

  // --- DYNAMIC GLASS TRANSPARENCY STYLING ---
  const hexToRgba = (hex: string, alpha: number): string => {
    if (!hex) return `rgba(240, 253, 249, ${alpha})`;
    if (hex.startsWith('rgba')) {
      return hex.replace(/[\d.]+\)$/, `${alpha})`);
    }
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map((char) => char + char).join('');
    }
    if (c.length === 6) {
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
  };

  const factor = Math.max(0, Math.min(100, glassOpacity)) / 100;
  // Dynamic Card Transparency: at 0% opacity cards are crystal sheer (0.10 - 0.15), at 80% default they are clean translucent glass (~0.35 - 0.45), at 100% solid
  const minCardAlpha = currentTheme.isLight ? 0.08 : 0.06;
  const maxCardAlpha = currentTheme.isLight ? 0.65 : 0.60;
  const cardAlpha = minCardAlpha + (maxCardAlpha - minCardAlpha) * factor;
  const computedCardBg = currentTheme.isLight
    ? `rgba(255, 255, 255, ${cardAlpha.toFixed(2)})`
    : `rgba(16, 22, 34, ${cardAlpha.toFixed(2)})`;

  const minBgAlpha = currentTheme.isLight ? 0.02 : 0.05;
  const maxBgAlpha = currentTheme.isLight ? 0.82 : 0.88;
  const bgAlpha = minBgAlpha + (maxBgAlpha - minBgAlpha) * factor;
  const computedBg = hexToRgba(currentTheme.bodyBg, bgAlpha);

  const computedOverlay = glassOpacity >= 25 ? currentTheme.gradientOverlay : 'none';

  const isDock = layoutMode === 'right-dock';
  const isFloating = layoutMode === 'floating-widget';

  const sortOptions = [
    { id: 'custom', label: 'Özel (Sürükle-Bırak)', icon: Move },
    { id: 'name-asc', label: 'A-Z (Alfabetik)', icon: ArrowDownAZ },
    { id: 'name-desc', label: 'Z-A (Ters Alfabetik)', icon: ArrowUpZA },
    { id: 'most-used', label: 'En Çok Çalıştırılan', icon: Flame },
    { id: 'recently-used', label: 'Son Çalıştırılan', icon: History }
  ] as const;

  const adaptiveTextColor = wallpaperIsDark
    ? (currentTheme.textLuminous || (currentTheme.isLight ? '#f8fafc' : currentTheme.textPrimary))
    : currentTheme.textPrimary;

  const adaptiveTextShadow = wallpaperIsDark
    ? '0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px rgba(0, 0, 0, 0.95)'
    : '0 1px 1px rgba(255, 255, 255, 0.85)';

  return (
    <div
      data-testid="nexus-container"
      onDragEnter={handleWindowDragEnter}
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      className={`min-h-screen font-sans flex flex-col selection:bg-teal-500/20 select-none overflow-x-hidden relative transition-colors duration-300 rounded-[32px] overflow-hidden ${
        isDock ? 'p-3 sm:p-4' : 'p-5 sm:p-6'
      }`}
      style={{
        backgroundColor: computedBg,
        backgroundImage: computedOverlay,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        color: currentTheme.textPrimary
      }}
    >
      {/* EXTERNAL FILE DROP OVERLAY */}
      {isDraggingExternal && (
        <div
          data-testid="file-drop-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 pointer-events-none transition-all duration-200 animate-in fade-in"
          style={{
            backgroundColor: currentTheme.isLight ? 'rgba(240, 249, 255, 0.88)' : 'rgba(10, 15, 26, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="w-full max-w-md p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-150"
            style={{
              borderColor: currentTheme.accent,
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              boxShadow: `0 25px 60px -15px ${currentTheme.accent}40`
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-bounce"
              style={{
                backgroundColor: currentTheme.accent,
                color: '#ffffff'
              }}
            >
              <DownloadCloud size={32} />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: currentTheme.textPrimary }}>
              Kısayolu Buraya Bırakın
            </h3>
            <p className="text-xs font-medium" style={{ color: currentTheme.textSecondary }}>
              Otomatik olarak <span className="font-bold underline" style={{ color: currentTheme.accent }}>
                "{activeCategory !== 'Tümü' && activeCategory !== 'Favoriler' ? activeCategory : (categories.find((c) => c !== 'Tümü' && c !== 'Favoriler') || 'Genel')}"
              </span> grubuna eklenecek
            </p>
          </div>
        </div>
      )}

      {/* UNIFIED TOP TOOLBAR & WINDOW DRAG REGION (MINIMIZED) */}
      <div 
        className="drag-region flex items-center justify-between pb-2 mb-2.5 border-b transition-colors select-none"
        style={{ borderColor: currentTheme.cardBorder }}
      >
        {/* BRAND & LOGO */}
        <div className="no-drag flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Nexus Logo"
            onClick={handleCycleLogo}
            className="w-7 h-7 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            <NexusLogo styleId={logoStyle} size={22} className="drop-shadow-[0_0_8px_rgba(45,212,191,0.7)]" />
          </button>
          <div className="flex items-center">
            <span className="text-sm font-bold tracking-wider drop-shadow-sm font-mono" style={{ color: currentTheme.textPrimary }}>
              NEXUS
            </span>
          </div>
        </div>

        {/* MIDDLE DRAG HANDLE REGION */}
        <div className="flex-1 h-7 cursor-grab active:cursor-grabbing mx-2" title="Pencereyi Taşımak İçin Sürükleyin" />

        {/* RIGHT ACTIONS & WINDOW CONTROLS */}
        <div className="no-drag flex items-center gap-1 shrink-0">
          <button
            data-testid="add-app-btn"
            onClick={() => {
              setEditingApp(null);
              setIsAppModalOpen(true);
            }}
            className="p-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-xs"
            style={{
              backgroundColor: computedCardBg,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary,
              backdropFilter: currentTheme.glassBackdrop
            }}
            title="Yeni Uygulama Ekle"
          >
            <Plus size={14} />
          </button>

          <button
            data-testid="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-xs"
            style={{
              backgroundColor: computedCardBg,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary,
              backdropFilter: currentTheme.glassBackdrop
            }}
            title="Ayarlar & Temalar"
          >
            <Settings size={14} />
          </button>

          <div className="w-[1px] h-3.5 bg-black/10 dark:bg-white/10 mx-0.5" />

          <button
            data-testid="window-minimize-btn"
            onClick={handleMinimize}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            title="Küçült"
          >
            <Minus size={13} />
          </button>
          <button
            data-testid="window-close-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
            title="Kapat"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR ROW (SLEEK & FULL-WIDTH) */}
      <div className="relative w-full mb-3 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={13} style={{ color: currentTheme.textPrimary }} />
        </div>
        <input
          data-testid="search-input"
          type="text"
          placeholder="Gör ➔ Bul ➔ Başlat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs rounded-full py-1.5 pl-8 pr-7 border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
          style={{
            backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.88)',
            borderColor: currentTheme.cardBorder,
            color: currentTheme.textPrimary,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: currentTheme.isLight ? '0 2px 10px rgba(13, 148, 136, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.8)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}
        />
        {searchQuery && (
          <button
            data-testid="clear-search-btn"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center opacity-70 hover:opacity-100"
            style={{ color: currentTheme.textPrimary }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* CATEGORY & SORT BAR */}
      <div className="flex items-center gap-1.5 mb-3 select-none relative">
        {/* LEFT SCROLL ARROW (Visible when scrolled right) */}
        {canScrollLeft && (
          <button
            type="button"
            data-testid="category-scroll-left-btn"
            onClick={() => scrollCategories('left')}
            className="w-7 h-7 rounded-full border shadow-xs shrink-0 transition-all hover:scale-110 active:scale-95 z-10 inline-flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary
            }}
            title="Sola Kaydır"
          >
            <ChevronLeft size={14} className="stroke-[2.2]" />
          </button>
        )}

        {/* Categories Bar with Drag-to-Scroll and Horizontal Mouse Wheel */}
        <div
          ref={categoriesRef}
          onScroll={checkCategoryScroll}
          onMouseDown={handleCatMouseDown}
          onMouseMove={handleCatMouseMove}
          onMouseUp={handleCatMouseUpOrLeave}
          onMouseLeave={handleCatMouseUpOrLeave}
          onWheel={handleCatWheel}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 cursor-grab active:cursor-grabbing py-1.5 px-1 -my-1.5 -mx-1"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const isSystem = cat === 'Tümü' || cat === 'Favoriler';
            const isDragTarget = dragOverCat === cat;
            return (
              <button
                key={cat}
                data-testid={`category-tab-${cat}`}
                onClick={(e) => {
                  if (hasDraggedCatRef.current) {
                    e.preventDefault();
                    return;
                  }
                  setActiveCategory(cat);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCat !== cat) {
                    setDragOverCat(cat);
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverCat === cat) {
                    setDragOverCat(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDropOnCategory(e, cat);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCategoryContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    category: cat
                  });
                }}
                className={`h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shadow-xs hover:scale-102 active:scale-95 inline-flex items-center justify-center leading-none ${
                  isDragTarget ? 'scale-110 ring-2 ring-teal-400 font-bold' : ''
                }`}
                style={{
                  backgroundColor: isDragTarget
                    ? (currentTheme.isLight ? 'rgba(45, 212, 191, 0.35)' : 'rgba(20, 184, 166, 0.45)')
                    : isActive 
                      ? currentTheme.accent 
                      : (currentTheme.isLight ? 'rgba(255, 255, 255, 0.70)' : 'rgba(15, 23, 42, 0.70)'),
                  borderColor: isDragTarget ? '#2dd4bf' : (isActive ? currentTheme.accent : currentTheme.cardBorder),
                  color: isDragTarget || isActive ? '#ffffff' : currentTheme.textPrimary,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: isDragTarget
                    ? '0 0 15px rgba(45, 212, 191, 0.6)'
                    : (isActive ? `0 2px 12px -2px ${currentTheme.accent}` : '0 1px 4px rgba(0,0,0,0.06)')
                }}
                title={isSystem ? `${cat} (Sistem Grubu)` : `${cat} (Sürükleyip buraya bırakarak taşıyabilirsiniz. Silmek/düzenlemek için sağ tıklayın)`}
              >
                {cat}
              </button>
            );
          })}

          <button
            data-testid="add-category-btn"
            onClick={(e) => {
              if (hasDraggedCatRef.current) {
                e.preventDefault();
                return;
              }
              setIsCategoryModalOpen(true);
            }}
            className="h-7 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap border border-dashed transition-all inline-flex items-center justify-center gap-1 shadow-xs hover:scale-102 active:scale-95 leading-none"
            style={{
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.65)',
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            title="Grupları & Kategorileri Yönet (Ekle, Yeniden Adlandır, Sil)"
          >
            <FolderPlus size={13} /> + Kategori / Yönet
          </button>
        </div>

        {/* RIGHT SCROLL ARROW (Right before Sort button, exactly where user circled!) */}
        {canScrollRight && (
          <button
            type="button"
            data-testid="category-scroll-right-btn"
            onClick={() => scrollCategories('right')}
            className="w-7 h-7 rounded-full border shadow-xs shrink-0 transition-all hover:scale-110 active:scale-95 z-10 inline-flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              borderColor: currentTheme.accent,
              color: currentTheme.accent
            }}
            title="Sağa Kaydır"
          >
            <ChevronRight size={14} className="stroke-[2.2]" />
          </button>
        )}

        {/* SORT / FILTER CONTROLS DROPDOWN */}
        <div className="relative shrink-0 flex items-center no-drag">
          <button
            data-testid="sort-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsSortMenuOpen(!isSortMenuOpen);
            }}
            className="w-7 h-7 rounded-full border transition-all duration-200 hover:scale-102 shadow-xs inline-flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isSortMenuOpen 
                ? currentTheme.accent 
                : (currentTheme.isLight ? 'rgba(255, 255, 255, 0.70)' : 'rgba(15, 23, 42, 0.70)'),
              borderColor: isSortMenuOpen ? currentTheme.accent : currentTheme.cardBorder,
              color: isSortMenuOpen ? '#ffffff' : currentTheme.textPrimary,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            title="Sıralama ve Filtreleme Seçenekleri"
          >
            <ArrowUpDown size={13} className="stroke-[2.2]" style={{ color: isSortMenuOpen ? '#ffffff' : currentTheme.accent }} />
          </button>

          {isSortMenuOpen && (
            <div
              data-testid="sort-dropdown-menu"
              className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl p-1.5 shadow-2xl border z-50 animate-fadeIn"
              style={{
                backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(20, 24, 33, 0.96)',
                borderColor: currentTheme.cardBorder,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 opacity-50" style={{ color: currentTheme.textSecondary }}>
                Sıralama Modu
              </div>
              {sortOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = sortMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    data-testid={`sort-option-${opt.id}`}
                    onClick={() => {
                      setSortMode(opt.id as SortMode);
                      setIsSortMenuOpen(false);
                      addToast('Sıralama Değiştirildi', `${opt.label} uygulandı.`, 'info');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left font-medium"
                    style={{
                      backgroundColor: isSelected ? currentTheme.accentBg : 'transparent',
                      color: isSelected ? currentTheme.accent : currentTheme.textPrimary
                    }}
                  >
                    <IconComponent size={13} style={{ color: isSelected ? currentTheme.accent : currentTheme.textSecondary }} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORY CONTEXT MENU (Right Click) */}
        {categoryContextMenu && (
          <div
            data-testid="category-context-menu"
            className="fixed rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden w-52"
            style={{
              top: `${Math.max(10, Math.min(categoryContextMenu.y, window.innerHeight - 170))}px`,
              left: `${Math.max(10, Math.min(categoryContextMenu.x, window.innerWidth - 220))}px`,
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(16, 19, 26, 0.96)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: `1px solid ${currentTheme.cardBorder}`,
              boxShadow: currentTheme.isLight
                ? '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                : '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-3.5 py-2 border-b flex items-center justify-between"
              style={{
                borderColor: currentTheme.cardBorder,
                backgroundColor: currentTheme.isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: currentTheme.accent }}>
                {categoryContextMenu.category}
              </span>
              {(categoryContextMenu.category === 'Tümü' || categoryContextMenu.category === 'Favoriler') && (
                <span className="text-[10px] opacity-50 flex items-center gap-1 font-mono">
                  <Lock size={10} /> Sistem
                </span>
              )}
            </div>

            <div className="py-1">
              {categoryContextMenu.category !== 'Tümü' && categoryContextMenu.category !== 'Favoriler' ? (
                <>
                  <button
                    type="button"
                    data-testid={`context-delete-cat-${categoryContextMenu.category}`}
                    onClick={() => {
                      const catToDelete = categoryContextMenu.category;
                      setCategoryContextMenu(null);
                      handleDeleteCategory(catToDelete);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-left flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-500" />
                    <span>Kategoriyi Sil</span>
                  </button>
                  <button
                    type="button"
                    data-testid="context-manage-cat-btn"
                    onClick={() => {
                      setCategoryContextMenu(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    <Edit3 size={13} />
                    <span>Düzenle / Yeniden Adlandır</span>
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setCategoryContextMenu(null);
                  setIsCategoryModalOpen(true);
                }}
                className="w-full px-3.5 py-2 text-xs font-medium text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: currentTheme.textPrimary }}
              >
                <FolderPlus size={13} />
                <span>Kategorileri Yönet...</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE SON KULLANILANLAR (RECENT APPS) */}
      {recentApps.length > 0 && (
        <div
          data-testid="recent-apps-section"
          className="mb-3.5 rounded-2xl transition-all duration-300 overflow-hidden shadow-xs relative"
          style={{
            backgroundColor: computedCardBg,
            backdropFilter: currentTheme.glassBackdrop
          }}
        >
          {/* HEADER: CLOCK + TITLE + COUNT + DOWN ARROW TOGGLE */}
          <div
            data-testid="recent-apps-toggle"
            onClick={toggleRecentOpen}
            className="flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
            title={isRecentOpen ? 'Son Kullanılanları Gizle' : 'Son Kullanılanları Göster'}
          >
            <div className="flex items-center gap-2">
              <Clock size={13} style={{ color: currentTheme.accent }} />
              <span 
                className="text-xs font-bold tracking-wider uppercase" 
                style={{ 
                  color: adaptiveTextColor,
                  textShadow: adaptiveTextShadow
                }}
              >
                Son Kullanılanlar
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: currentTheme.badgeBg,
                  color: currentTheme.accent
                }}
              >
                {recentApps.length}
              </span>
            </div>

            <button
              type="button"
              data-testid="recent-apps-chevron-btn"
              className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-transform duration-200"
              style={{
                color: adaptiveTextColor,
                transform: isRecentOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* HORIZONTAL LOGOS ROW (COLLAPSIBLE CONTENT) */}
          {isRecentOpen && (
            <div
              className="px-3.5 pb-3 pt-1 flex items-center gap-3 overflow-x-auto custom-scrollbar animate-in slide-in-from-top-1 duration-200"
            >
              {recentApps.map((app) => {
                const formattedTime = app.lastRunTime 
                  ? new Date(app.lastRunTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  : 'Çalıştırıldı';

                return (
                  <div
                    key={app.id}
                    data-testid={`recent-item-${app.id}`}
                    onClick={() => handleLaunch(app)}
                    className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl cursor-pointer hover:bg-teal-500/10 active:scale-95 transition-all duration-150 group shrink-0 w-16"
                    title={`${app.name} (Son: ${formattedTime})`}
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center shrink-0 drop-shadow-sm group-hover:scale-110 group-active:scale-90 transition-transform duration-150"
                    >
                      <AppIcon name={app.name} icon={app.icon} customUrl={app.iconDataUrl} iconDataUrl={app.iconDataUrl} size={28} />
                    </div>
                    <span
                      className="text-[10px] font-bold text-center truncate w-full group-hover:text-teal-400 transition-colors"
                      style={{ 
                        color: adaptiveTextColor,
                        textShadow: adaptiveTextShadow
                      }}
                    >
                      {app.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPACT APP GRID */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
        {sortedApps.length === 0 ? (
          <div
            className="flex-1 min-h-[200px] flex flex-col items-center justify-center rounded-3xl p-6 text-center border border-dashed"
            style={{ borderColor: currentTheme.cardBorder }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
              style={{ backgroundColor: currentTheme.accentBg }}
            >
              <Search size={18} style={{ color: currentTheme.accent }} />
            </div>
            <h3 className="text-xs font-semibold mb-1">
              {searchQuery ? 'Eşleşen Öğe Bulunamadı' : 'Kütüphane Boş'}
            </h3>
            <p className="text-[11px] max-w-xs mb-3" style={{ color: currentTheme.textSecondary }}>
              {searchQuery
                ? `"${searchQuery}" aramanız için kütüphanede kayıt yok.`
                : 'Henüz uygulama veya kısayol eklenmedi. Masaüstünden veya klasörden sürükleyip bırakabilir ya da "Ekle" butonuyla ekleyebilirsiniz.'}
            </p>
            <button
              data-testid="empty-add-btn"
              onClick={() => {
                setEditingApp(null);
                setIsAppModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
              style={{
                background: currentTheme.buttonPlay,
                color: '#ffffff'
              }}
            >
              <Plus size={13} /> Yeni Bir Tane Ekle
            </button>
          </div>
        ) : (
          <div className={`grid ${
            isDock 
              ? 'grid-cols-2 gap-2 pb-6' 
              : isFloating 
                ? 'grid-cols-2 gap-2 pb-6'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 pb-12'
          }`}>
            {sortedApps.map((app, index) => (
              <AppCard
                key={app.id}
                app={app}
                index={index}
                theme={{
                  ...currentTheme,
                  cardBg: computedCardBg
                }}
                wallpaperIsDark={wallpaperIsDark}
                draggable={true}
                isDragging={draggedAppId === app.id}
                isDragOver={dragOverAppId === app.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                activeMenuId={activeMenuId}
                onOpenMenu={(id) => setActiveMenuId(id)}
                onCloseMenu={() => setActiveMenuId(null)}
                onLaunch={handleLaunch}
                onStop={handleStop}
                onRestart={handleRestart}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(item) => {
                  setEditingApp(item);
                  setIsAppModalOpen(true);
                }}
                onOpenLocation={(item) => {
                  addToast(
                    'Konum Açılıyor',
                    `${item.path || item.workingDirectory || 'Klasör'} Explorer ile açılıyor.`,
                    'info'
                  );
                }}
                onRemove={handleRemoveApp}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(id) => {
          setThemeId(id);
          addToast('Tema Uygulandı', `${THEMES[id].name} teması başarıyla aktifleştirildi.`, 'success');
        }}
        glassOpacity={glassOpacity}
        onGlassOpacityChange={setGlassOpacity}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        currentLogo={logoStyle}
        onSelectLogo={handleSelectLogo}
        autoStart={autoStart}
        onToggleAutoStart={() => setAutoStart(!autoStart)}
        autoDiscover={autoDiscover}
        onToggleAutoDiscover={() => setAutoDiscover(!autoDiscover)}
        forceKill={forceKill}
        onToggleForceKill={() => setForceKill(!forceKill)}
        onResetLibrary={handleResetLibrary}
      />

      <AppModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
        categories={categories}
        initialApp={editingApp}
        defaultCategory={activeCategory}
        theme={currentTheme}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        apps={apps}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        theme={currentTheme}
      />

      {/* TOAST NOTIFICATIONS */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        theme={currentTheme}
      />
    </div>
  );
}
