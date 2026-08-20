"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Check, User as UserIcon, Building, Camera, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import UserAvatar from "@/components/ui/UserAvatar";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || user?.fullName || "");
  const [company, setCompany] = useState(user?.company || user?.companyName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || user.fullName || "");
      setCompany(user.company || user.companyName || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim() || user?.name || "User",
      fullName: name.trim() || user?.name || "User",
      company: company.trim(),
      companyName: company.trim(),
      avatarUrl: avatarUrl.trim(),
      isOnboarded: true,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg card p-6 bg-surface shadow-2xl relative border border-border rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Account Profile Setup</h2>
            <p className="text-xs text-ink-muted">Personalize your identity and avatar across FollowLoop.ai</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-ink-soft">Profile Picture / Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <UserAvatar src={avatarUrl} name={name || user?.name || user?.email} size="xl" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  title="Upload Image"
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline text-xs py-2 px-3 flex items-center gap-2"
                  >
                    <Upload size={14} /> Upload Custom Photo
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="btn-outline text-xs py-2 px-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                      title="Remove custom photo and use initials avatar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-[11px] text-ink-muted">JPG, PNG, or GIF up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1 flex items-center gap-1.5">
                <UserIcon size={14} className="text-ink-muted" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1 flex items-center gap-1.5">
                <Building size={14} className="text-ink-muted" /> Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Innovations"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
