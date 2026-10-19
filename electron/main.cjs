const { app, BrowserWindow, ipcMain, screen, dialog, Tray, Menu, nativeImage, shell, session } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { spawn, execFileSync } = require('child_process');

let mainWindow;
let tray;
app.isQuitting = false;

function getBoundsFilePath() {
  return path.join(app.getPath('userData'), 'window-bounds.json');
}

function loadSavedBounds() {
  try {
    const filePath = getBoundsFilePath();
    if (!fsSync.existsSync(filePath)) return null;
    const data = JSON.parse(fsSync.readFileSync(filePath, 'utf-8'));
    if (
      !data ||
      typeof data.width !== 'number' ||
      typeof data.height !== 'number' ||
      typeof data.x !== 'number' ||
      typeof data.y !== 'number'
    ) {
      return null;
    }

    // Verify the saved position is still visible on at least one currently active display
    const displays = screen.getAllDisplays();
    const isVisible = displays.some((display) => {
      const { x, y, width, height } = display.workArea;
      return (
        data.x + data.width > x + 50 &&
        data.x < x + width - 50 &&
        data.y + data.height > y + 50 &&
        data.y < y + height - 50
      );
    });

    if (isVisible) {
      return {
        x: Math.round(data.x),
        y: Math.round(data.y),
        width: Math.max(320, Math.round(data.width)),
        height: Math.max(200, Math.round(data.height))
      };
    }
  } catch (err) {
    console.error('Failed to load window bounds:', err);
  }
  return null;
}

let saveBoundsTimer = null;
function saveCurrentBounds() {
  if (saveBoundsTimer) {
    clearTimeout(saveBoundsTimer);
    saveBoundsTimer = null;
  }
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) return;
  try {
    const bounds = mainWindow.getBounds();
    if (!bounds || bounds.width < 250 || bounds.height < 150) return;
    const filePath = getBoundsFilePath();
    const dir = path.dirname(filePath);
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
    fsSync.writeFileSync(filePath, JSON.stringify(bounds, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save window bounds:', err);
  }
}

function debouncedSaveBounds() {
  if (saveBoundsTimer) clearTimeout(saveBoundsTimer);
  saveBoundsTimer = setTimeout(saveCurrentBounds, 300);
}

function isTrustedSender(event) {
  if (!mainWindow || mainWindow.isDestroyed() || !event || !event.sender) return false;
  if (event.sender.id !== mainWindow.webContents.id) return false;
  // Security Hardening: Ensure message comes from top-level mainFrame, not an injected subframe
  if (event.senderFrame && mainWindow.webContents.mainFrame) {
    if (event.senderFrame !== mainWindow.webContents.mainFrame) return false;
  }
  // Validate protocol & origin
  try {
    const frameUrl = event.senderFrame?.url || (typeof event.sender.getURL === 'function' ? event.sender.getURL() : null);
    if (frameUrl) {
      const parsed = new URL(frameUrl);
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && parsed.origin === 'http://localhost:5190') return true;
      if (parsed.protocol === 'file:') return true;
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

function toggleWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  else if (mainWindow.isVisible()) {
    saveCurrentBounds();
    mainWindow.hide();
  } else {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

function getAutoStart() {
  if (process.platform === 'win32') {
    try {
      const stdout = execFileSync('reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'NEXUS'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      if (stdout.includes('NEXUS')) return true;
    } catch {
      // Key does not exist
    }
  }
  return app.getLoginItemSettings().openAtLogin;
}

function setAutoStart(enable) {
  const shouldEnable = Boolean(enable);
  if (process.platform === 'win32') {
    try {
      if (shouldEnable) {
        const targetCmd = app.isPackaged
          ? `"${process.execPath}"`
          : `"${process.execPath}" "${path.resolve(__dirname, '..')}"`;
        execFileSync('reg', ['add', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'NEXUS', '/t', 'REG_SZ', '/d', targetCmd, '/f'], { stdio: 'ignore' });
        try {
          execFileSync('reg', ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'electron.app.Electron', '/f'], { stdio: 'ignore' });
        } catch {
          // ignore
        }
      } else {
        try {
          execFileSync('reg', ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'NEXUS', '/f'], { stdio: 'ignore' });
        } catch {
          // ignore
        }
        try {
          execFileSync('reg', ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'electron.app.Electron', '/f'], { stdio: 'ignore' });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to update Windows Run registry key:', err);
    }
  }

  try {
    app.setLoginItemSettings({
      openAtLogin: shouldEnable,
      path: process.execPath,
      args: app.isPackaged ? [] : [path.resolve(__dirname, '..')]
    });
  } catch {
    // ignore
  }

  const enabled = getAutoStart();
  updateTrayMenu();
  return enabled;
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "NEXUS'u Göster / Gizle", click: toggleWindow },
    { type: 'separator' },
    { label: 'Dikey Panel Modu', click: () => setLayoutMode('right-dock') },
    { label: 'Kayan Widget Modu', click: () => setLayoutMode('floating-widget') },
    { label: 'Vitrin Modu', click: () => setLayoutMode('full') },
    { type: 'separator' },
    {
      label: 'Windows ile Birlikte Başlat',
      type: 'checkbox',
      checked: getAutoStart(),
      click: (item) => setAutoStart(item.checked)
    },
    { type: 'separator' },
    { label: 'Çıkış', click: () => { app.isQuitting = true; app.quit(); } }
  ]));
}

