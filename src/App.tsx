import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Menu, X } from 'lucide-react';
import { EditorPanel } from './components/EditorPanel';
import { LandingSections } from './components/LandingSections';
import { PasswordModal } from './components/PasswordModal';
import { RehabWordmarkIcon } from './components/SlideVisuals';
import { DEFAULT_SITE_CONFIG } from './data/defaultSiteConfig';
import type { SiteConfig } from './data/defaultSiteConfig';

const TOKEN_STORAGE_KEY = 'rehab_editor_token';

export default function App() {
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [authToken, setAuthToken] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Load persisted site config from server
  useEffect(() => {
    fetch('/api/site')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { site?: SiteConfig } | null) => {
        if (data?.site && data.site.brand && Array.isArray(data.site.sections)) {
          setSite(data.site);
        }
      })
      .catch(() => {});
  }, []);

  // Check existing session token or #edit hash
  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
    const wantsEditHash =
      window.location.hash === '#edit' || window.location.search.includes('edit=1');

    if (savedToken) {
      fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then((data: { valid?: boolean }) => {
          if (data.valid) {
            setAuthToken(savedToken);
            if (wantsEditHash) setIsEditorOpen(true);
          } else {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            if (wantsEditHash) setIsPasswordModalOpen(true);
          }
        })
        .catch(() => {
          if (wantsEditHash) setIsPasswordModalOpen(true);
        });
    } else if (wantsEditHash) {
      setIsPasswordModalOpen(true);
    }
  }, []);

  // Update document title dynamically
  useEffect(() => {
    document.title = site.brand.fullTitle || site.brand.name;
  }, [site.brand.fullTitle, site.brand.name]);

  // Inject dynamic CSS custom properties for brand colors & font
  const themeStyle = useMemo(
    () =>
      ({
        '--brand-dark': site.brand.colors.dark,
        '--brand-accent': site.brand.colors.accent,
        '--brand-gold': site.brand.colors.gold,
        '--brand-tint': site.brand.colors.tint,
        '--brand-ink': site.brand.colors.ink,
        '--font-display': `'${site.brand.font}', 'Cairo', system-ui, sans-serif`,
        '--font-body': `'IBM Plex Sans Arabic', '${site.brand.font}', system-ui, sans-serif`,
        fontFamily: `var(--font-body)`,
      }) as React.CSSProperties,
    [site.brand.colors, site.brand.font]
  );

  // Top Bar Navigation links (max 5 concise items from sections with navLabel)
  const navLinks = useMemo(
    () =>
      site.sections
        .filter((s) => s.navLabel && s.navLabel.trim().length > 0)
        .slice(0, 5),
    [site.sections]
  );

  const handleOpenEdit = () => {
    if (authToken) {
      setIsEditorOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleAuthenticated = (token: string) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
    setIsPasswordModalOpen(false);
    setIsEditorOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken('');
    setIsEditorOpen(false);
    setSelectedSectionId(null);
  };

  const handleUpdateSite = (nextSite: SiteConfig) => {
    setSite(nextSite);
    setDirty(true);
    setSaveStatus('');
  };

  const handleSaveSite = async (): Promise<boolean> => {
    if (!authToken) {
      setIsPasswordModalOpen(true);
      return false;
    }
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ site }),
      });
      const json = (await res.json()) as { ok?: boolean; site?: SiteConfig; error?: string };
      if (!res.ok || !json.ok) {
        setSaveStatus(json.error || 'تعذر حفظ التعديلات.');
        if (res.status === 401) {
          handleLogout();
          setIsPasswordModalOpen(true);
        }
        return false;
      }
      if (json.site) setSite(json.site);
      setDirty(false);
      setSaveStatus('تم الحفظ ونشر التعديلات بنجاح');
      return true;
    } catch {
      setSaveStatus('حدث خطأ أثناء الاتصال بالخادم.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleResetSite = async () => {
    if (!authToken) return;
    setSaving(true);
    try {
      const res = await fetch('/api/site/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = (await res.json()) as { ok?: boolean; site?: SiteConfig };
      if (res.ok && json.ok && json.site) {
        setSite(json.site);
        setDirty(false);
        setSelectedSectionId(null);
        setSaveStatus('تمت استعادة القالب الافتراضي بنجاح');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={themeStyle} className="min-h-screen flex flex-col bg-white text-[#1A2726]">
      {/* Top Bar: Strict 3-Zone Contract */}
      <header
        className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md"
        style={{ backgroundColor: 'var(--brand-dark)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark / Logo */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-white"
          >
            {site.brand.logoUrl ? (
              <img
                src={site.brand.logoUrl}
                alt={site.brand.name}
                referrerPolicy="no-referrer"
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <RehabWordmarkIcon variant="dark" className="w-7 h-7 shrink-0" />
            )}
            <span className="font-display text-lg font-extrabold tracking-tight">
              {site.brand.name}
            </span>
          </a>

          {/* Zone 2: 4-5 Concise Single-Line Nav Links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-white/85"
            aria-label="التنقل الرئيسي"
          >
            {navLinks.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="py-1 whitespace-nowrap shrink-0 hover:text-white border-b-2 border-transparent hover:border-[#E5A93B] transition-colors"
              >
                {sec.navLabel}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contact"
              className="px-4 py-2 rounded-lg font-display text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--brand-dark)',
              }}
            >
              {site.brand.ctaLabel || 'تواصل معنا'}
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white cursor-pointer"
              aria-label="فتح القائمة"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-white/10 px-5 py-4 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--brand-dark)' }}
          >
            {navLinks.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium text-white/90 border-b border-white/10 last:border-b-0"
              >
                {sec.navLabel}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Landing Page Sections */}
      <div className={isEditorOpen ? 'lg:pl-[440px] transition-all' : ''}>
        <LandingSections
          site={site}
          isEditing={isEditorOpen}
          selectedSectionId={selectedSectionId}
          onSelectSection={(id) => setSelectedSectionId(id)}
        />

        {/* Quiet Corporate Footer with Discreet Password-Protected Edit Page Trigger */}
        <footer
          className="border-t border-white/10 py-8 text-white"
          style={{ backgroundColor: 'var(--brand-dark)' }}
        >
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="text-white/80 text-center sm:text-right">
              {site.brand.footerText}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" style={{ color: 'var(--brand-gold)' }} />
                <span>{isEditorOpen ? 'لوحة التعديل مفتوحة' : 'تعديل الصفحة'}</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Password Gate Modal (default password: 1321994) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Full Page Editor Studio */}
      {isEditorOpen && authToken && (
        <EditorPanel
          site={site}
          authToken={authToken}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onUpdateSite={handleUpdateSite}
          onSaveSite={handleSaveSite}
          onResetSite={handleResetSite}
          onClose={() => setIsEditorOpen(false)}
          onLogout={handleLogout}
          dirty={dirty}
          saving={saving}
          saveStatus={saveStatus}
        />
      )}
    </div>
  );
}
