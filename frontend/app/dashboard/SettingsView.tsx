'use client';

import { useState } from 'react';
import { updateUser, changePassword, uploadAvatar } from '@/services/api';

export default function SettingsView({ user, setUser, setErrorMessage }: any) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setIsUpdatingProfile(true);
    setErrorMessage('');
    try {
        const updated = await updateUser({ full_name: fullName, email }, token);
        setUser(updated);
        showSuccess("Profile updated successfully!");
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to update profile.");
    } finally {
        setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!oldPassword || !newPassword) {
        setErrorMessage("Please fill in both password fields.");
        return;
    }

    const passwordRequirements = [
        { regex: /.{8,}/ },
        { regex: /[A-Z]/ },
        { regex: /[a-z]/ },
        { regex: /[0-9]/ },
        { regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ];

    if (!passwordRequirements.every(req => req.regex.test(newPassword))) {
        setErrorMessage("New password does not meet the security requirements.");
        return;
    }

    setIsChangingPassword(true);
    setErrorMessage('');
    try {
        await changePassword({ old_password: oldPassword, new_password: newPassword }, token);
        setOldPassword('');
        setNewPassword('');
        showSuccess("Password changed successfully!");
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to change password.");
    } finally {
        setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setIsUploadingAvatar(true);
    setErrorMessage('');
    try {
        const result = await uploadAvatar(file, token);
        setUser({ ...user, profile_image: result.profile_image });
        showSuccess("Avatar uploaded successfully!");
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to upload image.");
    } finally {
        setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tighter mb-2">Settings</h1>
        <p className="text-zinc-500 font-medium">Manage your account and preferences.</p>
      </header>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-2xl text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Avatar */}
        <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Profile Picture</h3>
            <div className="relative group w-40 h-40 mx-auto md:mx-0">
                <div className="w-full h-full rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {user?.profile_image ? (
                        <img src={`http://localhost:8000${user.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-300">
                            {user?.full_name?.charAt(0)}
                        </div>
                    )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </label>
                {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 rounded-full">
                        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-50 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-center md:text-left text-zinc-400 font-bold uppercase tracking-widest">JPG, PNG or GIF. Max 2MB.</p>
        </section>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-12">
            {/* Account Info */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none font-bold transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none font-bold transition-all" 
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isUpdatingProfile ? "Updating..." : "Save Changes"}
                </button>
            </form>

            {/* Security */}
            <form onSubmit={handleChangePassword} className="space-y-6 border-t border-zinc-100 dark:border-zinc-800 pt-12">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Security</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Current Password</label>
                        <input 
                            type="password" 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none font-bold transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none font-bold transition-all" 
                        />
                        {/* Password Strength Checklist */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
                            {[
                                { label: '8+ Characters', regex: /.{8,}/ },
                                { label: 'Uppercase', regex: /[A-Z]/ },
                                { label: 'Lowercase', regex: /[a-z]/ },
                                { label: 'Number', regex: /[0-9]/ },
                                { label: 'Special Character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
                            ].map((req, i) => {
                                const isMet = req.regex.test(newPassword);
                                return (
                                    <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isMet ? 'text-green-500' : 'text-zinc-400'}`}>
                                        <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${isMet ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                            {isMet && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        {req.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="border-2 border-zinc-900 dark:border-zinc-50 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-50 dark:hover:text-zinc-900 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isChangingPassword ? "Updating..." : "Change Password"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