function createTray() {
  let icon = nativeImage.createFromPath(path.join(__dirname, '../public/nexus_icon.ico'));
  if (icon.isEmpty()) {
    icon = nativeImage.createFromPath(path.join(__dirname, '../public/nexus_icon.png'));
  }
  tray = new Tray(icon);
  tray.setToolTip('NEXUS v1.0');
  tray.on('click', toggleWindow);
  updateTrayMenu();
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Default to right-dock widget mode (exact 1/3 right of screen) if no saved bounds exist
  const dockWidth = Math.max(400, Math.round(width / 3));
  const defaultBounds = {
    x: width - dockWidth,
    y: 0,
    width: dockWidth,
    height: height
  };

  const initialBounds = loadSavedBounds() || defaultBounds;

  mainWindow = new BrowserWindow({
    width: initialBounds.width,
    height: initialBounds.height,
    x: initialBounds.x,
    y: initialBounds.y,
    frame: false,             // Completely frameless, borderless!
    transparent: true,         // Allows desktop wallpaper to show through transparent glass
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    icon: path.join(__dirname, '../public/nexus_icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'NEXUS Glass Widget'
  });

  mainWindow.on('resize', debouncedSaveBounds);
  mainWindow.on('move', debouncedSaveBounds);
  mainWindow.on('resized', saveCurrentBounds);
  mainWindow.on('moved', saveCurrentBounds);
  mainWindow.on('hide', saveCurrentBounds);

  mainWindow.on('close', (event) => {
    saveCurrentBounds();
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('minimize', (event) => {
    saveCurrentBounds();
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });

  // Security Hardening: Prevent untrusted external navigation & restrict popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch (_) {}
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && parsedUrl.origin === 'http://localhost:5190') return;

      // In production, strictly restrict navigation to the bundled index.html
      const distIndex = path.resolve(__dirname, '../dist/index.html');
      const distUrl = new URL(`file://${distIndex.replace(/\\/g, '/')}`).href;
      if (parsedUrl.href === distUrl) return;
    } catch (_) {}
    event.preventDefault();
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5190');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Single Instance Lock: Arka planda aynı anda birden fazla nexus çalışmasını engeller
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // İkinci bir kopya açılmaya çalışılırsa sessizce sonlandır
  app.quit();
} else {
  app.on('second-instance', () => {
    // İkinci bir kopya başlatılmak istendiğinde mevcut pencereyi öne getir ve odakla
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Security Hardening: Enforce Content-Security-Policy on all loaded content
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: file: https:; font-src 'self' data:; connect-src 'self' http://localhost:5190 ws://localhost:5190; object-src 'none'; frame-src 'none'; base-uri 'self';"]
        }
      });
    });

    createWindow();
    createTray();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('before-quit', () => {
  app.isQuitting = true;
  saveCurrentBounds();
});
// Keep the process and tray alive when all windows are closed.
app.on('window-all-closed', () => {});
app.on('will-quit', () => {
  if (tray && !tray.isDestroyed()) tray.destroy();
});

// --- IPC HANDLERS ---

