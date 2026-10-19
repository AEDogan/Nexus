import React, { useState } from 'react';
import { ThemeConfig, NexusApp } from '../types';
import { 
  X, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Check, 
  Lock,
  Layers
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  apps: NexusApp[];
  onAddCategory: (categoryName: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  theme: ThemeConfig;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  apps,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  theme
}) => {
  const [name, setName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory(name.trim());
    setName('');
  };

  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const handleSaveEdit = (oldName: string) => {
    if (editValue.trim() && editValue.trim() !== oldName) {
      onRenameCategory(oldName, editValue.trim());
    }
    setEditingCategory(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const getAppCount = (cat: string) => {
    if (cat === 'Tümü') return apps.length;
    if (cat === 'Favoriler') return apps.filter((a) => a.favorite).length;
    return apps.filter((a) => a.category === cat).length;
  };

  return (
    <div
      data-testid="category-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        data-testid="category-modal-backdrop"
      />

      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: theme.accentBg,
                border: `1px solid ${theme.cardBorder}`
              }}
            >
              <Layers size={18} style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Grupları & Kategorileri Yönet</h3>
              <p className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>
                Grup ekleyin, adını değiştirin veya kaldırın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            data-testid="close-category-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. YENİ GRUP EKLE FORMU */}
        <form onSubmit={handleAddSubmit} className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
            Yeni Grup / Kategori Ekle
          </label>
          <div className="flex gap-2">
            <input
              data-testid="category-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 3D Modelleme, DevOps..."
              className="flex-1 text-xs rounded-xl px-3.5 py-2 border focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium transition-all"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.cardBorder,
                color: theme.textPrimary
              }}
            />
            <button
              data-testid="save-category-btn"
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-102 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
              style={{
                background: theme.buttonPlay,
                color: '#ffffff'
              }}
            >
              <Plus size={14} /> Ekle
            </button>
          </div>
        </form>

        {/* 2. MEVCUT GRUPLAR LİSTESİ */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
            Mevcut Gruplar ({categories.length})
          </label>
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {categories.map((cat) => {
              const isProtected = cat === 'Tümü' || cat === 'Favoriler';
              const count = getAppCount(cat);
              const isEditingThis = editingCategory === cat;

              return (
                <div
                  key={cat}
                  data-testid={`category-row-${cat}`}
                  className="flex items-center justify-between p-2 rounded-xl border transition-colors group"
                  style={{
                    backgroundColor: theme.isLight ? 'rgba(241, 245, 249, 0.5)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: theme.cardBorder
                  }}
                >
                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(cat);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 text-xs rounded-lg px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.cardBorder,
                          color: theme.textPrimary
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat)}
                        className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
                        title="Kaydet"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-70"
                        title="İptal"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold truncate" style={{ color: theme.textPrimary }}>
                        {cat}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-medium"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.accent,
                          border: `1px solid ${theme.cardBorder}`
                        }}
                      >
                        {count} {count === 1 ? 'öğe' : 'öğe'}
                      </span>
                    </div>
                  )}

                  {/* ACTIONS */}
                  {!isEditingThis && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isProtected ? (
                        <span className="text-[10px] opacity-40 flex items-center gap-1 font-mono px-1.5 py-0.5">
                          <Lock size={10} /> Sistem
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            data-testid={`rename-cat-${cat}`}
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                            title="Grubu Yeniden Adlandır"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-cat-${cat}`}
                            onClick={() => onDeleteCategory(cat)}
                            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                            title="Grubu Kaldır / Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-1 border-t" style={{ borderColor: theme.cardBorder }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            style={{ color: theme.textPrimary }}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
