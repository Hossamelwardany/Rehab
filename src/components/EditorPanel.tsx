import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  KeyRound,
  Layers,
  LogOut,
  Mail,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { createBlankSection } from '../data/defaultSiteConfig';
import type {
  BrandColors,
  SectionItem,
  SectionTheme,
  SectionType,
  SiteConfig,
  SiteSection,
} from '../data/defaultSiteConfig';
import { ImageUploadField } from './ImageUploadField';

interface EditorPanelProps {
  site: SiteConfig;
  authToken: string;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onUpdateSite: (nextSite: SiteConfig) => void;
  onSaveSite: () => Promise<boolean>;
  onResetSite: () => Promise<void>;
  onClose: () => void;
  onLogout: () => void;
  dirty: boolean;
  saving: boolean;
  saveStatus: string;
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

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'الواجهة الرئيسية',
  about: 'من نحن',
  identity: 'الرؤية والرسالة والقيم',
  services_cards: 'الخدمات الرئيسية',
  training: 'التدريب والكورسات والتطوير',
  marketing_grid: 'خدمات التسويق',
  steps: 'خطوات العمل',
  team: 'فريق العمل والإدارات',
  features: 'مميزات / لماذا رحاب',
  gallery: 'معرض صور وأعمال',
  text_image: 'قسم نص وصورة',
  clients: 'عملاء وشركاء النجاح',
  stats: 'أرقام وإحصائيات',
  cards: 'قسم بطاقات مخصص',
  contact: 'تواصل معنا',
};

const ADDABLE_SECTION_TYPES: SectionType[] = [
  'gallery',
  'text_image',
  'cards',
  'clients',
  'stats',
  'steps',
  'features',
];

