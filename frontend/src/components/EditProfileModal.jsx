import { useState, useRef } from 'react';
import { updateProfileData } from '../services/api';

export default function EditProfileModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setAvatarFile(file);
    setError('');

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updated = await updateProfileData(formData);
      onSave(updated);
    } catch (err) {
      console.error('Profile update failed:', err);
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="brutalist-card p-6 md:p-8 w-full max-w-md mx-4"
        style={{
          background: 'var(--color-surface)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="heading-md mb-6">EDIT PROFILE</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 border-4 border-ink overflow-hidden cursor-pointer"
              style={{ boxShadow: 'var(--shadow-brutal-sm)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-canvas)', fontSize: '2rem' }}
                >
                  📷
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="label-mono text-xs cursor-pointer bg-canvas border-2 border-ink px-3 py-1 hover:bg-border-light transition-colors"
            >
              CHOOSE IMAGE
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="label-mono text-xs block mb-1">DISPLAY NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              className="w-full px-4 py-3 border-4 border-ink bg-canvas text-ink font-bold"
              style={{
                boxShadow: 'var(--shadow-brutal-sm)',
                outline: 'none',
                fontSize: '16px',
                textTransform: 'none',
              }}
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="label-mono text-xs block mb-1">
              BIO <span className="text-muted">({160 - bio.length} remaining)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-3 border-4 border-ink bg-canvas text-ink resize-none"
              style={{
                boxShadow: 'var(--shadow-brutal-sm)',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                textTransform: 'none',
              }}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="brutalist-badge w-full justify-center py-2"
              style={{
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                borderColor: '#991B1B',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="brutalist-btn brutalist-btn-primary flex-1"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'SAVING...' : '💾 SAVE'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="brutalist-btn flex-1"
              style={{
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',
              }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
