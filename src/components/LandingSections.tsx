import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardList,
  Compass,
  Copy,
  FileCheck2,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  PenTool,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import type { SiteConfig, SiteSection } from '../data/defaultSiteConfig';
import { BrandGeometricMark } from './SlideVisuals';

interface LandingSectionsProps {
  site: SiteConfig;
  isEditing: boolean;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  megaphone: <Megaphone className="w-6 h-6" />,
  cap: <GraduationCap className="w-6 h-6" />,
  compass: <Compass className="w-6 h-6" />,
  share: <Share2 className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  pen: <PenTool className="w-5 h-5" />,
  layers: <Layers className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  address: <MapPin className="w-5 h-5" />,
  website: <Globe className="w-5 h-5" />,
};

export const LandingSections: React.FC<LandingSectionsProps> = ({
  site,
  isEditing,
  selectedSectionId,
  onSelectSection,
}) => {
  const [trainingFilter, setTrainingFilter] = useState<'all' | 'courses' | 'development'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Contact form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState('التسويق المتكامل');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleCopy = (id: string, value: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || (!formPhone.trim() && !formEmail.trim()) || !formMessage.trim()) {
      setFormError('يرجى إدخال الاسم ورقم الهاتف أو البريد الإلكتروني وتفاصيل الطلب.');
      setFormStatus('error');
      return;
    }
    setFormStatus('submitting');
    setFormError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail,
          service: formService,
          message: formMessage,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setFormError(json.error || 'تعذر إرسال الطلب.');
        setFormStatus('error');
        return;
      }
      setFormStatus('success');
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormMessage('');
    } catch {
      setFormError('حدث خطأ في الاتصال. يرجى المحاولة مجدداً.');
      setFormStatus('error');
    }
  };

  const getSectionBgStyle = (theme: SiteSection['theme']): React.CSSProperties => {
    if (theme === 'dark') {
      return {
        backgroundColor: 'var(--brand-dark)',
        color: '#FFFFFF',
      };
    }
    if (theme === 'tint') {
      return {
        backgroundColor: 'var(--brand-tint)',
        color: 'var(--brand-ink)',
      };
    }
    return {
      backgroundColor: '#FFFFFF',
      color: 'var(--brand-ink)',
    };
  };

  const renderSectionHeader = (section: SiteSection, index: number) => {
    const isDark = section.theme === 'dark';
    const numStr = String(index + 1).padStart(2, '0');
    return (
      <div
        className={`pb-6 mb-10 border-b flex flex-col md:flex-row md:items-end md:justify-between gap-4 ${
          isDark ? 'border-white/15' : 'border-black/10'
        }`}
      >
        <div>
          {section.kicker && (
            <div
              className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: isDark ? 'var(--brand-gold)' : 'var(--brand-accent)' }}
            >
              <span className="tabular-nums">{numStr}</span>
              <span aria-hidden="true">·</span>
              <span>{section.kicker}</span>
            </div>
          )}
          <h2
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-balance leading-snug"
            style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
          >
            {section.title}
          </h2>
        </div>
        {section.subtitle && (
          <p
            className={`text-sm sm:text-base max-w-md leading-relaxed ${
              isDark ? 'text-white/80' : 'text-black/70'
            }`}
          >
            {section.subtitle}
          </p>
        )}
      </div>
    );
  };

  return (
    <main>
      {site.sections.map((section, idx) => {
        const isDark = section.theme === 'dark';
        const isSelected = isEditing && selectedSectionId === section.id;

        const sectionWrapClass = `relative py-16 sm:py-22 transition-shadow ${
          isDark ? 'bg-architectural-grid' : 'bg-architectural-grid-light'
        } ${isEditing ? 'cursor-pointer' : ''} ${
          isSelected ? 'ring-4 ring-inset ring-[#E5A93B]' : ''
        }`;

        const handleSectionClick = () => {
          if (isEditing) {
            onSelectSection(section.id);
          }
        };

        // 1. HERO
        if (section.type === 'hero') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={`relative py-16 sm:py-24 lg:py-28 ${
                isDark ? 'bg-architectural-grid' : 'bg-architectural-grid-light'
              } ${isEditing ? 'cursor-pointer' : ''} ${
                isSelected ? 'ring-4 ring-inset ring-[#E5A93B]' : ''
              }`}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  {section.kicker && (
                    <div
                      className="text-sm sm:text-base font-semibold"
                      style={{ color: isDark ? 'var(--brand-gold)' : 'var(--brand-accent)' }}
                    >
                      {section.kicker}
                    </div>
                  )}
                  <h1
                    className="font-display text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold leading-[1.25] text-balance"
                    style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                  >
                    {section.title}
                  </h1>
                  {section.slogan && (
                    <p
                      className="font-display text-xl sm:text-2xl font-bold leading-relaxed text-balance"
                      style={{ color: isDark ? 'var(--brand-gold)' : 'var(--brand-accent)' }}
                    >
                      «{section.slogan}»
                    </p>
                  )}
                  {section.text && (
                    <p
                      className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
                        isDark ? 'text-white/85' : 'text-black/75'
                      }`}
                    >
                      {section.text}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    {section.primaryBtn && (
                      <a
                        href="#contact"
                        onClick={(e) => {
                          if (isEditing) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-display font-bold text-base transition-opacity hover:opacity-90 whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--brand-gold)',
                          color: 'var(--brand-dark)',
                        }}
                      >
                        <span>{section.primaryBtn}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </a>
                    )}
                    {section.secondaryBtn && (
                      <a
                        href="#services"
                        onClick={(e) => {
                          if (isEditing) e.preventDefault();
                        }}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base border transition-colors whitespace-nowrap ${
                          isDark
                            ? 'border-white/25 text-white hover:bg-white/10'
                            : 'border-black/20 text-[#0B3D38] hover:bg-black/5'
                        }`}
                      >
                        {section.secondaryBtn}
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 flex items-center justify-center">
                  {section.imageUrl ? (
                    <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/10">
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[4/3] object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[340px] lg:h-[340px]">
                      <BrandGeometricMark className="w-full h-full" />
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // 2. ABOUT
        if (section.type === 'about') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div
                    className={`lg:col-span-7 rounded-xl p-6 sm:p-8 flex flex-col justify-between border ${
                      isDark
                        ? 'bg-white/8 border-white/15'
                        : 'bg-[#F6FAF9] border-black/10'
                    }`}
                  >
                    <div className="space-y-5">
                      {section.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-black/10 mb-5">
                          <img
                            src={section.imageUrl}
                            alt={section.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-56 object-cover"
                          />
                        </div>
                      )}
                      {section.text && (
                        <p
                          className="font-display text-xl sm:text-2xl font-bold leading-relaxed text-balance"
                          style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                        >
                          {section.text}
                        </p>
                      )}
                      {section.body && (
                        <p
                          className={`text-base sm:text-[17px] leading-[1.85] ${
                            isDark ? 'text-white/80' : 'text-black/75'
                          }`}
                        >
                          {section.body}
                        </p>
                      )}
                    </div>

                    {section.stats && section.stats.length > 0 && (
                      <div
                        className={`grid grid-cols-3 gap-4 pt-6 mt-6 border-t ${
                          isDark ? 'border-white/15' : 'border-black/10'
                        }`}
                      >
                        {section.stats.map((st, sIdx) => (
                          <div key={sIdx}>
                            <div
                              className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums"
                              style={{
                                color: isDark ? 'var(--brand-gold)' : 'var(--brand-dark)',
                              }}
                            >
                              {st.value}
                            </div>
                            <div
                              className={`text-xs sm:text-sm mt-1 ${
                                isDark ? 'text-white/75' : 'text-black/65'
                              }`}
                            >
                              {st.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    {section.items.map((pillar, pIdx) => (
                      <div
                        key={pillar.id}
                        className={`flex-1 rounded-xl p-5 flex items-start gap-4 border ${
                          isDark
                            ? 'bg-white/8 border-white/15'
                            : 'bg-white border-black/10'
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-lg font-display font-extrabold text-base flex items-center justify-center shrink-0 tabular-nums"
                          style={{
                            backgroundColor: isDark ? 'var(--brand-gold)' : 'var(--brand-dark)',
                            color: isDark ? 'var(--brand-dark)' : 'var(--brand-gold)',
                          }}
                        >
                          {String(pIdx + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h3
                            className="font-display text-lg font-bold mb-1"
                            style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                          >
                            {pillar.title}
                          </h3>
                          <p
                            className={`text-sm leading-relaxed ${
                              isDark ? 'text-white/80' : 'text-black/70'
                            }`}
                          >
                            {pillar.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 3. IDENTITY (Vision, Mission, Values)
        if (section.type === 'identity') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div
                    className="rounded-xl p-6 sm:p-8 flex flex-col justify-between text-white"
                    style={{ backgroundColor: 'var(--brand-dark)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="font-display text-xl sm:text-2xl font-bold"
                        style={{ color: 'var(--brand-gold)' }}
                      >
                        {section.visionTitle || 'رؤيتنا'}
                      </h3>
                      <Compass className="w-6 h-6" style={{ color: 'var(--brand-gold)' }} />
                    </div>
                    <p className="text-base sm:text-[17px] text-white/90 leading-[1.85]">
                      {section.visionText}
                    </p>
                  </div>

                  <div className="bg-white text-[#1A2726] border border-black/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="font-display text-xl sm:text-2xl font-bold"
                        style={{ color: 'var(--brand-dark)' }}
                      >
                        {section.missionTitle || 'رسالتنا'}
                      </h3>
                      <Target className="w-6 h-6" style={{ color: 'var(--brand-accent)' }} />
                    </div>
                    <p className="text-base sm:text-[17px] text-black/80 leading-[1.85]">
                      {section.missionText}
                    </p>
                  </div>
                </div>

                <div>
                  <h3
                    className="font-display text-base font-bold mb-4"
                    style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                  >
                    قيمنا الأساسية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section.items.map((val, vIdx) => (
                      <div
                        key={val.id}
                        className="bg-white text-[#1A2726] border border-black/10 rounded-xl p-5 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="font-display text-lg font-extrabold"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            {val.title}
                          </span>
                          <span
                            className="font-display text-sm font-bold tabular-nums"
                            style={{ color: 'var(--brand-accent)' }}
                          >
                            {String(vIdx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm text-black/70 leading-relaxed">{val.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 4. MAIN SERVICES / CUSTOM CARDS
        if (section.type === 'services_cards' || section.type === 'cards') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item, cIdx) => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-6 sm:p-7 flex flex-col justify-between border ${
                        isDark
                          ? 'bg-white text-[#1A2726] border-white/20'
                          : 'bg-white text-[#1A2726] border-black/10'
                      }`}
                    >
                      <div>
                        {item.imageUrl ? (
                          <div className="rounded-lg overflow-hidden mb-5 border border-black/10">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-44 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-5">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: 'var(--brand-gold)',
                                color: 'var(--brand-dark)',
                              }}
                            >
                              {ICONS_MAP[item.iconKey || 'briefcase'] || (
                                <Briefcase className="w-6 h-6" />
                              )}
                            </div>
                            <span
                              className="font-display text-lg font-extrabold tabular-nums"
                              style={{ color: 'var(--brand-accent)' }}
                            >
                              {String(cIdx + 1).padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        <h3
                          className="font-display text-2xl font-extrabold mb-3"
                          style={{ color: 'var(--brand-dark)' }}
                        >
                          {item.title}
                        </h3>
                        {item.text && (
                          <p className="text-sm sm:text-base text-black/75 leading-relaxed mb-5">
                            {item.text}
                          </p>
                        )}
                      </div>

                      {item.list && (
                        <div className="pt-4 border-t border-black/10">
                          <ul className="space-y-2.5">
                            {item.list
                              .split('\n')
                              .filter((line) => line.trim())
                              .map((line, lIdx) => (
                                <li
                                  key={lIdx}
                                  className="flex items-start gap-2.5 text-sm font-medium text-[#1A2726]"
                                >
                                  <CheckCircle2
                                    className="w-4 h-4 shrink-0 mt-1"
                                    style={{ color: 'var(--brand-accent)' }}
                                  />
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 5. TRAINING, COURSES & DEVELOPMENT (Dedicated Centerpiece Section)
        if (section.type === 'training') {
          const courses = section.courses || [];
          const devs = section.developments || [];
          const showCourses = trainingFilter === 'all' || trainingFilter === 'courses';
          const showDev = trainingFilter === 'all' || trainingFilter === 'development';

          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="pb-6 mb-8 border-b border-black/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div
                      className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2"
                      style={{ color: 'var(--brand-accent)' }}
                    >
                      <span className="tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{section.kicker || 'إدارة التدريب والتأهيل'}</span>
                    </div>
                    <h2
                      className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-balance"
                      style={{ color: 'var(--brand-dark)' }}
                    >
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-sm sm:text-base text-black/70 mt-2">{section.subtitle}</p>
                    )}
                  </div>

                  <div
                    className="inline-flex items-center gap-1 p-1 rounded-lg border border-black/10 shrink-0"
                    style={{ backgroundColor: 'var(--brand-tint)' }}
                    role="tablist"
                    aria-label="تصفية مسارات التدريب"
                  >
                    {[
                      { key: 'all', label: 'العرض الكامل' },
                      { key: 'courses', label: 'قسم الكورسات' },
                      { key: 'development', label: 'قسم التطوير' },
                    ].map((tab) => {
                      const active = trainingFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrainingFilter(tab.key as 'all' | 'courses' | 'development');
                          }}
                          className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer"
                          style={
                            active
                              ? { backgroundColor: 'var(--brand-dark)', color: '#FFFFFF' }
                              : { color: 'var(--brand-dark)' }
                          }
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {section.imageUrl && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-black/10">
                    <img
                      src={section.imageUrl}
                      alt={section.title}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-72 object-cover"
                    />
                  </div>
                )}

                <div
                  className={`grid gap-6 ${
                    trainingFilter === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'
                  }`}
                >
                  {showCourses && (
                    <div
                      className="rounded-xl p-6 sm:p-8 text-white flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--brand-dark)' }}
                    >
                      <div className="flex items-start justify-between gap-4 pb-5 mb-5 border-b border-white/15">
                        <div>
                          <h3
                            className="font-display text-2xl font-extrabold"
                            style={{ color: 'var(--brand-gold)' }}
                          >
                            {section.coursesTitle || 'قسم الكورسات'}
                          </h3>
                          {section.coursesSubtitle && (
                            <p className="text-xs sm:text-sm text-white/80 mt-1">
                              {section.coursesSubtitle}
                            </p>
                          )}
                        </div>
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: 'var(--brand-gold)',
                            color: 'var(--brand-dark)',
                          }}
                        >
                          <GraduationCap className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {courses.map((item, cIdx) => (
                          <div
                            key={item.id}
                            className="bg-white/8 border border-white/12 rounded-lg p-4 flex items-start gap-3"
                          >
                            <span
                              className="font-display text-sm font-extrabold tabular-nums mt-0.5"
                              style={{ color: 'var(--brand-gold)' }}
                            >
                              {String(cIdx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <div className="font-display text-base font-bold text-white">
                                {item.title}
                              </div>
                              <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showDev && (
                    <div
                      className="rounded-xl p-6 sm:p-8 border border-black/10 flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--brand-tint)' }}
                    >
                      <div className="flex items-start justify-between gap-4 pb-5 mb-5 border-b border-black/10">
                        <div>
                          <h3
                            className="font-display text-2xl font-extrabold"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            {section.devTitle || 'قسم التطوير'}
                          </h3>
                          {section.devSubtitle && (
                            <p className="text-xs sm:text-sm text-black/70 mt-1">
                              {section.devSubtitle}
                            </p>
                          )}
                        </div>
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: 'var(--brand-dark)',
                            color: 'var(--brand-gold)',
                          }}
                        >
                          <TrendingUp className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {devs.map((item, dIdx) => {
                          const devIcons = [
                            <ClipboardList key="1" className="w-4 h-4" />,
                            <Users key="2" className="w-4 h-4" />,
                            <BarChart3 key="3" className="w-4 h-4" />,
                            <Award key="4" className="w-4 h-4" />,
                          ];
                          return (
                            <div
                              key={item.id}
                              className="bg-white border border-black/10 rounded-lg p-4 flex items-start gap-3"
                            >
                              <div
                                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: 'var(--brand-tint)',
                                  color: 'var(--brand-accent)',
                                }}
                              >
                                {devIcons[dIdx % devIcons.length]}
                              </div>
                              <div>
                                <div
                                  className="font-display text-base font-bold"
                                  style={{ color: 'var(--brand-dark)' }}
                                >
                                  {item.title}
                                </div>
                                <p className="text-xs sm:text-sm text-black/70 mt-1 leading-relaxed">
                                  {item.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // 6. MARKETING SERVICES GRID
        if (section.type === 'marketing_grid') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {section.items.map((item, mIdx) => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-6 border flex flex-col justify-between ${
                        isDark
                          ? 'bg-white/8 border-white/15 text-white'
                          : 'bg-white border-black/10 text-[#1A2726]'
                      }`}
                    >
                      <div>
                        {item.imageUrl ? (
                          <div className="rounded-lg overflow-hidden mb-4 border border-black/10">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center"
                              style={
                                isDark
                                  ? {
                                      backgroundColor: 'var(--brand-gold)',
                                      color: 'var(--brand-dark)',
                                    }
                                  : {
                                      backgroundColor: 'var(--brand-tint)',
                                      color: 'var(--brand-accent)',
                                    }
                              }
                            >
                              {ICONS_MAP[item.iconKey || 'share'] || (
                                <Share2 className="w-5 h-5" />
                              )}
                            </div>
                            <span
                              className="font-display text-sm font-bold tabular-nums"
                              style={{
                                color: isDark ? 'var(--brand-gold)' : 'var(--brand-accent)',
                              }}
                            >
                              {String(mIdx + 1).padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        <h3
                          className="font-display text-xl font-bold mb-2"
                          style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-sm leading-relaxed ${
                            isDark ? 'text-white/80' : 'text-black/70'
                          }`}
                        >
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 7. HOW WE WORK (STEPS)
        if (section.type === 'steps') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {section.items.map((step, sIdx) => (
                    <div
                      key={step.id}
                      className={`rounded-xl p-6 border flex flex-col justify-between ${
                        isDark
                          ? 'bg-white/8 border-white/15 text-white'
                          : 'bg-white border-black/10 text-[#1A2726]'
                      }`}
                    >
                      <div>
                        <div
                          className="w-14 h-14 rounded-xl font-display text-2xl font-extrabold flex items-center justify-center mb-5 tabular-nums"
                          style={{
                            backgroundColor: 'var(--brand-gold)',
                            color: 'var(--brand-dark)',
                          }}
                        >
                          {String(sIdx + 1).padStart(2, '0')}
                        </div>
                        <h3
                          className="font-display text-xl font-bold mb-3"
                          style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm sm:text-base leading-relaxed ${
                            isDark ? 'text-white/80' : 'text-black/75'
                          }`}
                        >
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 8. TEAM DEPARTMENTS
        if (section.type === 'team') {
          const [execDept, ...otherDepts] = section.items;
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="space-y-5">
                  {execDept && (
                    <div
                      className="rounded-xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6"
                      style={{ backgroundColor: 'var(--brand-dark)' }}
                    >
                      <div className="space-y-2 max-w-2xl">
                        {execDept.subtitle && (
                          <div
                            className="text-xs sm:text-sm font-semibold"
                            style={{ color: 'var(--brand-gold)' }}
                          >
                            01 · {execDept.subtitle}
                          </div>
                        )}
                        <h3 className="font-display text-2xl font-extrabold text-white">
                          {execDept.title}
                        </h3>
                        <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                          {execDept.text}
                        </p>
                      </div>
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--brand-gold)',
                          color: 'var(--brand-dark)',
                        }}
                      >
                        <Briefcase className="w-7 h-7" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {otherDepts.map((dept, dIdx) => (
                      <div
                        key={dept.id}
                        className="rounded-xl p-6 border border-black/10 flex flex-col justify-between"
                        style={{ backgroundColor: 'var(--brand-tint)' }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="font-display text-sm font-bold tabular-nums"
                              style={{ color: 'var(--brand-accent)' }}
                            >
                              {String(dIdx + 2).padStart(2, '0')}
                            </span>
                            {dept.subtitle && (
                              <span
                                className="text-xs font-semibold"
                                style={{ color: 'var(--brand-accent)' }}
                              >
                                {dept.subtitle}
                              </span>
                            )}
                          </div>
                          <h3
                            className="font-display text-xl font-extrabold mb-2"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            {dept.title}
                          </h3>
                          <p className="text-sm text-black/75 leading-relaxed">{dept.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 9. WHY REHAB (FEATURES)
        if (section.type === 'features') {
          const featureIcons = [
            <Users key="1" className="w-5 h-5" />,
            <FileCheck2 key="2" className="w-5 h-5" />,
            <BarChart3 key="3" className="w-5 h-5" />,
            <Lock key="4" className="w-5 h-5" />,
          ];
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div
                    className="lg:col-span-4 rounded-xl p-7 text-white flex flex-col justify-between"
                    style={{ backgroundColor: 'var(--brand-dark)' }}
                  >
                    <div className="space-y-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--brand-gold)',
                          color: 'var(--brand-dark)',
                        }}
                      >
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-2xl font-extrabold leading-snug text-balance">
                        شراكة مبنية على الموثوقية والنتائج
                      </h3>
                      <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                        نختصر على عملائنا عناء التنسيق بين أطراف متعددة عبر منظومة موحدة تضمن جودة المخرج ووضوح المسؤولية.
                      </p>
                    </div>
                    <div
                      className="pt-5 mt-6 border-t border-white/15 text-sm font-bold"
                      style={{ color: 'var(--brand-gold)' }}
                    >
                      «{site.brand.slogan}»
                    </div>
                  </div>

                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.items.map((item, fIdx) => (
                      <div
                        key={item.id}
                        className="bg-white text-[#1A2726] border border-black/10 rounded-xl p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: 'var(--brand-dark)',
                                color: 'var(--brand-gold)',
                              }}
                            >
                              {featureIcons[fIdx % featureIcons.length]}
                            </div>
                            <span
                              className="font-display text-sm font-bold tabular-nums"
                              style={{ color: 'var(--brand-accent)' }}
                            >
                              {String(fIdx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <h3
                            className="font-display text-lg sm:text-xl font-extrabold mb-2"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            {item.title}
                          </h3>
                          <p className="text-sm text-black/75 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // CUSTOM: GALLERY
        if (section.type === 'gallery') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl overflow-hidden border flex flex-col ${
                        isDark
                          ? 'bg-white/8 border-white/15 text-white'
                          : 'bg-white border-black/10 text-[#1A2726]'
                      }`}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-56 flex flex-col items-center justify-center gap-2"
                          style={{ backgroundColor: 'var(--brand-tint)' }}
                        >
                          <ImageIcon
                            className="w-8 h-8"
                            style={{ color: 'var(--brand-accent)' }}
                          />
                          <span className="text-xs font-medium text-black/60">
                            ارفع صورة من لوحة التعديل
                          </span>
                        </div>
                      )}
                      <div className="p-5">
                        <h3
                          className="font-display text-lg font-bold mb-1.5"
                          style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                        >
                          {item.title}
                        </h3>
                        {item.text && (
                          <p
                            className={`text-sm leading-relaxed ${
                              isDark ? 'text-white/80' : 'text-black/70'
                            }`}
                          >
                            {item.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // CUSTOM: TEXT + IMAGE
        if (section.type === 'text_image') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <p
                      className={`text-base sm:text-lg leading-[1.9] whitespace-pre-line ${
                        isDark ? 'text-white/90' : 'text-black/80'
                      }`}
                    >
                      {section.text}
                    </p>
                  </div>
                  <div className="lg:col-span-5">
                    {section.imageUrl ? (
                      <div className="rounded-xl overflow-hidden border border-black/10">
                        <img
                          src={section.imageUrl}
                          alt={section.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-72 object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-full h-64 rounded-xl border border-dashed border-black/20 flex flex-col items-center justify-center gap-2"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6FAF9' }}
                      >
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-xs opacity-70">صورة القسم اختيارية من لوحة التعديل</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // CUSTOM: CLIENTS
        if (section.type === 'clients') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.items.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white text-[#1A2726] border border-black/10 rounded-xl h-28 p-4 flex items-center justify-center text-center"
                    >
                      {client.imageUrl ? (
                        <img
                          src={client.imageUrl}
                          alt={client.title}
                          referrerPolicy="no-referrer"
                          className="max-h-16 max-w-full object-contain"
                        />
                      ) : (
                        <span
                          className="font-display font-bold text-base"
                          style={{ color: 'var(--brand-dark)' }}
                        >
                          {client.title}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // CUSTOM: STATS
        if (section.type === 'stats') {
          return (
            <section
              key={section.id}
              id={section.id}
              onClick={handleSectionClick}
              style={getSectionBgStyle(section.theme)}
              className={sectionWrapClass}
            >
              <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {renderSectionHeader(section, idx)}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {section.items.map((st) => (
                    <div
                      key={st.id}
                      className={`rounded-xl p-8 text-center border ${
                        isDark
                          ? 'bg-white/8 border-white/15'
                          : 'bg-white border-black/10'
                      }`}
                    >
                      <div
                        className="font-display text-4xl sm:text-5xl font-extrabold tabular-nums mb-2"
                        style={{ color: isDark ? 'var(--brand-gold)' : 'var(--brand-dark)' }}
                      >
                        {st.value}
                      </div>
                      <div
                        className={`text-base font-medium ${
                          isDark ? 'text-white/85' : 'text-black/75'
                        }`}
                      >
                        {st.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 10. CONTACT SECTION
        return (
          <section
            key={section.id}
            id={section.id}
            onClick={handleSectionClick}
            style={getSectionBgStyle(section.theme)}
            className={sectionWrapClass}
          >
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
              {renderSectionHeader(section, idx)}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <h3
                      className="font-display text-2xl font-extrabold"
                      style={{ color: isDark ? '#FFFFFF' : 'var(--brand-dark)' }}
                    >
                      {section.slogan || 'شراكة مهنية تبدأ بخطوة واضحة'}
                    </h3>
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isDark ? 'text-white/85' : 'text-black/75'
                      }`}
                    >
                      {section.text}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.items.map((ch) => {
                      const val = ch.value || ch.text || '';
                      const isCopied = copiedId === ch.id;
                      return (
                        <div
                          key={ch.id}
                          className="bg-white text-[#1A2726] rounded-xl p-5 border border-black/10 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--brand-dark)',
                                  color: 'var(--brand-gold)',
                                }}
                              >
                                {ICONS_MAP[ch.iconKey || 'phone'] || (
                                  <Phone className="w-4 h-4" />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(ch.id, val);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                                style={{ color: 'var(--brand-accent)' }}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>تم النسخ</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div
                              className="text-xs font-bold mb-1"
                              style={{ color: 'var(--brand-accent)' }}
                            >
                              {ch.label || ch.title}
                            </div>
                            <div
                              className="font-display text-sm sm:text-base font-extrabold break-words"
                              style={{ color: 'var(--brand-dark)' }}
                              dir={ch.iconKey === 'phone' ? 'ltr' : 'rtl'}
                            >
                              {val}
                            </div>
                          </div>
                          {ch.subtitle && (
                            <div className="text-[11px] text-black/60 mt-2.5 pt-2.5 border-t border-black/10">
                              {ch.subtitle}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real Validated Contact Form */}
                <div className="lg:col-span-6 bg-white text-[#1A2726] rounded-xl p-6 sm:p-8 border border-black/10">
                  <h3
                    className="font-display text-xl font-extrabold mb-1"
                    style={{ color: 'var(--brand-dark)' }}
                  >
                    اطلب استشارة أو عرض سعر
                  </h3>
                  <p className="text-xs sm:text-sm text-black/65 mb-5">
                    أرسل بياناتك وسيتواصل معك فريق رحاب المختص في أقرب وقت.
                  </p>

                  {formStatus === 'success' ? (
                    <div
                      className="rounded-xl p-6 text-center space-y-3 border border-black/10"
                      style={{ backgroundColor: 'var(--brand-tint)' }}
                    >
                      <CheckCircle2
                        className="w-10 h-10 mx-auto"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      <div
                        className="font-display text-lg font-extrabold"
                        style={{ color: 'var(--brand-dark)' }}
                      >
                        تم استلام طلبك بنجاح
                      </div>
                      <p className="text-sm text-black/75">
                        شكراً لتواصلك مع شركة رحاب. سيقوم فريقنا بمراجعة رسالتك والرد عليك قريباً.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormStatus('idle');
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-dark)' }}
                      >
                        إرسال طلب آخر
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleInquirySubmit}
                      onClick={(e) => e.stopPropagation()}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-[#1A2726]">
                            الاسم الكامل *
                          </label>
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="أدخل اسمك أو اسم الشركة"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-[#0F6E56]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-[#1A2726]">
                            رقم الهاتف *
                          </label>
                          <input
                            type="tel"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            placeholder="05xxxxxxxx"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-[#0F6E56]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-[#1A2726]">
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-[#0F6E56]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-[#1A2726]">
                            المجال المطلوب
                          </label>
                          <select
                            value={formService}
                            onChange={(e) => setFormService(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-black/20 text-sm bg-white focus:outline-none focus:border-[#0F6E56]"
                          >
                            <option value="التسويق المتكامل">التسويق المتكامل</option>
                            <option value="التدريب والكورسات والتطوير">
                              التدريب والكورسات والتطوير
                            </option>
                            <option value="الاستشارات الإدارية والتسويقية">
                              الاستشارات الإدارية والتسويقية
                            </option>
                            <option value="باقة شاملة للشركات">باقة شاملة للشركات</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#1A2726]">
                          تفاصيل الاحتياج *
                        </label>
                        <textarea
                          rows={3}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="اكتب نبذة مختصرة عن مشروعك أو البرنامج التدريبي المطلوب..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-[#0F6E56]"
                        />
                      </div>

                      {formStatus === 'error' && formError && (
                        <p className="text-xs font-semibold text-red-700">{formError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-display font-bold text-sm sm:text-base transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--brand-dark)',
                          color: '#FFFFFF',
                        }}
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {formStatus === 'submitting' ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
};
