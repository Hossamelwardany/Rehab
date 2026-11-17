import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { DEFAULT_SITE_CONFIG } from './src/data/defaultSiteConfig.ts';
import type { SiteConfig } from './src/data/defaultSiteConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_PATH = path.join(DATA_DIR, 'site-config.json');
const DEFAULT_PASSWORD = '1321994';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

interface StoredAuth {
  salt: string;
  hash: string;
  apiSecret: string;
}

interface PersistedData {
  site: SiteConfig;
  auth: StoredAuth;
}

interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
}

const INQUIRIES_PATH = path.join(DATA_DIR, 'inquiries.json');

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPasswordHash(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function readStoredData(): PersistedData {
  ensureStorage();
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(raw) as PersistedData;
      if (parsed && parsed.site && parsed.auth && parsed.auth.hash && parsed.auth.salt) {
        return parsed;
      }
    } catch {
      // Fallback to default below if corrupted
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const apiSecret = crypto.randomBytes(32).toString('hex');
  const initial: PersistedData = {
    site: structuredClone(DEFAULT_SITE_CONFIG),
    auth: {
      salt,
      hash: hashPassword(DEFAULT_PASSWORD, salt),
      apiSecret,
    },
  };
  writeStoredData(initial);
  return initial;
}

function writeStoredData(data: PersistedData): void {
  ensureStorage();
  const tmpPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, CONFIG_PATH);
}

function signToken(secret: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function extractBearer(req: Request): string {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return '';
}

function readInquiries(): InquiryRecord[] {
  ensureStorage();
  if (!fs.existsSync(INQUIRIES_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(INQUIRIES_PATH, 'utf8')) as InquiryRecord[];
  } catch {
    return [];
  }
}

async function startServer(): Promise<void> {
  ensureStorage();
  readStoredData();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Serve uploaded images cleanly
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  // Get public landing page configuration
  app.get('/api/site', (_req: Request, res: Response) => {
    const data = readStoredData();
    res.json({ site: data.site });
  });

  // Verify edit password (default: 1321994)
  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (!password) {
      res.status(400).json({ ok: false, error: 'يرجى إدخال كلمة المرور.' });
      return;
    }
    const data = readStoredData();
    const valid = verifyPasswordHash(password, data.auth.salt, data.auth.hash);
    if (!valid) {
      res.status(401).json({ ok: false, error: 'كلمة المرور غير صحيحة.' });
      return;
    }
    const token = signToken(data.auth.apiSecret);
    res.json({ ok: true, token });
  });

  // Check session token validity
  app.get('/api/auth/session', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    const valid = Boolean(token && verifyToken(token, data.auth.apiSecret));
    res.json({ valid });
  });

  // Change edit password
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    if (!token || !verifyToken(token, data.auth.apiSecret)) {
      res.status(401).json({ ok: false, error: 'غير مصرح. يرجى إعادة تسجيل الدخول.' });
      return;
    }

    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword.trim() : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword.trim() : '';

    if (!verifyPasswordHash(currentPassword, data.auth.salt, data.auth.hash)) {
      res.status(400).json({ ok: false, error: 'كلمة المرور الحالية غير صحيحة.' });
      return;
    }
    if (newPassword.length < 4) {
      res.status(400).json({ ok: false, error: 'يجب أن تتكون كلمة المرور الجديدة من 4 أحرف على الأقل.' });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    data.auth = {
      salt: newSalt,
      hash: hashPassword(newPassword, newSalt),
      apiSecret: data.auth.apiSecret,
    };
    writeStoredData(data);
    res.json({ ok: true });
  });

  // Save updated landing page config (sections, colors, texts, images)
  app.put('/api/site', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    if (!token || !verifyToken(token, data.auth.apiSecret)) {
      res.status(401).json({ ok: false, error: 'انتهت صلاحية الجلسة. يرجى إدخال كلمة المرور مرة أخرى.' });
      return;
    }

    const incoming = req.body?.site as SiteConfig | undefined;
    if (!incoming || !incoming.brand || !Array.isArray(incoming.sections)) {
      res.status(400).json({ ok: false, error: 'بيانات الصفحة غير صالحة.' });
      return;
    }

    const updatedSite: SiteConfig = {
      ...incoming,
      updatedAt: new Date().toISOString(),
    };
    data.site = updatedSite;
    writeStoredData(data);
    res.json({ ok: true, site: updatedSite });
  });

  // Reset landing page to default Rehab corporate content (keeps password)
  app.post('/api/site/reset', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    if (!token || !verifyToken(token, data.auth.apiSecret)) {
      res.status(401).json({ ok: false, error: 'غير مصرح.' });
      return;
    }

    const resetSite: SiteConfig = {
      ...structuredClone(DEFAULT_SITE_CONFIG),
      updatedAt: new Date().toISOString(),
    };
    data.site = resetSite;
    writeStoredData(data);
    res.json({ ok: true, site: resetSite });
  });

  // Upload image file from device (base64 payload -> saved to /uploads/)
  app.post('/api/upload', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    if (!token || !verifyToken(token, data.auth.apiSecret)) {
      res.status(401).json({ ok: false, error: 'غير مصرح برفع الصور. يرجى تسجيل الدخول أولاً.' });
      return;
    }

    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : '';
    const dataBase64 = typeof req.body?.dataBase64 === 'string' ? req.body.dataBase64 : '';

    const extMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };

    const ext = extMap[mimeType.toLowerCase()];
    if (!ext || !dataBase64) {
      res.status(400).json({ ok: false, error: 'صيغة الصورة غير مدعومة (PNG, JPG, WebP, SVG).' });
      return;
    }

    const cleanBase64 = dataBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ ok: false, error: 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت.' });
      return;
    }

    const fileName = `rehab-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    res.json({ ok: true, url: `/uploads/${fileName}` });
  });

  // Contact inquiry submission
  app.post('/api/inquiries', (req: Request, res: Response) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const service = typeof req.body?.service === 'string' ? req.body.service.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!name || (!phone && !email) || !message) {
      res.status(400).json({
        ok: false,
        error: 'يرجى إدخال الاسم ووسيلة تواصل وتفاصيل الطلب.',
      });
      return;
    }

    const records = readInquiries();
    records.unshift({
      id: `inq-${Date.now()}`,
      name,
      phone,
      email,
      service,
      message,
      createdAt: new Date().toISOString(),
    });
    fs.writeFileSync(INQUIRIES_PATH, JSON.stringify(records.slice(0, 200), null, 2), 'utf8');
    res.json({ ok: true });
  });

  app.get('/api/inquiries', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const data = readStoredData();
    if (!token || !verifyToken(token, data.auth.apiSecret)) {
      res.status(401).json({ ok: false, error: 'غير مصرح.' });
      return;
    }
    res.json({ inquiries: readInquiries() });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