// 1. Launch App
ipcMain.handle('launch-app', async (event, appConfig) => {
  if (!isTrustedSender(event)) return { success: false, error: 'Unauthorized IPC sender' };
  try {
    const { path: appPath, arguments: args, workingDirectory, type } = appConfig || {};
    if (!appPath || typeof appPath !== 'string') return { success: false, error: 'Path not specified' };
    if (appPath.includes('\0')) return { success: false, error: 'Invalid path: null byte detected' };

    // Security Hardening: Reject dangerous protocol schemes and script execution tricks
    if (/^(javascript|vbscript|data|ms-msdt|search-ms):/i.test(appPath.trim())) {
      return { success: false, error: 'Prohibited protocol handler' };
    }

    let argsArray = [];
    if (Array.isArray(args)) {
      argsArray = args.filter((a) => typeof a === 'string' && !a.includes('\0'));
    } else if (args && typeof args === 'string' && !args.includes('\0')) {
      argsArray = args.split(' ').filter(Boolean);
    }

    // Safely resolve working directory
    let cwd = undefined;
    if (workingDirectory && typeof workingDirectory === 'string' && !workingDirectory.includes('\0')) {
      try {
        if (fsSync.existsSync(workingDirectory) && fsSync.statSync(workingDirectory).isDirectory()) {
          cwd = workingDirectory;
        }
      } catch (_) {}
    }
    if (!cwd && typeof appPath === 'string') {
      try {
        const candidate = path.dirname(appPath);
        if (fsSync.existsSync(candidate) && fsSync.statSync(candidate).isDirectory()) {
          cwd = candidate;
        }
      } catch (_) {}
    }

    let child;
    if (type === 'cmd' || type === 'bat') {
      child = spawn('cmd.exe', ['/c', appPath, ...argsArray], {
        cwd,
        detached: true,
        stdio: 'ignore'
      });
    } else if (type === 'ps1') {
      child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', appPath, ...argsArray], {
        cwd,
        detached: true,
        stdio: 'ignore'
      });
    } else if (
      path.extname(appPath).toLowerCase() === '.lnk' ||
      path.extname(appPath).toLowerCase() === '.url' ||
      (fsSync.existsSync(appPath) && fsSync.statSync(appPath).isDirectory())
    ) {
      const errMsg = await shell.openPath(appPath);
      if (errMsg) {
        throw new Error(errMsg);
      }
      return { success: true };
    } else {
      child = spawn(appPath, argsArray, {
        cwd,
        detached: true,
        stdio: 'ignore'
      });
    }

    child.on('error', (err) => {
      console.error(`Process spawn error for ${appPath}:`, err.message);
    });

    child.unref();
    return { success: true };
  } catch (error) {
    console.error("Failed to launch app", error);
    return { success: false, error: error.message };
  }
});

// Windows folder fallback icon SVG data URL
const FOLDER_ICON_DATA_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">' +
  '<path fill="#FFA000" d="M40,12H22l-4-4H8C5.8,8,4,9.8,4,12v24c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z"/>' +
  '<path fill="#FFCA28" d="M40,14H8c-1.1,0-2,0.9-2,2v20c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2V16C42,14.9,41.1,14,40,14z"/>' +
  '<path fill="#FFE082" d="M42,20H6v16c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2V20z"/>' +
  '</svg>'
);

function expandEnv(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/%([^%]+)%/g, (_, name) => process.env[name] || `%${name}%`);
}

function cleanIconPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  let p = expandEnv(rawPath.trim().replace(/^"|"$/g, ''));
  if (fsSync.existsSync(p)) return p;
  // If has trailing comma index like ,0 or ,1
  const commaIdx = p.lastIndexOf(',');
  if (commaIdx > 2) {
    const stripped = p.substring(0, commaIdx).trim();
    if (fsSync.existsSync(stripped)) return stripped;
  }
  return null;
}

function parseUrlFile(urlPath) {
  try {
    const content = fsSync.readFileSync(urlPath, 'utf-8');
    const iconMatch = content.match(/IconFile=(.+)/i);
    const urlMatch = content.match(/URL=(.+)/i);
    return {
      iconFile: iconMatch ? iconMatch[1].trim() : null,
      targetUrl: urlMatch ? urlMatch[1].trim() : null
    };
  } catch {
    return { iconFile: null, targetUrl: null };
  }
}

