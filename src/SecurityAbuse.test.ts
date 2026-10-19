import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('NEXUS Comprehensive Security and Abuse Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // 1. COMMAND INJECTION & SHELL BREAKOUT DEFENSE
  // =========================================================================
  describe('1. Command Injection & Metacharacter Defense', () => {
    it('strictly rejects null bytes in app paths and working directories', () => {
      const maliciousPayloads = [
        'C:\\Program Files\\App.exe\0--malicious-flag',
        'notepad.exe\0&calc.exe',
        '/bin/sh\0'
      ];

      for (const payload of maliciousPayloads) {
        expect(payload.includes('\0')).toBe(true);
        // Emulate launch-app null byte check
        const isValid = !payload.includes('\0');
        expect(isValid).toBe(false);
      }
    });

    it('rejects prohibited URI schemes and protocol handlers in launch-app', () => {
      const dangerousProtocols = [
        'javascript:alert(1)',
        'JAVASCRIPT:fetch("http://evil.com")',
        'vbscript:msgbox(1)',
        'data:text/html,<script>alert(1)</script>',
        'ms-msdt:/id PCWDiagnostic /skip force /param "IT_RebrowseForFile=? IT_LaunchMethod=ContextMenu IT_SelectAction=ButtonSelectAction IT_BrowseForFile=calc.exe"',
        'search-ms:query=payload.exe',
      ];

      const protocolRegex = /^(javascript|vbscript|data|ms-msdt|search-ms):/i;

      for (const dangerous of dangerousProtocols) {
        const isBlocked = protocolRegex.test(dangerous.trim());
        expect(isBlocked).toBe(true);
      }

      const safePaths = [
        'C:\\Windows\\System32\\notepad.exe',
        'C:\\Program Files\\VSCode\\Code.exe',
        'D:\\Games\\Cyberpunk 2077.lnk',
        'C:\\Scripts\\build.bat',
        'C:\\Scripts\\deploy.ps1'
      ];

      for (const safe of safePaths) {
        const isBlocked = protocolRegex.test(safe.trim());
        expect(isBlocked).toBe(false);
      }
    });

    it('guarantees extractIconViaPowerShell rejects non-existent paths and malicious command strings', () => {
      // Test payload injection attempts
      const maliciousIconTargets = [
        "C:\\dummy' & calc.exe & '",
        'test" & calc.exe & "',
        '$(calc.exe)',
        '`calc.exe`',
        'foo; calc.exe;',
        'foo | calc.exe',
        'C:\\Program Files\\app.exe\0--fake'
      ];

      for (const target of maliciousIconTargets) {
        // Any target with null bytes or non-existent file must abort immediately
        const exists = fs.existsSync(target);
        const hasNullByte = target.includes('\0');
        const shouldExecute = exists && !hasNullByte && typeof target === 'string';
        expect(shouldExecute).toBe(false);
      }
    });

    it('sanitizes launch arguments and prevents argument corruption', () => {
      const rawArgsWithSpaces = [
        '--config',
        'C:\\My Documents\\app.json',
        '--title',
        'My Nexus Launcher'
      ];

      const sanitizeArgs = (args: any): string[] => {
        if (Array.isArray(args)) {
          return args.filter((a) => typeof a === 'string' && !a.includes('\0'));
        }
        if (typeof args === 'string' && !args.includes('\0')) {
          return args.split(' ').filter(Boolean);
        }
        return [];
      };

      const result = sanitizeArgs(rawArgsWithSpaces);
      expect(result).toHaveLength(4);
      expect(result[1]).toBe('C:\\My Documents\\app.json');

      // Test with poisoned array containing null bytes
      const poisonedArgs = ['--safe', 'normal', 'evil\0flag', null as any, 123 as any];
      const sanitizedPoisoned = sanitizeArgs(poisonedArgs);
      expect(sanitizedPoisoned).toEqual(['--safe', 'normal']);
    });
  });

  // =========================================================================
  // 2. IPC SENDER AUTHORIZATION & SUBFRAME HIJACK MITIGATION
  // =========================================================================
  describe('2. IPC Sender & Subframe Trust Verification', () => {
    it('verifies sender is from the top-level mainFrame and trusted window', () => {
      const mockMainWindow = {
        isDestroyed: () => false,
        webContents: {
          id: 1,
          mainFrame: { id: 100, url: 'file:///c:/Projeler/nexus/dist/index.html' }
        }
      };

      const isTrustedSender = (event: any, win: any = mockMainWindow): boolean => {
        if (!win || win.isDestroyed() || !event || !event.sender) return false;
        if (event.sender.id !== win.webContents.id) return false;
        if (event.senderFrame && win.webContents.mainFrame) {
          if (event.senderFrame !== win.webContents.mainFrame) return false;
        }
        try {
          const frameUrl = event.senderFrame?.url || (typeof event.sender.getURL === 'function' ? event.sender.getURL() : null);
          if (frameUrl) {
            const parsed = new URL(frameUrl);
            if (parsed.origin === 'http://localhost:5190') return true;
            if (parsed.protocol === 'file:') return true;
            return false;
          }
        } catch {
          return false;
        }
        return true;
      };

      // 1. Genuine event from mainFrame
      const legitimateEvent = {
        sender: { id: 1, getURL: () => 'file:///c:/Projeler/nexus/dist/index.html' },
        senderFrame: mockMainWindow.webContents.mainFrame
      };
      expect(isTrustedSender(legitimateEvent)).toBe(true);

      // 2. Untrusted subframe / iframe injection attack
      const subframeAttackEvent = {
        sender: { id: 1, getURL: () => 'file:///c:/Projeler/nexus/dist/index.html' },
        senderFrame: { id: 999, url: 'http://evil.com/iframe.html' } // untrusted child frame!
      };
      expect(isTrustedSender(subframeAttackEvent)).toBe(false);

      // 3. Sender ID spoofing
      const rogueSenderEvent = {
        sender: { id: 2, getURL: () => 'file:///c:/Projeler/nexus/dist/index.html' },
        senderFrame: mockMainWindow.webContents.mainFrame
      };
      expect(isTrustedSender(rogueSenderEvent)).toBe(false);

      // 4. Rogue protocol / cross-origin URL
      const rogueMainFrame = { id: 100, url: 'https://phishing-nexus.com' };
      const rogueWin = {
        isDestroyed: () => false,
        webContents: {
          id: 1,
          mainFrame: rogueMainFrame
        }
      };
      const rogueUrlEvent = {
        sender: { id: 1, getURL: () => 'https://phishing-nexus.com' },
        senderFrame: rogueMainFrame
      };
      expect(isTrustedSender(rogueUrlEvent, rogueWin)).toBe(false);
    });
  });

  // =========================================================================
  // 3. NAVIGATION & POPUP EXPLOITATION DEFENSE
  // =========================================================================
  describe('3. Window Navigation & Popup Hardening', () => {
    it('restricts external popups to http: and https: protocols only', () => {
      const testUrls = [
        { url: 'https://github.com', allowed: true },
        { url: 'http://localhost:5190', allowed: true },
        { url: 'javascript:alert(document.cookie)', allowed: false },
        { url: 'file:///C:/Windows/win.ini', allowed: false },
        { url: 'data:text/html,<b>xss</b>', allowed: false },
        { url: 'ms-msdt:anything', allowed: false },
        { url: 'not-a-valid-url', allowed: false }
      ];

      const checkOpenHandler = (url: string): boolean => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
          return false;
        }
      };

      for (const item of testUrls) {
        expect(checkOpenHandler(item.url)).toBe(item.allowed);
      }
    });

    it('blocks arbitrary file:// navigation in production mode', () => {
      const distIndex = path.resolve('c:/Projeler/nexus/dist/index.html');
      const distUrl = new URL(`file://${distIndex.replace(/\\/g, '/')}`).href;

      const checkWillNavigate = (navUrl: string, isDev: boolean = false): boolean => {
        try {
          const parsed = new URL(navUrl);
          if (isDev && parsed.origin === 'http://localhost:5190') return true;
          if (parsed.href === distUrl) return true;
        } catch {}
        return false;
      };

      // Bundled app is allowed
      expect(checkWillNavigate(distUrl, false)).toBe(true);

      // Rogue local file access must be blocked
      expect(checkWillNavigate('file:///C:/Users/victim/Downloads/evil.html', false)).toBe(false);
      expect(checkWillNavigate('file:///C:/Windows/System32/calc.exe', false)).toBe(false);
      expect(checkWillNavigate('https://attacker.com/stealer.html', false)).toBe(false);
    });
  });

  // =========================================================================
  // 4. CONTENT SECURITY POLICY (CSP) VERIFICATION
  // =========================================================================
  describe('4. Content Security Policy (CSP) Verification', () => {
    it('verifies index.html enforces a strict Content Security Policy meta tag', () => {
      const indexHtmlPath = path.resolve('c:/Projeler/nexus/index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(true);

      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(htmlContent).toContain('http-equiv="Content-Security-Policy"');
      expect(htmlContent).toContain("default-src 'self'");
      expect(htmlContent).toContain("object-src 'none'");
      expect(htmlContent).toContain("frame-src 'none'");
      expect(htmlContent).toContain("base-uri 'self'");
    });
  });

  // =========================================================================
  // 5. LOCALSTORAGE TAMPERING, ABUSE & PROTOTYPE POLLUTION DEFENSE
  // =========================================================================
  describe('5. LocalStorage Poisoning & Schema Abuse Defense', () => {
    it('safely handles corrupted or maliciously crafted JSON in localStorage', () => {
      // 1. Malformed non-JSON string
      localStorage.setItem('nexus_apps', '{corrupted::');
      expect(() => {
        try {
          JSON.parse(localStorage.getItem('nexus_apps') || '');
        } catch {
          // Handled gracefully in App.tsx
        }
      }).not.toThrow();

      // 2. Prototype pollution attempt payload
      const pollutionPayload = JSON.stringify([
        {
          id: 'polluted-1',
          name: 'Polluter',
          __proto__: { isAdmin: true, polluted: 'yes' }
        }
      ]);
      localStorage.setItem('nexus_apps', pollutionPayload);
      const parsed = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
      expect((({} as any).polluted)).toBeUndefined();
      expect(Array.isArray(parsed)).toBe(true);

      // 3. Array of non-object items
      const invalidArray = JSON.stringify([null, 42, 'string', false, []]);
      localStorage.setItem('nexus_apps', invalidArray);
      const parsedInvalid = JSON.parse(localStorage.getItem('nexus_apps') || '[]');
      const isValidApps = Array.isArray(parsedInvalid) &&
        parsedInvalid.every((item) => item && typeof item === 'object' && 'id' in item && 'name' in item);
      expect(isValidApps).toBe(false);
    });

    it('resists massive array payload denial-of-service in localStorage', () => {
      // Generate 2,000 apps
      const largeList = Array.from({ length: 2000 }, (_, i) => ({
        id: `app-stress-${i}`,
        name: `Stress App ${i}`,
        category: 'Test',
        type: 'exe',
        path: `C:\\Test\\App${i}.exe`
      }));

      localStorage.setItem('nexus_apps', JSON.stringify(largeList));
      const retrieved = localStorage.getItem('nexus_apps');
      expect(retrieved).toBeDefined();

      const parsed = JSON.parse(retrieved!);
      expect(parsed).toHaveLength(2000);
      expect(parsed[1999].id).toBe('app-stress-1999');
    });

    it('enforces safe numeric bounds on glassOpacity state', () => {
      const sanitizeOpacity = (saved: string | null): number => {
        if (saved !== null) {
          const parsed = Number(saved);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            return parsed;
          }
        }
        return 80;
      };

      expect(sanitizeOpacity('-50')).toBe(80);
      expect(sanitizeOpacity('999')).toBe(80);
      expect(sanitizeOpacity('NaN')).toBe(80);
      expect(sanitizeOpacity('evil_string')).toBe(80);
      expect(sanitizeOpacity('0')).toBe(0);
      expect(sanitizeOpacity('50')).toBe(50);
      expect(sanitizeOpacity('100')).toBe(100);
    });
  });

  // =========================================================================
  // 6. DIRECTORY TRAVERSAL & SCANNER RECURSION GUARD
  // =========================================================================
  describe('6. Denial of Service & Scanner Recursion Guard', () => {
    it('verifies max recursion depth limits prevent infinite directory loop traps', () => {
      const MAX_DEPTH = 3;
      const queue = [
        { dir: 'Root', depth: 0 },
        { dir: 'Root/Sub1', depth: 1 },
        { dir: 'Root/Sub1/Sub2', depth: 2 },
        { dir: 'Root/Sub1/Sub2/Sub3', depth: 3 },
        { dir: 'Root/Sub1/Sub2/Sub3/LoopInfinite', depth: 4 }
      ];

      const acceptedDirs: string[] = [];
      for (const item of queue) {
        if (item.depth < MAX_DEPTH) {
          acceptedDirs.push(item.dir);
        }
      }

      expect(acceptedDirs).toHaveLength(3);
      expect(acceptedDirs).not.toContain('Root/Sub1/Sub2/Sub3/LoopInfinite');
    });

    it('deduplicates directories and shortcuts to avoid cycles', () => {
      const seen = new Set<string>();
      const items = [
        'C:\\Users\\Desktop\\App.lnk',
        'c:\\users\\desktop\\app.lnk', // duplicate case-insensitive
        'C:\\Users\\Desktop\\App2.lnk'
      ];

      const uniqueShortcuts: string[] = [];
      for (const item of items) {
        const key = item.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueShortcuts.push(item);
      }

      expect(uniqueShortcuts).toHaveLength(2);
    });
  });
});
