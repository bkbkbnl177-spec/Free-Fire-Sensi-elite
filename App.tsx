
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSensitivityForDevice } from './services/geminiService';
import { SensitivitySettings, HistoryItem } from './types';
import { 
  Settings, 
  Smartphone, 
  Target, 
  Zap, 
  ShieldAlert, 
  History, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  MousePointer2, 
  Flame, 
  Info, 
  Users, 
  Star,
  Volume2,
  VolumeX,
  Crosshair,
  Lock,
  Share2
} from 'lucide-react';

const App: React.FC = () => {
  const [deviceInput, setDeviceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SensitivitySettings | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rush' | 'push'>('rush');
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState<number | null>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  // Audio References for Shotgun Sounds
  const fireSoundRef = useRef<HTMLAudioElement | null>(null);
  const pumpSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Shotgun Fire Sound (Reliable Source)
    fireSoundRef.current = new Audio('https://www.soundjay.com/mechanical/gun-shot-01.mp3');
    if (fireSoundRef.current) fireSoundRef.current.volume = 0.8;
    
    // Shotgun Pump Sound
    pumpSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1697/1697-preview.mp3');
    if (pumpSoundRef.current) pumpSoundRef.current.volume = 0.5;

    const savedHistory = localStorage.getItem('ff_sensi_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedMute = localStorage.getItem('ff_sensi_mute');
    if (savedMute) setIsMuted(JSON.parse(savedMute));
  }, []);

  const playFireSound = useCallback(() => {
    if (isMuted || !fireSoundRef.current) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    
    fireSoundRef.current.currentTime = 0;
    fireSoundRef.current.play().catch(e => console.log("Sound error:", e));
  }, [isMuted]);

  const playPumpSound = useCallback(() => {
    if (isMuted || !pumpSoundRef.current) return;
    pumpSoundRef.current.currentTime = 0;
    pumpSoundRef.current.play().catch(e => console.log("Pump sound error:", e));
  }, [isMuted]);

  const activateEngine = () => {
    if (fireSoundRef.current && pumpSoundRef.current) {
      fireSoundRef.current.play().then(() => {
        fireSoundRef.current?.pause();
        if (fireSoundRef.current) fireSoundRef.current.currentTime = 0;
      }).catch(() => {});
      pumpSoundRef.current.play().then(() => {
        pumpSoundRef.current?.pause();
        if (pumpSoundRef.current) pumpSoundRef.current.currentTime = 0;
      }).catch(() => {});
    }
    setIsActivated(true);
    setTimeout(playPumpSound, 200);
  };

  const shareWebsite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'FF Sensi AI',
        text: 'আপনার মোবাইলের জন্য সেরা হেডশট সেন্সি নিন!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('লিঙ্ক কপি করা হয়েছে! বন্ধুদের শেয়ার করুন।');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceInput.trim()) return;
    
    playFireSound();
    setLoading(true);
    setError(null);
    setSettings(null);

    try {
      const data = await getSensitivityForDevice(deviceInput);
      setSettings(data);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        deviceName: data.deviceName,
        timestamp: Date.now(),
        settings: data
      };
      
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('ff_sensi_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      setError(err.message || "সার্ভার এরর! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    playPumpSound();
    setHistory([]);
    localStorage.removeItem('ff_sensi_history');
  };

  const loadFromHistory = (item: HistoryItem) => {
    playPumpSound();
    setSettings(item.settings);
    setDeviceInput(item.deviceName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const weaponSynergies = [
    {
      id: 'shotgun',
      category: 'Shotgun',
      icon: '💥',
      dragTip: 'Rotation Drag: ফায়ার বাটনটি U শেপে ঘুরিয়ে ড্র্যাগ করুন।',
      characters: [
        { name: 'Caroline', desc: 'শটগান হাতে মুভমেন্ট স্পিড ১৩% বাড়িয়ে দেয়।' },
        { name: 'Hayato', desc: 'HP কমলে এনিমির হেলমেট দ্রুত ফাটিয়ে দিবে।' },
        { name: 'Jota', desc: 'এনিমি নক করলেই ২০% HP তৎক্ষণাৎ বেড়ে যায়।' }
      ],
      theme: 'from-red-600/30 to-red-900/30',
      borderColor: 'border-red-500'
    },
    {
      id: 'smg',
      category: 'SMG',
      icon: '🔫',
      dragTip: 'Straight Drag: ফায়ার বাটনটি সোজা উপরের দিকে দ্রুত টানুন।',
      characters: [
        { name: 'Luna', desc: 'UMP-র ফায়ারিং স্পিড ৮% বাড়ায়, দ্রুত হেডশট লাগে।' },
        { name: 'Nikita', desc: 'রিলোড স্পিড বাড়ায় এবং শেষ গুলিতে বেশি ড্যামেজ দেয়।' },
        { name: 'Dasha', desc: 'গুলির কাঁপুনি কমায়, ফলে লক্ষ্য স্থির থাকে।' }
      ],
      theme: 'from-orange-600/30 to-orange-900/30',
      borderColor: 'border-orange-500'
    },
    {
      id: 'deagle',
      category: 'D-Eagle',
      icon: '🎯',
      dragTip: 'One Tap: খুব হালকা করে উপরে ড্র্যাগ করুন এবং সাথে সাথে জয়স্টিক ছেড়ে দিন।',
      characters: [
        { name: 'Maro', desc: 'দূরত্ব বাড়লে ড্যামেজ ২৫% পর্যন্ত বেড়ে যায়।' },
        { name: 'Rafael', desc: 'সাইলেন্সার ইফেক্ট দেয় এবং নক এনিমি দ্রুত ফিনিশ হয়।' },
        { name: 'Moco', desc: 'শট লাগলে এনিমির গায়ে ট্যাগ পড়ে যায়।'}
      ],
      theme: 'from-cyan-600/30 to-blue-900/30',
      borderColor: 'border-cyan-500'
    },
    {
      id: 'marksman',
      category: 'Marksman',
      icon: '🦅',
      dragTip: 'Distance Tap: হালকা ট্যাপ করে ড্র্যাগ করুন। রিলোড নিতে ভুলবেন না।',
      characters: [
        { name: 'Maro', desc: 'দূরপাল্লার লড়াইয়ে ড্যামেজ বহুগুণ বাড়িয়ে দেয়।' },
        { name: 'Rafael', desc: 'স্নাইপার ও মার্কসম্যান গানে সাইলেন্সার এর কাজ করে।' },
        { name: 'Dasha', desc: 'গানের রিকোয়েল বা কাঁপুনি কমিয়ে দেয়।' }
      ],
      theme: 'from-amber-600/30 to-amber-900/30',
      borderColor: 'border-amber-500'
    }
  ];

  const rushCombo = [
    { name: 'Tatsuya', icon: '⚡', desc: 'খুব দ্রুত সামনে ড্যাশ মারতে পারে।' },
    { name: 'Kelly', icon: '🏃‍♀️', desc: 'আপনার দৌড়ানোর গতি বাড়াবে।' },
    { name: 'Hayato', icon: '🏮', desc: 'HP কমে গেলে গানের ড্যামেজ বাড়বে।' },
    { name: 'Jota', icon: '💪', desc: 'গুলি করলে HP রিকভার হয়।' }
  ];

  const pushCombo = [
    { name: 'K (Captain)', icon: '🧘', desc: 'আনলিমিটেড EP এবং HP দেয়।' },
    { name: 'Leon', icon: '🛹', desc: 'ফাইট শেষে ফ্রিতে ৬০ HP দেবে।' },
    { name: 'Luqueta', icon: '⚽', desc: 'কিলে সর্বোচ্চ HP বাড়িয়ে দিবে।' },
    { name: 'Miguel', icon: '🎖️', desc: 'এনিমি নক করলেই ২০০ EP পাওয়া যাবে।' }
  ];

  const currentWeapon = selectedWeaponIdx !== null ? weaponSynergies[selectedWeaponIdx] : null;

  return (
    <div className="relative overflow-x-hidden">
      {/* Visual Muzzle Flash Overlay */}
      <div className={`muzzle-flash-overlay ${isFlashing ? 'muzzle-flash-active' : ''}`} />

      {/* Audio Unlock Overlay */}
      {!isActivated && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-8 text-center backdrop-blur-2xl">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-red-600/40 blur-[50px] rounded-full animate-pulse"></div>
            <div className="w-28 h-28 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 relative z-10">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white italic mb-6 uppercase tracking-tighter text-glow">সিস্টেম লক!</h2>
          <p className="text-gray-400 font-bold mb-10 max-w-xs leading-relaxed">
            শটগানের রিয়ালিস্টিক সাউন্ড এবং সেরা হেডশট সেটিংস পেতে নিচের বাটনে ক্লিক করুন।
          </p>
          <button 
            onClick={activateEngine}
            className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 rounded-2xl text-xl uppercase italic tracking-widest border-b-8 border-red-900 transform active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            ACTIVATE AI 🦾
          </button>
        </div>
      )}

      <div 
        className={`min-h-screen pb-12 transition-all duration-200 ${isFlashing ? 'brightness-125' : 'brightness-100'}`}
      >
        <header className="py-8 px-4 text-center relative overflow-hidden">
          <div className="flex justify-between items-center absolute top-6 left-6 right-6 z-30">
              <div className="flex items-center gap-3 bg-black/70 px-4 py-2 rounded-full border border-white/10 backdrop-blur-xl">
                  <div className={`w-2.5 h-2.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`}></div>
                  <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{isMuted ? 'MUTED' : 'SYSTEM ONLINE'}</span>
              </div>
              <div className="flex gap-3">
                <button 
                    onClick={shareWebsite}
                    className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-md"
                >
                    <Share2 className="w-5 h-5" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-md"
                >
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-green-500" />}
                </button>
              </div>
          </div>

          <div className="relative z-10 flex flex-col items-center mt-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-600/30 blur-[80px] rounded-full animate-pulse"></div>
              <img 
                src="https://i.postimg.cc/dtyZvw6Y/IMG-2533.jpg" 
                alt="Free Fire Logo" 
                className="w-48 md:w-64 rounded-3xl relative z-10 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tighter text-white uppercase italic text-glow flex items-center gap-3">
               SENSI <span className="text-red-600">AI</span> 🦾
            </h1>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <p className="text-[11px] md:text-xs font-black text-gray-300 tracking-[0.3em] uppercase italic">
                    The #1 Headshot Solution
                </p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 -mt-4 relative z-20">
          <div className="card-bg p-7 rounded-[40px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] mb-10 border-t-4 border-red-600 ring-1 ring-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Target className="w-32 h-32 text-white" />
            </div>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-5 relative z-10">
              <div className="relative flex-grow">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500 w-6 h-6" />
                <input 
                  type="text" 
                  value={deviceInput}
                  onChange={(e) => setDeviceInput(e.target.value)}
                  placeholder="আপনার মোবাইলের নাম দিন (যেমন: Xiaomi Note 10)"
                  className="w-full bg-black/60 border border-slate-800 text-white rounded-[24px] py-6 pl-14 pr-6 focus:border-red-600 focus:outline-none text-base font-bold shadow-inner transition-all focus:ring-4 focus:ring-red-600/10 placeholder:text-gray-600"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !deviceInput.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white font-black py-6 px-12 rounded-[24px] flex items-center justify-center gap-4 transition-all transform active:scale-90 text-base uppercase tracking-widest border-b-8 border-red-900 group shadow-2xl"
              >
                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Crosshair className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" />}
                {loading ? 'লোডিং...' : 'সার্চ দিন'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-600/50 text-red-200 p-6 rounded-[32px] mb-10 flex items-start gap-5 text-sm font-bold animate-shake backdrop-blur-md shadow-xl">
              <ShieldAlert className="w-7 h-7 flex-shrink-0 text-red-500" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <section className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-600/20 rounded-2xl shadow-inner">
                <Target className="text-red-600 w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black uppercase text-glow italic tracking-tighter">অস্ত্র সিলেক্ট করুন</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
              {weaponSynergies.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => {
                      setSelectedWeaponIdx(idx);
                      playPumpSound();
                  }}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[36px] border transition-all transform active:scale-95 group relative overflow-hidden ${
                    selectedWeaponIdx === idx 
                      ? `${w.borderColor} bg-slate-900 shadow-[0_0_40px_rgba(239,68,68,0.3)] scale-105 z-10` 
                      : 'border-white/5 bg-slate-950/60 opacity-60 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  <span className="text-6xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">{w.icon}</span>
                  <span className={`text-[11px] font-black uppercase tracking-widest text-center ${selectedWeaponIdx === idx ? 'text-white' : 'text-gray-500'}`}>
                    {w.category}
                  </span>
                  {selectedWeaponIdx === idx && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600"></div>
                  )}
                </button>
              ))}
            </div>

            {currentWeapon && (
              <div className={`card-bg p-8 md:p-12 rounded-[56px] border-l-8 ${currentWeapon.borderColor} bg-gradient-to-br ${currentWeapon.theme} shadow-2xl relative overflow-hidden group`}>
                  <div className="absolute -top-20 -right-20 p-20 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                      <span className="text-[18rem]">{currentWeapon.icon}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                      <div className="flex items-center gap-5">
                          <div className="bg-white/10 p-4 rounded-[28px] backdrop-blur-md shadow-xl">
                            <Star className="text-yellow-400 fill-yellow-400 w-8 h-8" />
                          </div>
                          <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                              {currentWeapon.category} প্রো গাইড
                          </h3>
                      </div>
                      <div className="bg-black/60 px-8 py-4 rounded-[24px] border border-white/10 flex items-center gap-4 backdrop-blur-2xl shadow-2xl">
                          <MousePointer2 className="w-6 h-6 text-cyan-400" />
                          <span className="text-[12px] font-black text-white uppercase italic tracking-[0.1em]">{currentWeapon.dragTip.split(':')[0]}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                      {currentWeapon.characters.map((char, cIdx) => (
                          <div key={cIdx} className="bg-black/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md hover:bg-black/60 transition-all hover:scale-[1.03] shadow-lg">
                              <span className="font-black text-yellow-500 text-xs italic block mb-3 uppercase tracking-wider border-b border-yellow-500/20 pb-2">{char.name}</span>
                              <p className="text-[12px] text-gray-300 leading-snug font-bold italic">{char.desc}</p>
                          </div>
                      ))}
                  </div>

                  <div className="bg-red-600/30 p-8 rounded-[36px] border border-red-500/20 text-base font-bold text-white flex gap-6 italic relative z-10 backdrop-blur-2xl group-hover:bg-red-600/40 transition-colors shadow-2xl">
                      <div className="w-16 h-16 bg-yellow-400 rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-[0_10px_20px_rgba(250,204,21,0.3)]">
                        <Info className="w-9 h-9 text-black" />
                      </div>
                      <span className="leading-relaxed flex items-center text-sm md:text-base">{currentWeapon.dragTip.split(':')[1]}</span>
                  </div>
              </div>
            )}
          </section>

          {settings && (
            <div className="mb-16 animate-in slide-in-from-bottom-20 fade-in duration-1000">
              <div className="bg-green-600/10 p-10 rounded-[56px] border border-green-500/30 mb-10 flex items-center gap-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                <div className="bg-green-600 p-6 rounded-[32px] shadow-[0_0_60px_rgba(34,197,94,0.6)] relative z-10">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">{settings.deviceName}</h2>
                  <p className="text-[12px] font-black text-green-400 uppercase tracking-[0.5em] flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
                    Verified Profile Active
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="card-bg p-10 md:p-14 rounded-[64px] border border-white/5 relative group overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
                  <h3 className="text-base font-black mb-12 flex items-center gap-5 uppercase italic text-glow">
                    <Settings className="text-red-600 w-7 h-7 animate-spin-slow" />
                    ইন-গেম সেটিংস
                  </h3>
                  <div className="space-y-9">
                    <SensiSlider label="General" value={settings.general} color="bg-red-600" />
                    <SensiSlider label="Red Dot" value={settings.redDot} color="bg-orange-600" />
                    <SensiSlider label="2X Scope" value={settings.scope2x} color="bg-yellow-600" />
                    <SensiSlider label="4X Scope" value={settings.scope4x} color="bg-green-600" />
                    <SensiSlider label="Sniper Scope" value={settings.sniperScope} color="bg-blue-600" />
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="card-bg p-12 rounded-[64px] border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap className="w-32 h-32 text-white" />
                    </div>
                    <h3 className="text-base font-black mb-12 flex items-center gap-5 uppercase italic tracking-wider">
                      <Zap className="text-yellow-400 w-7 h-7" />
                      অ্যাডভান্সড সেটআপ
                    </h3>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                      <div className="bg-black/60 p-8 rounded-[40px] border border-white/5 text-center hover:border-yellow-400/40 transition-all hover:scale-105 shadow-xl">
                        <p className="text-[11px] text-gray-500 mb-3 uppercase font-black tracking-widest">DPI Value</p>
                        <p className="text-5xl font-black text-yellow-400 italic drop-shadow-xl">{settings.dpi}</p>
                      </div>
                      <div className="bg-black/60 p-8 rounded-[40px] border border-white/5 text-center hover:border-red-600/40 transition-all hover:scale-105 shadow-xl">
                        <p className="text-[11px] text-gray-500 mb-3 uppercase font-black tracking-widest">Fire Size</p>
                        <p className="text-5xl font-black text-red-500 italic drop-shadow-xl">{settings.fireButtonSize}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-600 to-black p-12 rounded-[64px] border border-red-500/30 shadow-[0_40px_80px_-20px_rgba(220,38,38,0.3)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                      <Flame className="w-40 h-40 text-white" />
                    </div>
                    <h3 className="text-base font-black mb-8 text-white uppercase italic flex items-center gap-5">
                      <Flame className="w-7 h-7 text-yellow-400" /> সিক্রেট হেডশট টিপস
                    </h3>
                    <div className="space-y-6 relative z-10">
                      {settings.tips.map((tip, i) => (
                          <div key={i} className="flex gap-5 group/tip">
                              <div className="w-8 h-8 bg-yellow-400 text-black rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 group-hover/tip:rotate-12 transition-transform shadow-xl">
                                {i + 1}
                              </div>
                              <p className="text-[15px] text-white/95 font-bold italic leading-snug group-hover/tip:text-white transition-colors">{tip}</p>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="mb-20">
              <div className="flex items-center gap-5 mb-10">
                  <div className="p-3 bg-yellow-400/10 rounded-2xl shadow-inner">
                    <Users className="text-yellow-400 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic text-glow-sm tracking-tighter">ক্যারেক্টার কম্বিনেশন</h2>
              </div>
              
              <div className="flex bg-black/60 p-3 rounded-[32px] border border-white/5 mb-12 ring-2 ring-white/5 backdrop-blur-2xl shadow-2xl">
                  <button 
                      onClick={() => { setActiveTab('rush'); playPumpSound(); }}
                      className={`flex-1 py-5 rounded-[24px] text-sm font-black uppercase italic transition-all duration-700 ${activeTab === 'rush' ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.7)] scale-[1.03] z-10' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                      Full Rush Combo
                  </button>
                  <button 
                      onClick={() => { setActiveTab('push'); playPumpSound(); }}
                      className={`flex-1 py-5 rounded-[24px] text-sm font-black uppercase italic transition-all duration-700 ${activeTab === 'push' ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.7)] scale-[1.03] z-10' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                      Rank Push Combo
                  </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(activeTab === 'rush' ? rushCombo : pushCombo).map((char, index) => (
                      <div key={index} className="card-bg p-8 rounded-[48px] border border-white/5 flex gap-8 items-center hover:border-white/20 transition-all hover:-translate-y-3 group shadow-xl">
                          <div className="w-20 h-20 bg-slate-800 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl border border-white/5 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-900 group-hover:scale-110 transition-transform duration-500">
                              {char.icon}
                          </div>
                          <div>
                              <h4 className="font-black text-lg text-white uppercase italic leading-none mb-3 tracking-tighter group-hover:text-red-500 transition-colors">{char.name}</h4>
                              <p className="text-[12px] text-gray-400 italic leading-snug font-medium pr-4">{char.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {history.length > 0 && (
            <div className="mt-24 pt-14 border-t border-white/10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xs font-black flex items-center gap-4 text-gray-600 uppercase italic tracking-[0.4em]">
                  <History className="w-6 h-6" /> রিসেন্ট সার্চ হিস্ট্রি
                </h2>
                <button onClick={clearHistory} className="text-[11px] font-black text-red-600 flex items-center gap-3 uppercase hover:text-red-400 transition-all">
                  <Trash2 className="w-5 h-5" /> ক্লিয়ার করুন
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {history.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="card-bg p-6 rounded-[28px] border border-white/5 flex items-center justify-between hover:border-red-600/50 group transition-all hover:bg-white/5 shadow-2xl"
                  >
                    <span className="font-black text-[11px] text-gray-500 group-hover:text-white transition-colors uppercase italic truncate pr-3">{item.deviceName}</span>
                    <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-red-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-40 text-center pb-20 px-4 border-t border-white/5 pt-16">
          <div className="flex justify-center mb-10">
             <div className="w-16 h-1.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
          </div>
          <p className="font-black uppercase tracking-[1em] text-[10px] text-gray-700 mb-6 italic">World Class Shotgun Sensi AI</p>
          <div className="flex flex-col items-center">
            <h3 className="font-black uppercase tracking-widest text-3xl text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-4">
                © {new Date().getFullYear()} FF <span className="text-red-600">SENSI</span> ELITE
            </h3>
            <div className="flex gap-6 mt-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-red-600 hover:scale-110 transition-all cursor-pointer shadow-xl">
                    <Target className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-yellow-400 hover:scale-110 transition-all cursor-pointer shadow-xl">
                    <Zap className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-cyan-400 hover:scale-110 transition-all cursor-pointer shadow-xl">
                    <Crosshair className="w-6 h-6" />
                </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const SensiSlider: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const percentage = (value / 200) * 100;
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="font-black text-gray-400 text-xs uppercase italic tracking-widest group-hover:text-white transition-colors">{label}</span>
        <span className={`font-black px-5 py-2 rounded-2xl text-xs text-white ${color} shadow-2xl ring-2 ring-white/10 group-hover:scale-110 transition-transform`}>{value}</span>
      </div>
      <div className="w-full bg-black/60 h-5 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner ring-1 ring-white/5">
        <div 
          className={`h-full ${color} transition-all duration-1000 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.5)] relative`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