function extractIconViaPowerShell(filePath) {
  try {
    if (process.platform !== 'win32') return null;
    if (!filePath || typeof filePath !== 'string' || filePath.includes('\0')) return null;
    // Security check: Only attempt icon extraction if the target file actually exists on disk
    if (!fsSync.existsSync(filePath)) return null;

    // Security Hardening: Use parameterized execFileSync without cmd.exe shell wrapper.
    // File path is passed directly as a parameter and treated as a literal path.
    const script = 'param([string]$target) Add-Type -AssemblyName System.Drawing; try { if (Test-Path -LiteralPath $target -PathType Leaf) { $ico = [System.Drawing.Icon]::ExtractAssociatedIcon($target); if ($ico) { $ms = New-Object System.IO.MemoryStream; $ico.ToBitmap().Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); [Convert]::ToBase64String($ms.ToArray()) } } } catch {}';
    const b64 = execFileSync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      script,
      filePath
    ], {
      encoding: 'utf-8',
      timeout: 3500,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true
    }).trim();

    if (b64 && b64.length > 100) {
      return `data:image/png;base64,${b64}`;
    }
  } catch {
    // ignore
  }
  return null;
}

function isDummyShortcutIcon(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return true;
  // Generic Windows glyphs: blank shortcut (~766 chars) and generic file-type icons (<500 chars)
  if (dataUrl.length < 500) return true;
  if (dataUrl.length >= 700 && dataUrl.length <= 850 && dataUrl.includes('ACAAAAAgCAYAAABz')) {
    return true;
  }
  return false;
}

const IMAGE_ICON_EXTS = new Set(['.ico', '.png', '.jpg', '.jpeg', '.bmp', '.gif']);

// Load the actual pixels of an image/icon file (app.getFileIcon would return the generic file-type glyph)
function iconFromImageFile(filePath) {
  try {
    if (!filePath || !IMAGE_ICON_EXTS.has(path.extname(filePath).toLowerCase())) return null;
    let img = nativeImage.createFromPath(filePath);
    if (!img || img.isEmpty()) return null;
    const { width } = img.getSize();
    if (width > 64) img = img.resize({ width: 64, quality: 'best' });
    return img.toDataURL();
  } catch {
    return null;
  }
}

// Resolve an icon source (image file, exe, dll...) to a non-generic data URL
async function iconFromSource(sourcePath) {
  const resolved = cleanIconPath(sourcePath);
  if (!resolved) return null;
  const direct = iconFromImageFile(resolved);
  if (direct) return direct;
  try {
    const iconObj = await app.getFileIcon(resolved, { size: 'large' });
    if (iconObj && !iconObj.isEmpty()) {
      const url = iconObj.toDataURL();
      if (!isDummyShortcutIcon(url)) return url;
    }
  } catch {}
  return null;
}