const COLOR_PRESETS: { name: string; colors: BrandColors }[] = [
  {
    name: 'الأخضر الداكن والذهبي (الرسمي)',
    colors: {
      dark: '#0B3D38',
      accent: '#0F6E56',
      gold: '#E5A93B',
      tint: '#F2F7F5',
      ink: '#1A2726',
    },
  },
  {
    name: 'الزمردي العميق والعنبر',
    colors: {
      dark: '#063229',
      accent: '#157A62',
      gold: '#F2A44B',
      tint: '#EEF6F3',
      ink: '#172523',
    },
  },
  {
    name: 'الأزرق المؤسسي والذهبي',
    colors: {
      dark: '#0F2537',
      accent: '#1C4E73',
      gold: '#DFA63F',
      tint: '#F2F6FA',
      ink: '#17222D',
    },
  },
  {
    name: 'الأخضر الزيتوني والرملي',
    colors: {
      dark: '#223326',
      accent: '#3E5E44',
      gold: '#D9A043',
      tint: '#F5F7F3',
      ink: '#1F241F',
    },
  },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  site,
  authToken,
  selectedSectionId,
  onSelectSection,
  onUpdateSite,
  onSaveSite,
  onResetSite,
  onClose,
  onLogout,
  dirty,
  saving,
  saveStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'settings'>('sections');
  const [newSectionType, setNewSectionType] = useState<SectionType>('gallery');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [inquiriesLoaded, setInquiriesLoaded] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings' && !inquiriesLoaded) {
      fetch('/api/inquiries', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((data: { inquiries?: InquiryRecord[] }) => {
          if (Array.isArray(data.inquiries)) {
            setInquiries(data.inquiries);
          }
          setInquiriesLoaded(true);
        })
        .catch(() => setInquiriesLoaded(true));
    }
  }, [activeTab, authToken, inquiriesLoaded]);

  const selectedSection = site.sections.find((s) => s.id === selectedSectionId) || null;

  const updateBrand = (patch: Partial<SiteConfig['brand']>) => {
    onUpdateSite({
      ...site,
      brand: { ...site.brand, ...patch },
    });
  };

  const updateColors = (patch: Partial<BrandColors>) => {
    onUpdateSite({
      ...site,
      brand: {
        ...site.brand,
        colors: { ...site.brand.colors, ...patch },
      },
    });
  };

  const updateSection = (id: string, patch: Partial<SiteSection>) => {
    onUpdateSite({
      ...site,
      sections: site.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const moveSection = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= site.sections.length) return;
    const next = [...site.sections];
    [next[index], next[target]] = [next[target], next[index]];
    onUpdateSite({ ...site, sections: next });
  };

  const deleteSection = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
      return;
    }
    onUpdateSite({
      ...site,
      sections: site.sections.filter((s) => s.id !== id),
    });
    if (selectedSectionId === id) {
      onSelectSection(null);
    }
    setConfirmDeleteId(null);
  };

  const handleAddSection = () => {
    const created = createBlankSection(newSectionType);
    onUpdateSite({
      ...site,
      sections: [...site.sections, created],
    });
    onSelectSection(created.id);
    setTimeout(() => {
      document.getElementById(created.id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateSectionItem = (
    sectionId: string,
    field: 'items' | 'courses' | 'developments',
    itemId: string,
    patch: Partial<SectionItem>
  ) => {
    const sec = site.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const list = sec[field] || [];
    updateSection(sectionId, {
      [field]: list.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    });
  };

  const addSectionItem = (sectionId: string, field: 'items' | 'courses' | 'developments') => {
    const sec = site.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const list = sec[field] || [];
    const newItem: SectionItem = {
      id: `item-${Date.now()}`,
      title: sec.type === 'clients' ? 'شريك نجاح جديد' : 'عنصر جديد',
      text: sec.type === 'clients' || sec.type === 'stats' ? '' : 'وصف مختصر للعنصر.',
      value: sec.type === 'stats' ? '+10' : sec.type === 'contact' ? 'بيان التواصل' : '',
      label: sec.type === 'contact' ? 'وسيلة تواصل' : '',
      imageUrl: '',
    };
    updateSection(sectionId, { [field]: [...list, newItem] });
  };

  const removeSectionItem = (
    sectionId: string,
    field: 'items' | 'courses' | 'developments',
    itemId: string
  ) => {
    const sec = site.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const list = sec[field] || [];
    updateSection(sectionId, { [field]: list.filter((it) => it.id !== itemId) });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setPwMsg(json.error || 'تعذر تغيير كلمة المرور.');
      } else {
        setPwMsg('تم تحديث كلمة المرور بنجاح.');
        setCurrentPw('');
        setNewPw('');
      }
    } catch {
      setPwMsg('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setPwLoading(false);
    }
  };

  const renderItemsEditor = (
    sec: SiteSection,
    field: 'items' | 'courses' | 'developments',
    heading: string
  ) => {
    const list = sec[field] || [];
    const supportsItemImages =
      sec.type === 'gallery' ||
      sec.type === 'clients' ||
      sec.type === 'cards' ||
      sec.type === 'services_cards' ||
      sec.type === 'marketing_grid';

    return (
      <div className="space-y-3 pt-4 border-t border-black/10">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-extrabold text-[#0B3D38]">{heading}</h4>
          <button
            type="button"
            onClick={() => addSectionItem(sec.id, field)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0F6E56] text-white text-xs font-bold hover:bg-[#0B3D38] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة عنصر</span>
          </button>
        </div>

        {list.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-xl border border-black/12 bg-[#F6FAF9] p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F6E56] tabular-nums">
                عنصر {String(idx + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => removeSectionItem(sec.id, field, item.id)}
                className="text-xs text-red-700 hover:text-red-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>

            {sec.type === 'contact' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold mb-1">اسم الوسيلة</label>
                  <input
                    type="text"
                    value={item.label || item.title}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, {
                        label: e.target.value,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">القيمة (رقم / بريد / عنوان)</label>
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, { value: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">وصف إضافي</label>
                  <input
                    type="text"
                    value={item.subtitle || ''}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, { subtitle: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
              </>
            ) : sec.type === 'stats' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">الرقم</label>
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, { value: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">الوصف</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, { title: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold mb-1">العنوان</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      updateSectionItem(sec.id, field, item.id, { title: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                  />
                </div>
                {sec.type === 'team' && (
                  <div>
                    <label className="block text-[11px] font-bold mb-1">الدور / الاختصاص</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) =>
                        updateSectionItem(sec.id, field, item.id, { subtitle: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                    />
                  </div>
                )}
                {sec.type !== 'clients' && (
                  <div>
                    <label className="block text-[11px] font-bold mb-1">الوصف</label>
                    <textarea
                      rows={2}
                      value={item.text || ''}
                      onChange={(e) =>
                        updateSectionItem(sec.id, field, item.id, { text: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                    />
                  </div>
                )}
                {(sec.type === 'services_cards' || sec.type === 'cards') && (
                  <div>
                    <label className="block text-[11px] font-bold mb-1">
                      البنود (سطر لكل بند)
                    </label>
                    <textarea
                      rows={3}
                      value={item.list || ''}
                      onChange={(e) =>
                        updateSectionItem(sec.id, field, item.id, { list: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs"
                    />
                  </div>
                )}
                {supportsItemImages && (
                  <ImageUploadField
                    label="صورة العنصر (اختياري)"
                    value={item.imageUrl || ''}
                    onChange={(url) =>
                      updateSectionItem(sec.id, field, item.id, { imageUrl: url })
                    }
                    authToken={authToken}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside
      className="fixed top-0 bottom-0 left-0 z-50 w-full sm:w-[440px] bg-white text-[#1A2726] border-r border-black/15 shadow-2xl flex flex-col"
      aria-label="لوحة تعديل الصفحة"
    >
      {/* Top Studio Header */}
      <div className="px-5 py-4 bg-[#0B3D38] text-white flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-display text-lg font-extrabold text-[#E5A93B]">
            صفحة تعديل الموقع
          </h2>
          <p className="text-[11px] text-[#CFE8E0]">
            عدّل الأقسام، الألوان، والصور واضغط حفظ لتطبيقها فوراً
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            title="تسجيل الخروج"
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-[#CFE8E0] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="إغلاق لوحة التعديل"
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="grid grid-cols-3 border-b border-black/10 bg-[#F6FAF9] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sections'
              ? 'border-[#0B3D38] text-[#0B3D38] bg-white'
              : 'border-transparent text-[#556B67] hover:text-[#0B3D38]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الأقسام</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'theme'
              ? 'border-[#0B3D38] text-[#0B3D38] bg-white'
              : 'border-transparent text-[#556B67] hover:text-[#0B3D38]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>الألوان والهوية</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#0B3D38] text-[#0B3D38] bg-white'
              : 'border-transparent text-[#556B67] hover:text-[#0B3D38]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>الرسائل والأمان</span>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'sections' && !selectedSection && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#445956]">
                أقسام الصفحة ({site.sections.length}) — اضغط على أي قسم أو اختر تعديل
              </div>
              {site.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="rounded-xl border border-black/12 bg-[#F6FAF9] p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-[#0F6E56]">
                        {String(idx + 1).padStart(2, '0')} · {SECTION_TYPE_LABELS[sec.type]}
                      </div>
                      <div className="font-display text-sm font-extrabold text-[#0B3D38]">
                        {sec.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSection(sec.id);
                        document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0B3D38] text-white text-xs font-bold hover:bg-[#0F6E56] cursor-pointer"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-black/15 bg-white text-[#0B3D38] disabled:opacity-35 cursor-pointer"
                      aria-label="تحريك لأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 1)}
                      disabled={idx === site.sections.length - 1}
                      className="p-1.5 rounded-lg border border-black/15 bg-white text-[#0B3D38] disabled:opacity-35 cursor-pointer"
                      aria-label="تحريك لأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSection(sec.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        confirmDeleteId === sec.id
                          ? 'bg-red-700 text-white'
                          : 'border border-red-200 text-red-700 bg-white hover:bg-red-50'
                      }`}
                    >
                      {confirmDeleteId === sec.id ? 'تأكيد الحذف؟' : 'حذف'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Section Builder */}
            <div className="rounded-xl border border-[#0B3D38]/20 bg-[#EEF5F3] p-4 space-y-3">
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                إضافة قسم جديد للصفحة
              </h3>
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value as SectionType)}
                className="w-full px-3 py-2 rounded-lg border border-black/20 bg-white text-xs font-semibold"
              >
                {ADDABLE_SECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SECTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSection}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0B3D38] text-[#E5A93B] font-display text-xs font-extrabold hover:bg-[#0F6E56] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة القسم الآن</span>
              </button>
            </div>
          </>
        )}

        {/* Section Detailed Editor */}
        {activeTab === 'sections' && selectedSection && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onSelectSection(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6E56] hover:text-[#0B3D38] cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الأقسام</span>
            </button>

            <div className="pb-2 border-b border-black/10">
              <div className="text-[11px] font-bold text-[#0F6E56]">
                {SECTION_TYPE_LABELS[selectedSection.type]}
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#0B3D38]">
                {selectedSection.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">اسم القسم في القائمة العلوية</label>
                <input
                  type="text"
                  value={selectedSection.navLabel}
                  onChange={(e) =>
                    updateSection(selectedSection.id, { navLabel: e.target.value })
                  }
                  placeholder="اتركه فارغاً للإخفاء"
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">لون خلفية القسم</label>
                <select
                  value={selectedSection.theme}
                  onChange={(e) =>
                    updateSection(selectedSection.id, {
                      theme: e.target.value as SectionTheme,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black/20 bg-white text-xs"
                >
                  <option value="dark">داكن (لون الهوية)</option>
                  <option value="light">أبيض نقي</option>
                  <option value="tint">فاتح مخضر</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">العنوان التمهيدي (Kicker)</label>
              <input
                type="text"
                value={selectedSection.kicker || ''}
                onChange={(e) => updateSection(selectedSection.id, { kicker: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">العنوان الرئيسي</label>
              <input
                type="text"
                value={selectedSection.title}
                onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
              />
            </div>

            {selectedSection.type !== 'hero' && (
              <div>
                <label className="block text-xs font-bold mb-1">العنوان الفرعي</label>
                <input
                  type="text"
                  value={selectedSection.subtitle || ''}
                  onChange={(e) =>
                    updateSection(selectedSection.id, { subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
            )}

            {(selectedSection.type === 'hero' || selectedSection.type === 'contact') && (
              <div>
                <label className="block text-xs font-bold mb-1">الشعار / الجملة البارزة</label>
                <input
                  type="text"
                  value={selectedSection.slogan || ''}
                  onChange={(e) =>
                    updateSection(selectedSection.id, { slogan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
            )}

            {(selectedSection.type === 'hero' ||
              selectedSection.type === 'about' ||
              selectedSection.type === 'text_image' ||
              selectedSection.type === 'contact') && (
              <div>
                <label className="block text-xs font-bold mb-1">النص</label>
                <textarea
                  rows={3}
                  value={selectedSection.text || ''}
                  onChange={(e) => updateSection(selectedSection.id, { text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
            )}

            {selectedSection.type === 'about' && (
              <div>
                <label className="block text-xs font-bold mb-1">الفقرة التفصيلية</label>
                <textarea
                  rows={3}
                  value={selectedSection.body || ''}
                  onChange={(e) => updateSection(selectedSection.id, { body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
            )}

            {selectedSection.type === 'hero' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">نص الزر الأساسي</label>
                  <input
                    type="text"
                    value={selectedSection.primaryBtn || ''}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { primaryBtn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">نص الزر الثانوي</label>
                  <input
                    type="text"
                    value={selectedSection.secondaryBtn || ''}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { secondaryBtn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                  />
                </div>
              </div>
            )}

            {selectedSection.type === 'identity' && (
              <div className="space-y-3 pt-2 border-t border-black/10">
                <div>
                  <label className="block text-xs font-bold mb-1">نص الرؤية</label>
                  <textarea
                    rows={3}
                    value={selectedSection.visionText || ''}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { visionText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">نص الرسالة</label>
                  <textarea
                    rows={3}
                    value={selectedSection.missionText || ''}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { missionText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                  />
                </div>
              </div>
            )}

            {(selectedSection.type === 'hero' ||
              selectedSection.type === 'about' ||
              selectedSection.type === 'training' ||
              selectedSection.type === 'text_image') && (
              <ImageUploadField
                label="صورة القسم (اختياري)"
                value={selectedSection.imageUrl || ''}
                onChange={(url) => updateSection(selectedSection.id, { imageUrl: url })}
                authToken={authToken}
                helperText="ارفع صورة من جهازك ليتم عرضها داخل هذا القسم."
              />
            )}

            {selectedSection.type === 'training' ? (
              <>
                {renderItemsEditor(selectedSection, 'courses', 'عناصر قسم الكورسات')}
                {renderItemsEditor(selectedSection, 'developments', 'عناصر قسم التطوير')}
              </>
            ) : (
              selectedSection.type !== 'text_image' &&
              renderItemsEditor(selectedSection, 'items', 'عناصر القسم')
            )}
          </div>
        )}

        {/* TAB 2: Colors & Brand Identity */}
        {activeTab === 'theme' && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38] mb-2">
                مجموعات ألوان جاهزة
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => updateColors(preset.colors)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-black/15 hover:border-[#0B3D38] bg-[#F6FAF9] text-right cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#0B3D38]">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      {[preset.colors.dark, preset.colors.accent, preset.colors.gold].map((c) => (
                        <span
                          key={c}
                          className="w-5 h-5 rounded border border-black/15"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-black/10">
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                تخصيص الألوان يدوياً
              </h3>
              {(
                [
                  { key: 'dark', label: 'اللون الداكن الأساسي (الخلفية والعناوين)' },
                  { key: 'accent', label: 'اللون الثانوي (الأخضر المتوسط)' },
                  { key: 'gold', label: 'اللون الذهبي / الأصفر (التمييز والأزرار)' },
                  { key: 'tint', label: 'لون الخلفية الفاتحة للأقسام' },
                  { key: 'ink', label: 'لون النصوص الداكنة' },
                ] as { key: keyof BrandColors; label: string }[]
              ).map((cField) => (
                <div key={cField.key} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-[#1A2726]">{cField.label}</label>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={site.brand.colors[cField.key]}
                      onChange={(e) => updateColors({ [cField.key]: e.target.value })}
                      className="w-20 px-2 py-1 rounded border border-black/20 text-xs font-mono text-center"
                      dir="ltr"
                    />
                    <input
                      type="color"
                      value={site.brand.colors[cField.key]}
                      onChange={(e) => updateColors({ [cField.key]: e.target.value })}
                      className="w-9 h-8 rounded border border-black/20 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-black/10">
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                بيانات الهوية والخط
              </h3>

              <ImageUploadField
                label="شعار الشركة (Logo)"
                value={site.brand.logoUrl}
                onChange={(url) => updateBrand({ logoUrl: url })}
                authToken={authToken}
                helperText="اختياري — يظهر في الشريط العلوي بجانب اسم الشركة."
              />

              <div>
                <label className="block text-xs font-bold mb-1">اسم الشركة المختصر (الشريط العلوي)</label>
                <input
                  type="text"
                  value={site.brand.name}
                  onChange={(e) => updateBrand({ name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">الاسم الرسمي الكامل</label>
                <input
                  type="text"
                  value={site.brand.fullTitle}
                  onChange={(e) => updateBrand({ fullTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">الشعار اللفظي (Slogan)</label>
                <input
                  type="text"
                  value={site.brand.slogan}
                  onChange={(e) => updateBrand({ slogan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">الخط العربي</label>
                <select
                  value={site.brand.font}
                  onChange={(e) =>
                    updateBrand({
                      font: e.target.value as SiteConfig['brand']['font'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black/20 bg-white text-xs"
                >
                  <option value="Cairo">Cairo (احترافي رسمي)</option>
                  <option value="Tajawal">Tajawal (عصري مرن)</option>
                  <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic (مؤسسي تقني)</option>
                  <option value="Almarai">Almarai (واضح ومكثف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">زر الدعوة في الشريط العلوي</label>
                <input
                  type="text"
                  value={site.brand.ctaLabel}
                  onChange={(e) => updateBrand({ ctaLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">نص حقوق الفوتر</label>
                <input
                  type="text"
                  value={site.brand.footerText}
                  onChange={(e) => updateBrand({ footerText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Inquiries & Password Security */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Inquiries Inbox */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0F6E56]" />
                <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                  طلبات الاستشارة الواردة ({inquiries.length})
                </h3>
              </div>
              {inquiries.length === 0 ? (
                <div className="rounded-xl border border-black/10 bg-[#F6FAF9] p-4 text-xs text-[#556B67]">
                  لا توجد رسائل واردة حتى الآن.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="rounded-xl border border-black/12 bg-[#F6FAF9] p-3 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-[#0B3D38]">
                        <span>{inq.name}</span>
                        <span className="text-[11px] text-[#0F6E56]">{inq.service}</span>
                      </div>
                      <div className="text-[#445956]">
                        {inq.phone} {inq.email ? `· ${inq.email}` : ''}
                      </div>
                      <p className="text-[#1A2726] pt-1">{inq.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password */}
            <form
              onSubmit={handleChangePassword}
              className="space-y-3 pt-4 border-t border-black/10"
            >
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                تغيير كلمة مرور صفحة التعديل
              </h3>
              <div>
                <label className="block text-[11px] font-bold mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/20 text-xs"
                />
              </div>
              {pwMsg && <p className="text-xs font-semibold text-[#0F6E56]">{pwMsg}</p>}
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2 px-4 rounded-lg bg-[#0F6E56] text-white text-xs font-bold hover:bg-[#0B3D38] cursor-pointer"
              >
                {pwLoading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
              </button>
            </form>

            {/* Reset to Default */}
            <div className="pt-4 border-t border-black/10 space-y-2">
              <h3 className="font-display text-sm font-extrabold text-[#0B3D38]">
                استعادة المحتوى الافتراضي
              </h3>
              <p className="text-xs text-[#556B67]">
                يعيد جميع الأقسام والألوان إلى القالب الرسمي الافتراضي لشركة رحاب.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    setTimeout(() => setConfirmReset(false), 3500);
                    return;
                  }
                  setConfirmReset(false);
                  await onResetSite();
                }}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer ${
                  confirmReset
                    ? 'bg-red-700 text-white'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{confirmReset ? 'اضغط للتأكيد النهائي' : 'إعادة ضبط القالب الافتراضي'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Save Action */}
      <div className="p-4 border-t border-black/10 bg-white shrink-0 space-y-2">
        {saveStatus && (
          <div className="text-xs font-semibold text-center text-[#0F6E56] flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{saveStatus}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSaveSite}
          disabled={saving || !dirty}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B3D38] text-[#E5A93B] font-display text-sm font-extrabold hover:bg-[#0F6E56] hover:text-white disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جارٍ الحفظ...' : dirty ? 'حفظ ونشر التعديلات' : 'لا توجد تعديلات غير محفوظة'}</span>
        </button>
      </div>
    </aside>
  );
};
