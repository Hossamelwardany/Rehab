import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (token: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !json.ok || !json.token) {
        setError(json.error || 'كلمة المرور غير صحيحة.');
        setPassword('');
      } else {
        setPassword('');
        onAuthenticated(json.token);
      }
    } catch {
      setError('تعذر التحقق من كلمة المرور. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#062623]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="تسجيل الدخول لصفحة التعديل"
      onClick={onClose}
    >
      <div
        className="bg-white text-[#1A2726] rounded-2xl w-full max-w-md p-6 sm:p-7 border border-black/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B3D38] text-[#E5A93B] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-[#0B3D38]">
                دخول صفحة التعديل
              </h2>
              <p className="text-xs text-[#445956] mt-0.5">
                أدخل كلمة المرور لفتح لوحة تعديل المحتوى والألوان والصور
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center text-[#0B3D38] hover:bg-black/5 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editor-password" className="block text-xs font-bold text-[#0B3D38] mb-1.5">
              كلمة المرور
            </label>
            <input
              id="editor-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة مرور صفحة التعديل"
              className="w-full px-4 py-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-[#0F6E56]"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0B3D38] text-white font-display font-bold text-sm hover:bg-[#0F6E56] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'جارٍ التحقق...' : 'فتح صفحة التعديل'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-black/15 text-sm font-semibold text-[#1A2726] hover:bg-black/5 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