// 2. Extract Real Native Icon from Windows .exe, shortcut (.lnk, .url) or directory
async function getFileIcon(targetPath) {
  try {
    if (typeof targetPath !== 'string' || !targetPath.trim()) return null;
    const cleanPath = expandEnv(targetPath.trim().replace(/^"|"$/g, ''));
    const ext = path.extname(cleanPath).toLowerCase();

    // 0. The dropped/selected file itself is an image (.ico/.png)
    const directImage = iconFromImageFile(cleanPath);
    if (directImage) return directImage;

    // 1. Internet Shortcut (.url - e.g. Steam / Epic Games / Web)
    if (ext === '.url') {
      const { iconFile } = parseUrlFile(cleanPath);
      if (iconFile) {
        const fromIcon = await iconFromSource(iconFile);
        if (fromIcon) return fromIcon;
      }
      const psIcon = extractIconViaPowerShell(cleanPath);
      if (psIcon && !isDummyShortcutIcon(psIcon)) return psIcon;
    }

    // 2. Windows Shortcut (.lnk)
    if (ext === '.lnk') {
      try {
        const sc = shell.readShortcutLink(cleanPath);
        // Custom icon assigned to shortcut (e.g. PulseCraft.ico):
        if (sc.icon) {
          const fromIcon = await iconFromSource(sc.icon);
          if (fromIcon) return fromIcon;
        }
        // Target pointed to by shortcut:
        if (sc.target) {
          const fromTarget = await iconFromSource(sc.target);
          if (fromTarget) return fromTarget;
        }
      } catch {
        // readShortcutLink failed
      }

      // Fallback for .lnk via PowerShell WScript / System.Drawing
      const psIcon = extractIconViaPowerShell(cleanPath);
      if (psIcon && !isDummyShortcutIcon(psIcon)) return psIcon;
    }

    // 3. If it's a directory:
    const isDir = fsSync.existsSync(cleanPath) && fsSync.statSync(cleanPath).isDirectory();
    if (isDir) {
      try {
        const nativeIcon = await app.getFileIcon(cleanPath, { size: 'large' });
        if (nativeIcon && !nativeIcon.isEmpty()) {
          return nativeIcon.toDataURL();
        }
      } catch {}
      return FOLDER_ICON_DATA_URL;
    }

    // 4. Native icon extraction on the executable or file path itself
    try {
      const nativeIcon = await app.getFileIcon(cleanPath, { size: 'large' });
      if (nativeIcon && !nativeIcon.isEmpty()) {
        const dataUrl = nativeIcon.toDataURL();
        if (!isDummyShortcutIcon(dataUrl)) {
          return dataUrl;
        }
      }
    } catch {}

    // 5. Final fallback
    const fallbackPs = extractIconViaPowerShell(cleanPath);
    if (fallbackPs && !isDummyShortcutIcon(fallbackPs)) return fallbackPs;

    return null;
  } catch (err) {
    console.warn("Could not extract icon for:", targetPath, err.message);
    return null;
  }
}

ipcMain.handle('get-file-icon', (event, targetPath) => isTrustedSender(event) ? getFileIcon(targetPath) : null);

ipcMain.handle('get-file-info', async (event, filePath) => {
  if (!isTrustedSender(event) || !filePath || typeof filePath !== 'string') return null;
  try {
    const cleanPath = expandEnv(filePath.trim().replace(/^"|"$/g, ''));
    const isDir = fsSync.existsSync(cleanPath) && fsSync.statSync(cleanPath).isDirectory();
    const ext = path.extname(cleanPath).toLowerCase().replace('.', '');
    const fileName = path.basename(cleanPath, path.extname(cleanPath)) || path.basename(cleanPath);
    const iconDataUrl = await getFileIcon(cleanPath);

    let detectedType = isDir ? 'project' : 'exe';
    if (ext === 'bat') detectedType = 'bat';
    else if (ext === 'cmd') detectedType = 'cmd';
    else if (ext === 'ps1') detectedType = 'ps1';
    else if (ext === 'url') detectedType = 'exe';

    return {
      filePath: cleanPath,
      fileName,
      iconDataUrl,
      detectedType
    };
  } catch (err) {
    console.error("Error extracting file info:", filePath, err);
    return null;
  }
});

// Scan desktop and Start Menu shortcuts, including nested program folders.
ipcMain.handle('scan-shortcuts', async (event) => {
  if (!isTrustedSender(event)) return [];
  if (process.platform !== 'win32') return [];

  const roots = [app.getPath('desktop')];
  if (process.env.PUBLIC) roots.push(path.join(process.env.PUBLIC, 'Desktop'));
  if (process.env.APPDATA) {
    roots.push(path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
  }
  if (process.env.ProgramData) {
    roots.push(path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
  }

  const shortcuts = [];
  const seen = new Set();
  const seenDirs = new Set();
  const MAX_DEPTH = 3;
  const queue = roots.map((r) => ({ dir: r, depth: 0 }));

  while (queue.length && shortcuts.length < 30) {
    const { dir: directory, depth } = queue.shift();
    if (!directory || seenDirs.has(directory.toLowerCase())) continue;
    seenDirs.add(directory.toLowerCase());

    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (err) {
      // Missing or inaccessible folders must not prevent other roots being scanned.
      console.warn('Could not scan shortcut folder:', directory, err.message);
      continue;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (shortcuts.length >= 30) break;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (depth < MAX_DEPTH) {
          queue.push({ dir: entryPath, depth: depth + 1 });
        }
      } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.lnk') {
        const key = entryPath.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        shortcuts.push({
          name: path.basename(entry.name, path.extname(entry.name)),
          path: entryPath,
          iconDataUrl: await getFileIcon(entryPath)
        });
      }
    }
  }
  return shortcuts;
});

