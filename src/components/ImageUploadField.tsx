import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  authToken: string;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value = '',
  onChange,
  authToken,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 8 ميجابايت.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          dataBase64,
        }),
      });

      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) {
        setError(json.error || 'فشل رفع الصورة.');
      } else {
        onChange(json.url);
      }
    } catch {
      setError('حدث خطأ أثناء رفع الصورة.');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#0B3D38]">{label}</label>
      {helperText && <p className="text-[11px] text-[#556B67]">{helperText}</p>}

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-[#0B3D38]/15 bg-[#F6FAF9]">
          <img
            src={value}
            alt={label}
            referrerPolicy="no-referrer"
            className="w-full h-32 object-cover"
          />
          <div className="p-2 flex items-center justify-between gap-2 bg-white border-t border-[#0B3D38]/10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6E56] hover:text-[#0B3D38] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'جارٍ الرفع...' : 'تغيير الصورة'}</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full py-5 px-4 rounded-lg border border-dashed border-[#0B3D38]/30 bg-[#F6FAF9] hover:bg-[#EEF5F3] transition-colors flex flex-col items-center justify-center gap-1.5 text-[#0B3D38] cursor-pointer"
        >
          <ImageIcon className="w-5 h-5 text-[#0F6E56]" />
          <span className="text-xs font-bold">
            {uploading ? 'جارٍ رفع الصورة...' : 'اضغط لرفع صورة من جهازك'}
          </span>
          <span className="text-[11px] text-[#556B67]">PNG, JPG, WebP, SVG</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
};
