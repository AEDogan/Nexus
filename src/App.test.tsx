import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import { DEMO_APPS, DEMO_CATEGORIES } from './initialData';

describe('NEXUS Comprehensive User Interaction Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('nexus_apps', JSON.stringify(DEMO_APPS));
    localStorage.setItem('nexus_categories', JSON.stringify(DEMO_CATEGORIES));
  });

  it('renders clean empty state on fresh install when no apps exist in localStorage', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByText('Kütüphane Boş')).toBeDefined();
    expect(screen.getByText(/Henüz uygulama veya kısayol eklenmedi/)).toBeDefined();
    expect(screen.getByTestId('empty-add-btn')).toBeDefined();
  });

  it('renders NEXUS header, search bar, categories, and initial app cards', () => {
    render(<App />);

    expect(screen.getByText('NEXUS')).toBeDefined();
    expect(screen.getByTestId('search-input')).toBeDefined();
    expect(screen.getByTestId('add-app-btn')).toBeDefined();
    expect(screen.getByTestId('settings-btn')).toBeDefined();
    expect(screen.getByTestId('category-tab-Tümü')).toBeDefined();
    expect(screen.getByTestId('app-card-app-1')).toBeDefined(); // Antigravity
    expect(screen.getByTestId('app-card-app-2')).toBeDefined(); // VS Code
    expect(screen.getByTestId('app-card-app-5')).toBeDefined(); // AI Dev Workgroup
  });

  it('filters apps when typing in search bar and clears search on X click', async () => {
    render(<App />);
    const user = userEvent.setup();
    const searchInput = screen.getByTestId('search-input');

    // Search for "Cyberpunk"
    await user.type(searchInput, 'Cyberpunk');
    expect(screen.getByTestId('app-card-app-7')).toBeDefined();
    expect(screen.queryByTestId('app-card-app-2')).toBeNull();

    // Click clear search button
    const clearBtn = screen.getByTestId('clear-search-btn');
    await user.click(clearBtn);

    expect(screen.getByTestId('app-card-app-2')).toBeDefined();
  });

  it('clicks through category tabs and filters accurately', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Click AI
    await user.click(screen.getByTestId('category-tab-AI'));
    expect(screen.getByTestId('app-card-app-1')).toBeDefined();
    expect(screen.queryByTestId('app-card-app-7')).toBeNull();

    // Click Oyunlar
    await user.click(screen.getByTestId('category-tab-Oyunlar'));
    expect(screen.getByTestId('app-card-app-7')).toBeDefined();
    expect(screen.queryByTestId('app-card-app-1')).toBeNull();

    // Click Çalışma Grupları
    await user.click(screen.getByTestId('category-tab-Çalışma Grupları'));
    expect(screen.getByTestId('app-card-app-5')).toBeDefined();

    // Click Tümü
    await user.click(screen.getByTestId('category-tab-Tümü'));
    expect(screen.getByTestId('app-card-app-1')).toBeDefined();
    expect(screen.getByTestId('app-card-app-7')).toBeDefined();
  });

  it('creates, renames, and deletes categories using the "+ Kategori / Yönet" modal', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Open category modal
    await user.click(screen.getByTestId('add-category-btn'));
    expect(screen.getByTestId('category-modal')).toBeDefined();

    // 2. Type category name & submit
    const catInput = screen.getByTestId('category-name-input');
    await user.type(catInput, 'DevOps & Cloud');
    await user.click(screen.getByTestId('save-category-btn'));

    // Verify category tab exists and is active
    expect(screen.getByTestId('category-tab-DevOps & Cloud')).toBeDefined();

    // 3. Re-open modal to delete category
    await user.click(screen.getByTestId('add-category-btn'));
    expect(screen.getByTestId('delete-cat-DevOps & Cloud')).toBeDefined();
    await user.click(screen.getByTestId('delete-cat-DevOps & Cloud'));

    // Close modal
    await user.click(screen.getByTestId('close-category-modal-btn'));
    expect(screen.queryByTestId('category-tab-DevOps & Cloud')).toBeNull();
  });

  it('adds a new app using the "Uygulama Ekle" modal', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-app-btn'));
    expect(screen.getByTestId('app-modal')).toBeDefined();

    await user.type(screen.getByTestId('app-modal-name-input'), 'Postman API');
    await user.type(screen.getByTestId('app-modal-path-input'), 'C:\\Apps\\Postman.exe');
    await user.type(screen.getByTestId('app-modal-tags-input'), 'API, Test, Web');

    await user.click(screen.getByTestId('save-app-modal-btn'));

    // Check newly added app appears
    expect(screen.getByText('Postman API')).toBeDefined();
    // Verify tag works in background search
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'API');
    expect(screen.getByText('Postman API')).toBeDefined();
  });

  it('tests launching and stopping an app', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Click directly on card to launch Antigravity
    const card = screen.getByTestId('app-card-app-1');
    await user.click(card);

    // Context menu -> Kapat
    const menuBtn = screen.getByTestId('app-menu-btn-app-1');
    await user.click(menuBtn);

    const stopBtn = screen.getByTestId('context-menu-stop');
    await user.click(stopBtn);
  });

  it('tests context menu: Favorite toggle and Remove from library', async () => {
    render(<App />);
    const user = userEvent.setup();

    const menuBtn = screen.getByTestId('app-menu-btn-app-7'); // Cyberpunk 2077
    await user.click(menuBtn);

    // Toggle favorite
    const favBtn = screen.getByTestId('context-menu-favorite');
    await user.click(favBtn);

    // Open menu again to remove
    const menuBtn2 = screen.getByTestId('app-menu-btn-app-7');
    await user.click(menuBtn2);

    const removeBtn = screen.getByTestId('context-menu-remove');
    await user.click(removeBtn);

    // Verify Cyberpunk was removed from card grid
    expect(screen.queryByTestId('app-card-app-7')).toBeNull();
  });

  it('tests editing app properties via context menu and launching workgroups', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Edit app
    const menuBtn = screen.getByTestId('app-menu-btn-app-1');
    await user.click(menuBtn);

    const editBtn = screen.getByTestId('context-menu-edit');
    await user.click(editBtn);

    expect(screen.getByTestId('app-modal')).toBeDefined();
    const nameInput = screen.getByTestId('app-modal-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Antigravity Pro');

    await user.click(screen.getByTestId('save-app-modal-btn'));
    expect(screen.getAllByText('Antigravity Pro').length).toBeGreaterThan(0);

    // 2. Launch Workgroup
    const groupCard = screen.getByTestId('app-card-app-5');
    await user.click(groupCard);

    // 3. Click recent item and verify collapsible section
    expect(screen.getByTestId('recent-apps-toggle')).toBeDefined();
    const recentItem = screen.getByTestId('recent-item-app-1');
    await user.click(recentItem);
  });

  it('tests Settings Modal and clicks through all 10 themes and toggles', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Open Settings
    await user.click(screen.getByTestId('settings-btn'));
    expect(screen.getByTestId('settings-modal')).toBeDefined();

    const allThemeIds = [
      'neo-mint-glass',
      'arctic-crystal',
      'opal-prism',
      'frost-glass',
      'rose-glass',
      'dark-steel',
      'obsidian-slate',
      'midnight-blue',
      'aurora-glass',
      'carbon-matrix'
    ];

    // Click every single theme button
    for (const tid of allThemeIds) {
      const themeBtn = screen.getByTestId(`theme-option-${tid}`);
      await user.click(themeBtn);
      expect(localStorage.getItem('nexus_theme')).toBe(tid);
    }

    // Click general settings checkboxes
    await user.click(screen.getByTestId('toggle-auto-start'));
    expect(localStorage.getItem('nexus_auto_start')).toBe('true');

    await user.click(screen.getByTestId('toggle-auto-discover'));
    expect(localStorage.getItem('nexus_auto_discover')).toBe('false');

    await user.click(screen.getByTestId('toggle-force-kill'));
    expect(localStorage.getItem('nexus_force_kill')).toBe('true');

    // Click Reset Library button
    await user.click(screen.getByTestId('reset-library-btn'));

    // Close settings modal
    await user.click(screen.getByTestId('close-settings-btn'));
    expect(screen.queryByTestId('settings-modal')).toBeNull();
  });

  it('tests window controls, Settings Modal glass opacity controls, and shortcut scanner', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Title bar window controls
    expect(screen.getByTestId('window-minimize-btn')).toBeDefined();
    expect(screen.getByTestId('window-close-btn')).toBeDefined();

    // 2. Open App Modal and verify "Sistemden Kısayol Seç" button
    await user.click(screen.getByTestId('add-app-btn'));
    expect(screen.getByTestId('scan-shortcuts-btn')).toBeDefined();
    await user.click(screen.getByTestId('close-app-modal-btn'));

    // 3. Open Settings Modal
    await user.click(screen.getByTestId('settings-btn'));
    expect(screen.getByTestId('settings-modal')).toBeDefined();

    // 4. Layout Mode Switcher inside Settings
    const dockBtn = screen.getByTestId('mode-dock-btn');
    const floatBtn = screen.getByTestId('mode-floating-btn');
    const fullBtn = screen.getByTestId('mode-full-btn');

    await user.click(floatBtn);
    expect(localStorage.getItem('nexus_layout_mode')).toBe('floating-widget');

    await user.click(fullBtn);
    expect(localStorage.getItem('nexus_layout_mode')).toBe('full');

    await user.click(dockBtn);
    expect(localStorage.getItem('nexus_layout_mode')).toBe('right-dock');

    // 5. Opacity Slider & Pill Buttons inside Settings Modal
    const rangeInput = screen.getByTestId('glass-opacity-slider') as HTMLInputElement;
    expect(rangeInput).toBeDefined();

    // Click %30 pill
    await user.click(screen.getByTestId('opacity-pill-30'));
    expect(localStorage.getItem('nexus_glass_opacity')).toBe('30');

    // Click %100 pill
    await user.click(screen.getByTestId('opacity-pill-100'));
    expect(localStorage.getItem('nexus_glass_opacity')).toBe('100');

    // Click %0 pill (protective frosted glass with smooth alpha scaling)
    await user.click(screen.getByTestId('opacity-pill-0'));
    expect(localStorage.getItem('nexus_glass_opacity')).toBe('0');

    const container = screen.getByTestId('nexus-container');
    expect(container.style.backgroundColor).toContain('0.02');
    expect(container.style.backdropFilter).toContain('blur(20px)');

    await user.click(screen.getByTestId('close-settings-btn'));
  });

  it('tests sorting options dropdown and verifies sorting behavior', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Open sort menu
    const sortBtn = screen.getByTestId('sort-menu-btn');
    await user.click(sortBtn);
    expect(screen.getByTestId('sort-dropdown-menu')).toBeDefined();

    // Select A-Z
    const sortAzBtn = screen.getByTestId('sort-option-name-asc');
    await user.click(sortAzBtn);
    expect(localStorage.getItem('nexus_sort_mode')).toBe('name-asc');

    // Open sort menu again and select most-used
    await user.click(sortBtn);
    const sortMostUsed = screen.getByTestId('sort-option-most-used');
    await user.click(sortMostUsed);
    expect(localStorage.getItem('nexus_sort_mode')).toBe('most-used');

    // Open sort menu and select custom
    await user.click(sortBtn);
    const sortCustom = screen.getByTestId('sort-option-custom');
    await user.click(sortCustom);
    expect(localStorage.getItem('nexus_sort_mode')).toBe('custom');
  });

  it('tests drag and drop reordering between cards and updates custom order', () => {
    render(<App />);
    const card1 = screen.getByTestId('app-card-app-1');
    const card2 = screen.getByTestId('app-card-app-2');

    const dataTransfer = {
      setData: () => {},
      getData: () => 'app-1',
      dropEffect: 'none',
      effectAllowed: 'none',
      files: [],
      items: [],
      types: ['text/plain']
    };

    fireEvent.dragStart(card1, { dataTransfer });
    fireEvent.dragOver(card2, { dataTransfer });
    fireEvent.drop(card2, { dataTransfer });
    fireEvent.dragEnd(card1);

    expect(localStorage.getItem('nexus_sort_mode')).toBe('custom');
    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    expect(savedApps[0].id).toBe('app-2');
    expect(savedApps[1].id).toBe('app-1');
  });

  it('tests category right-click context menu and quick category deletion', async () => {
    render(<App />);
    const user = userEvent.setup();

    const catAI = screen.getByTestId('category-tab-AI');
    expect(catAI).toBeDefined();

    // Right-click on AI category tab
    fireEvent.contextMenu(catAI, { clientX: 100, clientY: 100 });

    // Category context menu should appear
    const contextMenu = screen.getByTestId('category-context-menu');
    expect(contextMenu).toBeDefined();

    // Click delete category button in context menu
    const deleteBtn = screen.getByTestId('context-delete-cat-AI');
    await user.click(deleteBtn);

    // AI category should be removed from tabs
    expect(screen.queryByTestId('category-tab-AI')).toBeNull();
  });

  it('automatically adds shortcut to active category without asking for category', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Switch to 'Oyunlar' category
    await user.click(screen.getByTestId('category-tab-Oyunlar'));

    // 2. Open Add Shortcut modal
    await user.click(screen.getByTestId('add-app-btn'));
    expect(screen.getByTestId('app-modal')).toBeDefined();

    // 3. Confirm category selector is completely removed from the form
    expect(screen.queryByTestId('app-modal-category-select')).toBeNull();

    // 4. Fill in shortcut details and save
    await user.type(screen.getByTestId('app-modal-name-input'), 'Cyberpunk 2077');
    await user.type(screen.getByTestId('app-modal-path-input'), 'C:\\Games\\Cyberpunk2077.exe');
    await user.click(screen.getByTestId('save-app-modal-btn'));

    // 5. Verify the new shortcut was saved directly into 'Oyunlar' category
    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    const addedApp = savedApps.find((a: any) => a.name === 'Cyberpunk 2077');
    expect(addedApp).toBeDefined();
    expect(addedApp.category).toBe('Oyunlar');
  });

  it('supports drag-and-drop moving between categories via category tabs', async () => {
    render(<App />);

    const card1 = screen.getByTestId('app-card-app-1');
    const targetCatTab = screen.getByTestId('category-tab-Oyunlar');

    const dataTransfer = {
      setData: vi.fn(),
      getData: (format: string) => (format === 'application/nexus-app' || format === 'text/plain' ? 'app-1' : ''),
      types: ['text/plain', 'application/nexus-app'],
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(card1, { dataTransfer });
    fireEvent.dragOver(targetCatTab, { dataTransfer });
    fireEvent.drop(targetCatTab, { dataTransfer });
    fireEvent.dragEnd(card1);

    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    const movedApp = savedApps.find((a: any) => a.id === 'app-1');
    expect(movedApp.category).toBe('Oyunlar');
  });

  it('supports dragging an app to the Favoriler tab to mark as favorite', async () => {
    render(<App />);

    const card3 = screen.getByTestId('app-card-app-3');
    const favCatTab = screen.getByTestId('category-tab-Favoriler');

    const dataTransfer = {
      setData: vi.fn(),
      getData: (format: string) => (format === 'application/nexus-app' || format === 'text/plain' ? 'app-3' : ''),
      types: ['text/plain', 'application/nexus-app'],
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(card3, { dataTransfer });
    fireEvent.dragOver(favCatTab, { dataTransfer });
    fireEvent.drop(favCatTab, { dataTransfer });
    fireEvent.dragEnd(card3);

    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    const favApp = savedApps.find((a: any) => a.id === 'app-3');
    expect(favApp.favorite).toBe(true);
  });

  it('supports dropping external shortcut/file from desktop directly into active category', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Switch to 'AI' category
    await user.click(screen.getByTestId('category-tab-AI'));

    // 2. Mock external file dropped from desktop
    const mockFile = new File(['dummy content'], 'Claude Desktop.lnk', { type: '' });
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Users\\ahmet\\Desktop\\Claude Desktop.lnk'
    });

    const container = screen.getByTestId('nexus-container');

    const fileDataTransfer = {
      files: [mockFile],
      types: ['Files'],
      dropEffect: 'copy'
    };

    fireEvent.dragEnter(container, { dataTransfer: fileDataTransfer });
    expect(screen.getByTestId('file-drop-overlay')).toBeDefined();

    fireEvent.drop(container, { dataTransfer: fileDataTransfer });
    expect(screen.queryByTestId('file-drop-overlay')).toBeNull();

    // 3. Verify the shortcut was directly added to the 'AI' category
    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    const droppedApp = savedApps.find((a: any) => a.name === 'Claude Desktop');
    expect(droppedApp).toBeDefined();
    expect(droppedApp.category).toBe('AI');
    expect(droppedApp.path).toBe('C:\\Users\\ahmet\\Desktop\\Claude Desktop.lnk');
  });

  it('displays authentic icon when shortcut has native iconDataUrl and folder icon for folder additions', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Drop a shortcut that returns a native iconDataUrl
    const mockIconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' + 'A'.repeat(600);
    (window as any).electronAPI = {
      ...(window as any).electronAPI,
      getFileInfo: vi.fn().mockResolvedValue({
        filePath: 'C:\\Users\\ahmet\\Desktop\\Spotify.lnk',
        fileName: 'Spotify',
        iconDataUrl: mockIconData,
        detectedType: 'exe'
      })
    };

    const mockFile = new File([''], 'Spotify.lnk');
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Users\\ahmet\\Desktop\\Spotify.lnk'
    });

    const container = screen.getByTestId('nexus-container');
    fireEvent.drop(container, {
      dataTransfer: {
        files: [mockFile],
        types: ['Files']
      }
    });

    // Verify Spotify is rendered with an <img> containing the real native iconDataUrl
    const spotifyImg = await screen.findByRole('img', { name: 'Spotify' });
    expect(spotifyImg).toBeDefined();
    expect(spotifyImg.getAttribute('src')).toBe(mockIconData);

    // 2. Open Add Modal, click "Klasör..." to browse folder
    (window as any).electronAPI.selectFolder = vi.fn().mockResolvedValue({
      filePath: 'C:\\Projeler\\VetAssist',
      fileName: 'VetAssist',
      iconDataUrl: null,
      detectedType: 'project'
    });

    await user.click(screen.getByTestId('add-app-btn'));
    await user.click(screen.getByTestId('browse-folder-btn'));
    expect((screen.getByTestId('app-modal-name-input') as HTMLInputElement).value).toBe('VetAssist');
    await user.click(screen.getByTestId('save-app-modal-btn'));

    // Verify VetAssist is created as a folder
    const savedApps = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
    const folderApp = savedApps.find((a: any) => a.name === 'VetAssist');
    expect(folderApp).toBeDefined();
    expect(folderApp.icon).toBe('Folder');
  });

  it('verifies v1.0 badge is removed and logo can cycle or be selected via settings', async () => {
    render(<App />);
    const user = userEvent.setup();

    // 1. Verify v1.0 is completely removed from the header
    expect(screen.queryByText('v1.0')).toBeNull();

    // 2. Find the logo button
    const logoBtn = screen.getByLabelText('Nexus Logo');
    expect(logoBtn).toBeDefined();

    // Click logo button to cycle logo
    await user.click(logoBtn);
    expect(localStorage.getItem('nexus_header_logo')).toBe('neon-vortex');

    // Click logo again to cycle
    await user.click(logoBtn);
    expect(localStorage.getItem('nexus_header_logo')).toBe('cyber-shield');
  });
});