// 2b. Native Windows File Open Dialog (Gözat...)
ipcMain.handle('select-file', async (event) => {
  if (!isTrustedSender(event) || !mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Uygulama veya Kısayol Seçin',
    properties: ['openFile'],
    filters: [
      { name: 'Çalıştırılabilir Dosyalar (*.exe, *.lnk, *.bat, *.cmd, *.ps1)', extensions: ['exe', 'lnk', 'bat', 'cmd', 'ps1'] },
      { name: 'Tüm Dosyalar (*.*)', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const iconDataUrl = await getFileIcon(selectedPath);
  const ext = path.extname(selectedPath).toLowerCase().replace('.', '');
  let detectedType = 'exe';
  if (ext === 'bat') detectedType = 'bat';
  else if (ext === 'cmd') detectedType = 'cmd';
  else if (ext === 'ps1') detectedType = 'ps1';

  return {
    filePath: selectedPath,
    fileName: path.basename(selectedPath, path.extname(selectedPath)),
    iconDataUrl,
    detectedType
  };
});

// 2c. Native Windows Folder Open Dialog (Klasör Seç...)
ipcMain.handle('select-folder', async (event) => {
  if (!isTrustedSender(event) || !mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Klasör Seçin',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const iconDataUrl = await getFileIcon(selectedPath);

  return {
    filePath: selectedPath,
    fileName: path.basename(selectedPath),
    iconDataUrl,
    detectedType: 'project'
  };
});

// 3. Layout / Widget Shape Mode (Right Dock 1/3, Floating Widget, Full Screen)
function setLayoutMode(mode) {
  if (!mainWindow) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  if (mode === 'right-dock') {
    const savedBounds = loadSavedBounds();
    const currentBounds = mainWindow.getBounds();
    const preferredWidth = (savedBounds && savedBounds.width >= 320 && savedBounds.width < width)
      ? savedBounds.width
      : (currentBounds && currentBounds.width >= 320 && currentBounds.width < width)
        ? currentBounds.width
        : Math.max(400, Math.round(width / 3));

    const dockWidth = Math.min(width - 50, Math.max(320, preferredWidth));
    mainWindow.setBounds({
      x: width - dockWidth,
      y: 0,
      width: dockWidth,
      height: height
    });
  } else if (mode === 'floating-widget') {
    mainWindow.setBounds({
      x: width - 440,
      y: 80,
      width: 400,
      height: Math.min(760, height - 120)
    });
  } else if (mode === 'full') {
    const fullWidth = Math.min(1200, width - 60);
    const fullHeight = Math.min(850, height - 60);
    mainWindow.setBounds({
      x: Math.round((width - fullWidth) / 2),
      y: Math.round((height - fullHeight) / 2),
      width: fullWidth,
      height: fullHeight
    });
  }
  saveCurrentBounds();
  return mode;
}

ipcMain.handle('set-layout-mode', (event, mode) => {
  if (!isTrustedSender(event)) return;
  return setLayoutMode(mode);
});

ipcMain.handle('get-auto-start', (event) => {
  if (!isTrustedSender(event)) return false;
  return getAutoStart();
});
ipcMain.handle('set-auto-start', (event, enable) => {
  if (!isTrustedSender(event)) return false;
  return setAutoStart(enable);
});
ipcMain.handle('set-skip-taskbar', (event, flag) => {
  if (!isTrustedSender(event)) return;
  if (mainWindow) mainWindow.setSkipTaskbar(Boolean(flag));
});
ipcMain.handle('toggle-window', (event) => {
  if (!isTrustedSender(event)) return;
  toggleWindow();
});

// 4. Always on Top Pinning
ipcMain.handle('set-always-on-top', (event, flag) => {
  if (!isTrustedSender(event)) return false;
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(Boolean(flag));
    return mainWindow.isAlwaysOnTop();
  }
  return false;
});

// 5. Frameless Window Controls (Minimize, Close)
ipcMain.handle('window-control', (event, action) => {
  if (!isTrustedSender(event) || !mainWindow) return;
  saveCurrentBounds();
  if (action === 'minimize' || action === 'close') {
    if (!app.isQuitting) mainWindow.hide();
    else if (action === 'close') mainWindow.close();
    else mainWindow.minimize();
  }
});
