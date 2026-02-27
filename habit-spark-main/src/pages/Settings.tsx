import { useState } from 'react';
import { User, Save, Check } from 'lucide-react';

const PROFILE_KEY = 'habitflow_profile';

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: '', age: '' };
  } catch {
    return { name: '', age: '' };
  }
}

function writeProfile(data: { name: string; age: string }) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

export default function Settings() {
  const [profile, setProfile] = useState(readProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    writeProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-display mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg">Your Profile</h2>
            <p className="text-xs text-muted-foreground">Stored locally on this device</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-mono mb-1 block uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ansuman"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-mono mb-1 block uppercase tracking-wider">Age</label>
            <input
              type="number"
              min={1}
              max={120}
              value={profile.age}
              onChange={e => setProfile(p => ({ ...p, age: e.target.value }))}
              placeholder="e.g. 22"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display text-base mb-3">About HabitFlow</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span className="font-mono text-xs">Storage</span>
            <span className="font-mono text-xs text-primary">100% Local — No Cloud</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs">Version</span>
            <span className="font-mono text-xs">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
