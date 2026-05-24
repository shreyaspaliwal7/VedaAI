"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Check, Loader2, Save, User, Building, MapPin } from "lucide-react";
import MobileHeader from "@/components/layout/MobileHeader";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Profile settings state
  const [name, setName] = useState("John Doe");
  const [school, setSchool] = useState("Delhi Public School");
  const [branch, setBranch] = useState("Bokaro Steel City");
  const [avatar, setAvatar] = useState<string | null>(null); // Null will fall back to 'J' initial
  
  // UI States
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p className="text-sm">Loading settings…</p>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    
    // Simulate premium backend save timeline
    setTimeout(() => {
      setSaving(false);
      setShowToast(true);
      
      // Auto-hide success toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 8000); // 800ms simulation
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-full bg-gray-50 pb-20">
        <MobileHeader title="Settings" />

        <div className="px-4 py-4 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Profile Avatar Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center gap-3">
              <div 
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center cursor-pointer group overflow-hidden"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E8521A] text-3xl font-bold select-none">{name.charAt(0)}</span>
                )}
                {/* Camera Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="text-xs font-semibold text-[#E8521A] hover:underline"
              >
                Change Profile Picture
              </button>
            </div>

            {/* Account Details Box */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  School / Institution
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="School name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Campus / Branch
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Campus branch"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-gray-800 text-white font-semibold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-75"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block animate-fade-in pb-10">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">
            Manage your personal profile, credentials, and school association.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Header info */}
            <div>
              <h2 className="font-semibold text-gray-800 text-base mb-0.5">Teacher Profile</h2>
              <p className="text-xs text-gray-400">Edit your public information and avatar</p>
            </div>

            {/* Avatar Row */}
            <div className="flex items-center gap-5">
              <div 
                onClick={handleAvatarClick}
                className="relative w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center cursor-pointer group overflow-hidden shrink-0"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E8521A] text-2xl font-bold select-none">{name.charAt(0)}</span>
                )}
                {/* Camera Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Change Photo
                </button>
                <p className="text-[10px] text-gray-400 mt-1.5">PNG or JPG. Max file size 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Inputs Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    School / Institution
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="School name"
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Campus / Branch
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Branch location"
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E8521A] transition-colors bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-gray-800 text-white font-semibold rounded-full text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-75"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Saving Changes…
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-[#1A1A1A] text-white px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl z-[9999] animate-fade-in border border-neutral-800">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check size={12} className="text-white font-extrabold" />
          </div>
          <span className="text-xs font-medium">Settings updated successfully!</span>
        </div>
      )}
    </>
  );
}
