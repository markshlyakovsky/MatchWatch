import React, { useState, useEffect, useCallback } from 'react';
import { Sliders, Settings, History, Film, Sparkles, LogOut, Trash2, X, PlusCircle, AlertCircle, Compass, Users, Check, ArrowRight, Upload, Download, Search } from 'lucide-react';

import Onboarding from './components/Onboarding';
import HeroCard from './components/HeroCard';
import BottomDrawer from './components/BottomDrawer';
import SettingsModal from './components/SettingsModal';
import TriageConsole from './components/TriageConsole';

import { useTMDB } from './hooks/useTMDB';
import { getOfflineRecommendations, OFFLINE_CATALOG } from './utils/recommender';
import { parseWatchHistory } from './utils/csvParser';

import { auth, db, isFirebaseEnabled } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  // -------------------------------------------------------------
  // MULTI-PROFILE PERSISTENCE LAYER
  // -------------------------------------------------------------
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('watchmatch_profiles_v3');
    if (saved) return JSON.parse(saved);
    return []; // Return empty list for brand-new users
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem('watchmatch_active_profile_id') || '';
  });

  const [showProfilePicker, setShowProfilePicker] = useState(true);
  const [newProfileName, setNewProfileName] = useState('');

  // -------------------------------------------------------------
  // ACTIVE PROFILE BINDINGS (Drawn from profiles state array)
  // -------------------------------------------------------------
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: '',
    name: 'Guest',
    avatarBg: 'linear-gradient(135deg, #8e8e93, #8e8e93)',
    watchHistory: [],
    anchors: [],
    dnaSelection: {},
    selectedPlatforms: ['Netflix', 'Prime', 'Disney+'],
    region: 'US'
  };

  // Primary active states
  const [watchHistory, setWatchHistory] = useState(activeProfile.watchHistory);
  const [anchors, setAnchors] = useState(activeProfile.anchors);
  const [dnaSelection, setDnaSelection] = useState(activeProfile.dnaSelection);
  const [selectedPlatforms, setSelectedPlatforms] = useState(activeProfile.selectedPlatforms);
  const [region, setRegion] = useState(() => {
    return localStorage.getItem('watchmatch_active_region_detected') || activeProfile.region;
  });

  const [tmdbKey, setTmdbKey] = useState(() => localStorage.getItem('watchmatch_tmdb_key') || '');

  // Main screen routes
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Matchmaking outputs
  const [recommendations, setRecommendations] = useState(null);
  const [activeHero, setActiveHero] = useState(null);
  const [rerollIndex, setRerollIndex] = useState(0);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [triageConfig, setTriageConfig] = useState(null);

  // Hook for live TMDB
  const { loading: apiLoading, error: apiError, searchTitles, getLiveRecommendations, validateAPIKey } = useTMDB();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // -------------------------------------------------------------
  // SYNCHRONIZATION ALGORITHMS
  // -------------------------------------------------------------

  // Save TMDB Key globally
  useEffect(() => {
    localStorage.setItem('watchmatch_tmdb_key', tmdbKey);
  }, [tmdbKey]);

  // -------------------------------------------------------------
  // CLOUD AUTHENTICATION & PROFILE RECOVERY (FIREBASE)
  // -------------------------------------------------------------
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          setIsCloudSyncing(true);
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              if (data.profiles && data.profiles.length > 0) {
                setProfiles(data.profiles);
              }
              if (data.activeProfileId) {
                setActiveProfileId(data.activeProfileId);
              }
              if (data.tmdbKey) {
                setTmdbKey(data.tmdbKey);
              }
            } else {
              // Migrate local guest progress to their new cloud account!
              const savedProfiles = localStorage.getItem('watchmatch_profiles_v3');
              const localProfiles = savedProfiles ? JSON.parse(savedProfiles) : [];
              const savedActiveId = localStorage.getItem('watchmatch_active_profile_id') || '';
              const savedKey = localStorage.getItem('watchmatch_tmdb_key') || '';
              
              await setDoc(userDocRef, {
                profiles: localProfiles,
                activeProfileId: savedActiveId,
                tmdbKey: savedKey,
                updatedAt: new Date().toISOString()
              });
            }
          } catch (err) {
            console.error("Cloud database recovery failed:", err);
          } finally {
            setIsCloudSyncing(false);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Debounced Auto-Sync back to Cloud database on changes
  useEffect(() => {
    if (isFirebaseEnabled && db && currentUser) {
      const delaySync = setTimeout(async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            profiles,
            activeProfileId,
            tmdbKey,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log("State synced to Cloud.");
        } catch (err) {
          console.error("Cloud auto-sync failed:", err);
        }
      }, 1000);
      return () => clearTimeout(delaySync);
    }
  }, [profiles, activeProfileId, tmdbKey, currentUser]);

  // Handle active profile switching
  useEffect(() => {
    const p = profiles.find(prof => prof.id === activeProfileId) || profiles[0];
    if (p) {
      setWatchHistory(p.watchHistory || []);
      setAnchors(p.anchors || []);
      setDnaSelection(p.dnaSelection || {});
      setSelectedPlatforms(p.selectedPlatforms || ['Netflix', 'Prime', 'Disney+']);
      setRegion(p.region || 'US');
      setRecommendations(null); 
      setActiveHero(null);
      setTriageConfig(null); // Reset triage questionnaire when switching profiles!
      
      const onboarded = (p.watchHistory && p.watchHistory.length > 0) || 
                        (p.anchors && p.anchors.length > 0) || 
                        (p.dnaSelection && Object.keys(p.dnaSelection).length > 0);
      setIsOnboarded(onboarded);
    }
  }, [activeProfileId]);

  // Synchronize active states back into the main profiles array and LocalStorage
  useEffect(() => {
    setProfiles(prev => {
      const next = prev.map(p => {
        if (p.id === activeProfileId) {
          return {
            ...p,
            watchHistory,
            anchors,
            dnaSelection,
            selectedPlatforms,
            region
          };
        }
        return p;
      });
      localStorage.setItem('watchmatch_profiles_v3', JSON.stringify(next));
      return next;
    });
  }, [watchHistory, anchors, dnaSelection, selectedPlatforms, region, activeProfileId]);

  // Persist active ID
  useEffect(() => {
    localStorage.setItem('watchmatch_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  // IP-Based Geolocation Country Detection on Mount (Fallback Cascade: ipapi -> freeipapi -> ipinfo)
  useEffect(() => {
    const activeStored = localStorage.getItem('watchmatch_active_region_detected');
    if (activeStored) {
      // Load previously detected region back into state
      setRegion(activeStored);
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && data.country_code) {
            const countryCode = data.country_code.toUpperCase();
            setRegion(countryCode);
            localStorage.setItem('watchmatch_active_region_detected', countryCode);
          } else {
            throw new Error('No country code in ipapi');
          }
        })
        .catch(() => {
          // Fallback 1: freeipapi
          fetch('https://freeipapi.com/api/json')
            .then(res => res.json())
            .then(data => {
              if (data && data.countryCode) {
                const countryCode = data.countryCode.toUpperCase();
                setRegion(countryCode);
                localStorage.setItem('watchmatch_active_region_detected', countryCode);
              } else {
                throw new Error('No country code in freeipapi');
              }
            })
            .catch(() => {
              // Fallback 2: ipinfo
              fetch('https://ipinfo.io/json')
                .then(res => res.json())
                .then(data => {
                  if (data && data.country) {
                    const countryCode = data.country.toUpperCase();
                    setRegion(countryCode);
                    localStorage.setItem('watchmatch_active_region_detected', countryCode);
                  }
                })
                .catch(err => console.warn('All IP geolocation fallbacks failed: ', err));
            });
        });
    }
  }, []);


  // Check onboarding routing state based on active inputs
  useEffect(() => {
    const onboarded = watchHistory.length > 0 || anchors.length > 0 || Object.keys(dnaSelection).length > 0;
    setIsOnboarded(onboarded);
  }, [watchHistory, anchors, dnaSelection]);

  // -------------------------------------------------------------
  // RECOMMENDATION GENERATION
  // -------------------------------------------------------------
  const generateRecommendations = useCallback(async (
    currentAnchors = anchors,
    currentDna = dnaSelection,
    currentHistory = watchHistory,
    currentKey = tmdbKey,
    currentTriage = triageConfig
  ) => {
    if (currentAnchors.length === 0 && Object.keys(currentDna).length === 0) return;
    
    setMatchingLoading(true);
    
    const prefs = {
      streamingPlatforms: selectedPlatforms,
      contentType: ['movie', 'tv']
    };

    if (currentKey) {
      const liveData = await getLiveRecommendations(
        currentAnchors,
        currentDna,
        currentHistory,
        prefs,
        currentKey,
        region,
        currentTriage || { mode: 'any' }
      );
      
      if (liveData && liveData.bestPick) {
        setRecommendations(liveData);
        setActiveHero(liveData.bestPick);
        setRerollIndex(0);
        setMatchingLoading(false);
        return;
      }
    }

    // Fallback: local offline matrix recommender
    const offlineData = getOfflineRecommendations(
      currentAnchors,
      currentDna,
      currentHistory,
      prefs,
      currentTriage || { mode: 'any' }
    );
    setRecommendations(offlineData);
    setActiveHero(offlineData.bestPick);
    setRerollIndex(0);
    setMatchingLoading(false);
  }, [anchors, dnaSelection, watchHistory, tmdbKey, selectedPlatforms, region, getLiveRecommendations, triageConfig]);

  // Refresh scoring on initial render once picker closes and onboarding is complete
  useEffect(() => {
    if (!showProfilePicker && isOnboarded && triageConfig && !recommendations && !matchingLoading) {
      generateRecommendations();
    }
  }, [showProfilePicker, isOnboarded, triageConfig, recommendations, matchingLoading, generateRecommendations]);

  // -------------------------------------------------------------
  // ONBOARDING WIZARD HANDLERS
  // -------------------------------------------------------------
  const handleCompleteOnboarding = (data) => {
    setWatchHistory(data.watchHistory);
    setAnchors(data.anchors);
    setDnaSelection(data.dnaSelection);
    setIsOnboarded(true);
    
    generateRecommendations(data.anchors, data.dnaSelection, data.watchHistory, tmdbKey);
  };

  // -------------------------------------------------------------
  // SETTINGS PANEL & PLATFORMS
  // -------------------------------------------------------------
  const handleSaveKey = (key) => {
    setTmdbKey(key);
    generateRecommendations(anchors, dnaSelection, watchHistory, key);
  };

  const handleTogglePlatform = (platform) => {
    setSelectedPlatforms(prev => {
      const next = prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform];
      setTimeout(() => generateRecommendations(anchors, dnaSelection, watchHistory, tmdbKey), 50);
      return next;
    });
  };

  const handleChangeRegion = (newRegion) => {
    setRegion(newRegion);
    setTimeout(() => generateRecommendations(anchors, dnaSelection, watchHistory, tmdbKey), 50);
  };

  const handleResetHistory = () => {
    if (window.confirm("Are you sure you want to clear this active profile's ratings and start over?")) {
      setWatchHistory([]);
      setAnchors([]);
      setDnaSelection({});
      setRecommendations(null);
      setActiveHero(null);
      setIsOnboarded(false);
      setIsSettingsOpen(false);
      setIsHistoryOpen(false);
      setIsProfileOpen(false);
    }
  };

  // -------------------------------------------------------------
  // PROFILE ACTIONS: ADD / SWITCH / REMOVE
  // -------------------------------------------------------------
  const handleAddProfile = () => {
    const name = newProfileName.trim();
    if (!name) return;

    const gradients = [
      'linear-gradient(135deg, #ff5a36, #ff3b30)',
      'linear-gradient(135deg, #00c6ff, #007aff)',
      'linear-gradient(135deg, #af52de, #5856d6)',
      'linear-gradient(135deg, #34c759, #4cd964)',
      'linear-gradient(135deg, #ffcc00, #ff9500)',
      'linear-gradient(135deg, #ff2d55, #ff6b8b)'
    ];
    const randomBg = gradients[profiles.length % gradients.length];

    const newProfile = {
      id: `profile-${Date.now()}`,
      name: name,
      avatarBg: randomBg,
      watchHistory: [],
      anchors: [],
      dnaSelection: {},
      selectedPlatforms: ['Netflix', 'Prime', 'Disney+'],
      region: 'US'
    };

    const nextProfiles = [...profiles, newProfile];
    setProfiles(nextProfiles);
    localStorage.setItem('watchmatch_profiles_v3', JSON.stringify(nextProfiles));
    setNewProfileName('');
    
    // Automatically select the profile if it is the first one created!
    if (profiles.length === 0) {
      setActiveProfileId(newProfile.id);
      setShowProfilePicker(false);
    }
  };

  const handleDeleteProfile = (id, e) => {
    e.stopPropagation(); // Prevent switching profile context
    if (window.confirm("Are you sure you want to delete this profile? All viewing history and custom tags will be permanently removed.")) {
      const nextProfiles = profiles.filter(p => p.id !== id);
      setProfiles(nextProfiles);
      localStorage.setItem('watchmatch_profiles_v3', JSON.stringify(nextProfiles));
      
      if (nextProfiles.length === 0) {
        setActiveProfileId('');
        setShowProfilePicker(true);
      } else if (activeProfileId === id) {
        setActiveProfileId(nextProfiles[0].id);
      }
    }
  };

  const handleSelectProfile = (id) => {
    setActiveProfileId(id);
    setShowProfilePicker(false);
  };

  const handleLogOut = async () => {
    setIsProfileOpen(false);
    setShowProfilePicker(true);
    if (isFirebaseEnabled && auth) {
      try {
        await signOut(auth);
        localStorage.removeItem('watchmatch_user_email');
        setProfiles([]);
        setActiveProfileId('');
        setTmdbKey('');
        setIsOnboarded(false);
        setTriageConfig(null);
        setRecommendations(null);
        setActiveHero(null);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
  };

  // -------------------------------------------------------------
  // FILE EXPORT ACTIONS
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (watchHistory.length === 0) {
      alert("Your watch history is empty. Ingest some histories first.");
      return;
    }
    const headers = "Title,OriginalTitle,Date,Type\n";
    const rows = watchHistory.map(item => {
      const title = typeof item === 'string' ? item : item.cleanTitle;
      const original = typeof item === 'string' ? item : item.originalTitle;
      const date = typeof item === 'string' ? '' : (item.date || '');
      const type = typeof item === 'string' ? 'movie' : (item.type || 'unknown');
      
      const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      return `${escape(title)},${escape(original)},${escape(date)},${escape(type)}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `watchmatch_${activeProfile.name}_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (watchHistory.length === 0) {
      alert("Your watch history is empty.");
      return;
    }
    const blob = new Blob([JSON.stringify(watchHistory, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `watchmatch_${activeProfile.name}_history.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // SHOWCASE SCENE HANDLERS
  // -------------------------------------------------------------
  const handleMarkSeen = (movie) => {
    const cleanName = movie.title.toLowerCase();
    const alreadySeen = watchHistory.some(h => (typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase()) === cleanName);
    
    let nextHistory;
    if (alreadySeen) {
      nextHistory = watchHistory.filter(h => (typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase()) !== cleanName);
    } else {
      const newHistoryItem = {
        cleanTitle: movie.title,
        originalTitle: movie.title,
        date: new Date().toISOString().split('T')[0],
        type: movie.type
      };
      nextHistory = [newHistoryItem, ...watchHistory];
    }
    setWatchHistory(nextHistory);
    
    // Automatically trigger immediate recalculation of recommendations using the updated history,
    // which automatically filters out the marked title from the showcase and backup lists!
    setTimeout(() => {
      generateRecommendations(anchors, dnaSelection, nextHistory, tmdbKey);
    }, 50);
  };

  const handleReroll = () => {
    if (!recommendations || recommendations.archetypes.length === 0) return;
    const nextIdx = (rerollIndex + 1) % recommendations.archetypes.length;
    setRerollIndex(nextIdx);
    setActiveHero(recommendations.archetypes[nextIdx]);
  };

  const handleSelectBackup = (backupItem) => {
    setActiveHero(backupItem);
  };

  // Autocomplete Search states inside History modal
  const [historySearch, setHistorySearch] = useState('');
  const [historySearchResults, setHistorySearchResults] = useState([]);
  const [historySearchLoading, setHistorySearchLoading] = useState(false);

  // Debounced search logic for History Modal autocomplete
  useEffect(() => {
    if (!historySearch.trim()) {
      setHistorySearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setHistorySearchLoading(true);
      if (tmdbKey) {
        try {
          const results = await searchTitles(historySearch, tmdbKey);
          setHistorySearchResults(results.slice(0, 5));
        } catch (err) {
          console.warn("Failed live TMDB search in history modal: ", err);
        }
      } else {
        // Search offline database
        const query = historySearch.toLowerCase();
        const matches = OFFLINE_CATALOG.filter(c => 
          c.title.toLowerCase().includes(query) || 
          (c.genres && c.genres.some(g => g.toLowerCase().includes(query)))
        ).slice(0, 5);
        // Map keys to match searchTitle output format
        setHistorySearchResults(matches.map(m => ({
          id: m.id,
          title: m.title,
          type: m.type,
          year: typeof m.year === 'number' ? m.year : parseInt(m.year) || 'N/A',
          genres: m.genres,
          backdrop: m.backdrop,
          poster: m.poster || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=500&q=80',
          rating: m.rating,
          synopsis: m.synopsis
        })));
      }
      setHistorySearchLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [historySearch, tmdbKey, searchTitles]);

  const handleSelectHistorySearchItem = (item) => {
    // Prevent duplicates
    const cleanName = item.title.toLowerCase();
    const alreadySeen = watchHistory.some(h => (typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase()) === cleanName);
    
    if (alreadySeen) {
      alert(`"${item.title}" is already in your watch history.`);
      setHistorySearch('');
      setHistorySearchResults([]);
      return;
    }

    const newHistoryItem = {
      cleanTitle: item.title,
      originalTitle: item.title,
      date: new Date().toISOString().split('T')[0],
      type: item.type, // 'movie' or 'tv'
      backdrop: item.backdrop,
      poster: item.poster,
      rating: item.rating,
      genres: item.genres,
      synopsis: item.synopsis,
      id: item.id
    };

    setWatchHistory(prev => [newHistoryItem, ...prev]);
    setHistorySearch('');
    setHistorySearchResults([]);
    setTimeout(() => generateRecommendations(), 50);
  };

  const handleManualAddHistory = (title, type = 'movie') => {
    if (!title.trim()) return;
    const item = {
      cleanTitle: title.trim(),
      originalTitle: title.trim(),
      date: new Date().toISOString().split('T')[0],
      type: type
    };
    setWatchHistory(prev => [item, ...prev]);
    setTimeout(() => generateRecommendations(), 50);
  };

  const isCurrentHeroWatched = activeHero 
    ? watchHistory.some(h => (typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase()) === activeHero.title.toLowerCase())
    : false;

  // -------------------------------------------------------------
  // VIEWPORT RENDER BRANCHES
  // -------------------------------------------------------------

  if (showProfilePicker) {
    // NETFLIX-STYLE "WHO'S WATCHING?" PRIMARY LANDING SCREEN
    return (
      <div className="profile-select-container flex flex-col justify-center items-center">
        <div className="text-center max-w-xl px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl">🍿</span>
            <span className="text-3xl font-black uppercase tracking-tight gradient-text">WatchMatch</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-8 text-white tracking-tight">Who's Watching?</h1>
          
          {/* Profile grid lists */}
          <div className="profile-select-grid flex flex-wrap justify-center gap-8 mb-12">
            {profiles.map(p => (
              <div 
                key={p.id} 
                className="profile-select-card flex flex-col items-center cursor-pointer group"
                onClick={() => handleSelectProfile(p.id)}
              >
                <div 
                  className="profile-avatar-large transition-all duration-300 transform group-hover:scale-105 group-hover:border-white shadow-xl"
                  style={{ backgroundImage: p.avatarBg, width: '100px', height: '100px', fontSize: '2.5rem' }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-300 group-hover:text-white mt-3 tracking-wide">
                  {p.name}
                </span>

                {/* Clean Delete Action Underneath (Hover-to-reveal) */}
                <button 
                  className="delete-profile-underneath mt-2 text-[10px] text-red uppercase tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline focus:outline-none"
                  onClick={(e) => handleDeleteProfile(p.id, e)}
                  title={`Delete profile ${p.name}`}
                >
                  <Trash2 size={10} />
                  Delete
                </button>
              </div>
            ))}

            {/* Dotted ADD CARD */}
            {profiles.length < 6 && (
              <div className="profile-select-card flex flex-col items-center">
                <div className="add-profile-box flex items-center justify-center rounded-full border-2 border-dashed border-white/20 hover:border-white/50 cursor-pointer transition-colors duration-300" style={{ width: '100px', height: '100px' }}>
                  <PlusCircle size={32} className="text-slate-500 hover:text-white" onClick={() => document.getElementById('new-profile-input').focus()} />
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-3 uppercase tracking-wider">New Profile</span>
              </div>
            )}
          </div>

          {/* Add Profile forms */}
          {profiles.length < 6 && (
            <div className="glass p-5 rounded-xl border border-white/5 flex gap-3 max-w-md mx-auto items-center">
              <input 
                type="text" 
                id="new-profile-input"
                className="input-field text-sm flex-1"
                placeholder="Enter new profile name..."
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddProfile(); }}
              />
              <button className="btn-primary py-2 px-4 flex items-center gap-1 text-xs" onClick={handleAddProfile}>
                Add Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STANDARD WATCHMATCH SEARCH & MATCHMAKING viewport
  return (
    <div className="app-container flex flex-col">
      {/* Cinematic Header Nav */}
      <header className="navbar glass">
        <div className="logo-container cursor-pointer" onClick={() => setShowProfilePicker(true)}>
          <span className="logo-icon">🍿</span>
          <span className="gradient-text">WatchMatch</span>
          <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-widest ml-2 ${
            tmdbKey ? 'bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20' : 'bg-white/5 text-slate-400 border border-white/10'
          }`} style={{ letterSpacing: '1px' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${tmdbKey ? 'bg-[#34c759] animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="hidden-xs">{tmdbKey ? "Live TMDB Mode" : "Offline Mode"}</span>
            <span className="visible-xs">{tmdbKey ? "Live" : "Offline"}</span>
          </span>
        </div>
        
        {isOnboarded && (
          <nav className="nav-actions">
            {/* Triage Mood Refinement */}
            {triageConfig && (
              <button 
                className="btn-icon text-orange border-orange/40" 
                onClick={() => {
                  setTriageConfig(null);
                  setRecommendations(null);
                  setActiveHero(null);
                }}
                title="Refine Match Mood Questionnaire"
              >
                <Sliders size={18} />
              </button>
            )}

            {/* Compass / Reseed Onboarding */}
            <button 
              className="btn-icon" 
              onClick={() => {
                if (window.confirm("Do you want to re-profile your Movie DNA/History anchors?")) {
                  setIsOnboarded(false);
                }
              }}
              title="Reseed Movie DNA Profile"
            >
              <Compass size={18} />
            </button>

            {/* Ingestion history panel toggle */}
            <button 
              className={`btn-icon ${isHistoryOpen ? 'text-orange border-orange' : ''}`}
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="View History File Logs"
            >
              <History size={18} />
            </button>

            {/* Preferences setup icon */}
            <button 
              className="btn-icon" 
              onClick={() => setIsSettingsOpen(true)}
              title="Settings Preferences"
            >
              <Settings size={18} />
            </button>

            {/* Circular active profile switcher */}
            <button 
              className="user-avatar-circle"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ backgroundImage: activeProfile.avatarBg }}
              title={`Active Profile: ${activeProfile.name}`}
            >
              {activeProfile.name.charAt(0).toUpperCase()}
            </button>
          </nav>
        )}
      </header>

      {/* Floating profile switcher dropdown card */}
      {isProfileOpen && isOnboarded && (
        <div className="profile-dropdown glass">
          <div className="profile-header flex items-center gap-3 border-b border-white/5 pb-3 mb-3">
            <div className="profile-avatar-large" style={{ backgroundImage: activeProfile.avatarBg, width: '40px', height: '40px', fontSize: '1.25rem' }}>
              {activeProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white line-clamp-1">{activeProfile.name}</span>
              <span className="text-[10px] text-orange font-bold uppercase tracking-wider">
                {watchHistory.length > 20 ? "Cinephile Elite" : (watchHistory.length > 5 ? "Film Buff" : "Novice Critic")}
              </span>
            </div>
          </div>

          {/* Quick list of other profiles for rapid switching */}
          {profiles.length > 1 && (
            <div className="mb-4 border-b border-white/5 pb-3">
              <span className="text-xxs uppercase tracking-wider text-slate-500 font-bold block mb-2">Switch Profile:</span>
              <div className="flex flex-col gap-1.5">
                {profiles.filter(p => p.id !== activeProfileId).map(p => (
                  <div 
                    key={p.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-left transition-colors"
                    onClick={() => {
                      handleSelectProfile(p.id);
                      setIsProfileOpen(false);
                    }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundImage: p.avatarBg }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-stats grid grid-cols-3 gap-2 text-center mb-4">
            <div className="stat-box glass">
              <span className="stat-val text-orange">{watchHistory.length}</span>
              <span className="stat-lbl">Seen</span>
            </div>
            <div className="stat-box glass">
              <span className="stat-val text-blue-glow">{selectedPlatforms.length}</span>
              <span className="stat-lbl">Nets</span>
            </div>
            <div className="stat-box glass">
              <span className="stat-val text-green">{anchors.length}</span>
              <span className="stat-lbl">Seeds</span>
            </div>
          </div>

          {/* Active DNA Vibes visual tags */}
          {Object.keys(dnaSelection).length > 0 && (
            <div className="mb-4 text-left">
              <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block mb-1">Active DNA Vibes:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(dnaSelection).map(([v, intensity]) => (
                  <span key={v} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-300">
                    {v.replace(/([A-Z])/g, ' $1')} ({intensity})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <button 
              className="btn-secondary py-1.5 text-xs font-bold w-full"
              onClick={() => {
                setIsProfileOpen(false);
                setIsOnboarded(false);
              }}
            >
              Reseed DNA Matcher
            </button>
            
            <button 
              className="btn-danger py-1.5 text-xs font-bold w-full flex items-center justify-center gap-1.5"
              onClick={handleLogOut}
            >
              <Users size={12} />
              Manage Profiles
            </button>
          </div>
        </div>
      )}

      {/* Main viewport contents */}
      <main className="flex-1 flex flex-col justify-center">
        {!isOnboarded ? (
          <Onboarding 
            onCompleteOnboarding={handleCompleteOnboarding} 
            tmdbKey={tmdbKey}
            searchTitles={searchTitles}
          />
        ) : !triageConfig ? (
          <TriageConsole 
            watchHistory={watchHistory}
            onCompleteTriage={(config) => {
              setTriageConfig(config);
              generateRecommendations(anchors, dnaSelection, watchHistory, tmdbKey, config);
            }}
          />
        ) : (
          <div className="dashboard-grid relative">
            
            {/* Loading indicators */}
            {(matchingLoading || apiLoading) ? (
              <div className="hero-card-empty glass flex flex-col justify-center items-center text-center p-12 h-[480px]">
                <div className="icon-pulse-container mb-4">
                  <Sparkles size={48} className="icon-orange animate-pulse" />
                </div>
                <h2 className="text-xl font-bold">Scanning Global Databases...</h2>
                <p className="text-gray mt-2 text-sm max-w-xs">Connecting providers, parsing plotlines, and configuring recommendations...</p>
              </div>
            ) : (
              <HeroCard 
                movie={activeHero} 
                onMarkSeen={handleMarkSeen}
                onReroll={handleReroll}
                isWatched={isCurrentHeroWatched}
              />
            )}

            {/* Drawer with backup squads */}
            {recommendations && recommendations.archetypes && !matchingLoading && !apiLoading && (
              <BottomDrawer 
                archetypes={recommendations.archetypes}
                onSelectBackup={handleSelectBackup}
                activeHeroId={activeHero?.id}
              />
            )}
          </div>
        )}
      </main>

      {/* Settings Panel */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tmdbKey={tmdbKey}
        onSaveKey={handleSaveKey}
        validateAPIKey={validateAPIKey}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={handleTogglePlatform}
        region={region}
        onChangeRegion={handleChangeRegion}
        onResetHistory={handleResetHistory}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* Center-Aligned History Modal Dashboard (mirrors Settings Modal) */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-container glass">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <History className="icon-orange" size={20} />
                <h2 className="text-xl font-bold">{activeProfile.name}'s Profile Logs</h2>
              </div>
              <button className="close-btn" onClick={() => setIsHistoryOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Manual Add Section */}
              <div className="settings-section">
                <h3 className="section-title">1. Search & Inject Real Movie/Show</h3>
                <p className="section-subtitle">Search live TMDB or curated offline records to automatically inject real titles with authentic posters, types, and genres.</p>
                
                <div className="relative mt-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      className="input-field pl-9 pr-8 text-xs w-full"
                      placeholder="Search title to add (e.g. Off Campus, Inception, Breaking Bad...)"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    {historySearch && (
                      <button 
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer"
                        onClick={() => { setHistorySearch(''); setHistorySearchResults([]); }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete list dropdown */}
                  {historySearch.trim() && (
                    <div className="search-autocomplete glass mt-1" style={{ position: 'absolute', width: '100%', zIndex: 100, border: '1px solid rgba(255,255,255,0.08)' }}>
                      {historySearchResults.length > 0 ? (
                        historySearchResults.map(item => (
                          <div 
                            key={item.id} 
                            className="autocomplete-item flex justify-between items-center hover:bg-white/5 cursor-pointer p-3 border-b border-white/5"
                            onClick={() => handleSelectHistorySearchItem(item)}
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-sm text-white">{item.title}</span>
                              <span className="text-xxs text-slate-400 mt-0.5">
                                {item.genres ? item.genres.join(', ') : 'Drama'} ({item.year})
                              </span>
                            </div>
                            <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                              {item.type === 'tv' ? '📺 TV Show' : '🎬 Movie'}
                            </span>
                          </div>
                        ))
                      ) : (
                        !historySearchLoading && (
                          <div className="p-3 text-xs text-slate-500 italic text-center">
                            No exact matches found. Add as custom item below:
                          </div>
                        )
                      )}

                      {/* Always show custom manual fallbacks if user wants to add an exact custom title */}
                      <div 
                        className="autocomplete-item cursor-pointer hover:bg-white/5 p-3 flex justify-between items-center border-t border-white/5"
                        onClick={() => {
                          handleManualAddHistory(historySearch, 'movie');
                          setHistorySearch('');
                          setHistorySearchResults([]);
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs text-slate-200 font-bold">Add Custom Movie: "{historySearch}"</span>
                          <span className="text-xxs text-slate-400 mt-0.5">Inject as custom movie event</span>
                        </div>
                        <span className="text-[9px] bg-white/5 text-slate-300 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">🎬 Custom Movie</span>
                      </div>
                      <div 
                        className="autocomplete-item cursor-pointer hover:bg-white/5 p-3 flex justify-between items-center"
                        onClick={() => {
                          handleManualAddHistory(historySearch, 'tv');
                          setHistorySearch('');
                          setHistorySearchResults([]);
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs text-slate-200 font-bold">Add Custom TV Show: "{historySearch}"</span>
                          <span className="text-xxs text-slate-400 mt-0.5">Inject as custom series event</span>
                        </div>
                        <span className="text-[9px] bg-white/5 text-slate-300 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">📺 Custom TV Show</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Import History Area */}
              <div className="settings-section">
                <h3 className="section-title">2. Ingest Viewing Files</h3>
                <p className="section-subtitle">Merge history logs from external trackers directly into your profile timeline.</p>
                
                <label 
                  htmlFor="extra-file-upload" 
                  className="upload-dropzone flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer text-center group"
                >
                  <Upload size={24} className="text-slate-400 group-hover:text-orange group-hover:animate-bounce mb-2 transition-colors" />
                  <span className="text-xs text-slate-200 font-extrabold uppercase tracking-wider group-hover:text-white">Import Watch History</span>
                  <span className="text-[10px] text-slate-500 mt-1">Supports Netflix CSV & Trakt/Plex JSON</span>
                </label>
                <input 
                  type="file" 
                  id="extra-file-upload" 
                  className="hidden" 
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const items = parseWatchHistory(event.target.result, file.name);
                      if (items.length === 0) {
                        alert("Could not extract history from this file.");
                        return;
                      }
                      setWatchHistory(prev => {
                        const existingTitles = prev.map(h => (typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase()));
                        const uniqueNew = items.filter(item => !existingTitles.includes(item.cleanTitle.toLowerCase()));
                        return [...uniqueNew, ...prev];
                      });
                      alert(`Successfully imported ${items.length} new records and appended them to your profile logs!`);
                      setTriageConfig(null); // Force triage re-run for updated history!
                    };
                    reader.readAsText(file);
                  }} 
                />
              </div>

              {/* Export/Backup Section */}
              {watchHistory.length > 0 && (
                <div className="settings-section">
                  <h3 className="section-title">3. Backup Profile Timeline</h3>
                  <p className="section-subtitle">Save a local copy of your consolidated logs as CSV or JSON.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExportCSV} 
                      className="btn-secondary py-2 px-3 text-xs flex-1 flex items-center justify-center gap-1.5 font-bold"
                      title="Export Watch History as CSV"
                    >
                      <Download size={12} />
                      Download CSV History
                    </button>
                    <button 
                      onClick={handleExportJSON} 
                      className="btn-secondary py-2 px-3 text-xs flex-1 flex items-center justify-center gap-1.5 font-bold"
                      title="Export Watch History as JSON"
                    >
                      <Download size={12} />
                      Download JSON History
                    </button>
                  </div>
                </div>
              )}

              {/* Viewing Logs List Section */}
              <div className="settings-section border-none pb-0 mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="section-title">
                    {watchHistory.length > 0 ? `4. Viewing History Logs (${watchHistory.length})` : '4. Viewing History Logs'}
                  </h3>
                  {watchHistory.length > 0 && (
                    <button 
                      className="text-red hover:underline text-xxs font-bold uppercase tracking-wider flex items-center gap-1 border-none bg-transparent cursor-pointer"
                      onClick={handleResetHistory}
                    >
                      Clear Logs
                    </button>
                  )}
                </div>
                
                {watchHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-500 py-8 text-center">
                    <span className="text-3xl mb-2">🎞️</span>
                    <p className="text-xs italic">No watch logs imported yet. Manually add or upload viewing history above.</p>
                  </div>
                ) : (
                  <>
                    <p className="section-subtitle mb-3">
                      Showing the most recent 150 watch events. All {watchHistory.length} records are actively processed by the recommendation core.
                    </p>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {watchHistory.slice(0, 150).map((item, idx) => {
                        const titleStr = typeof item === 'string' ? item : item.cleanTitle;
                        const originalStr = typeof item === 'string' ? item : item.originalTitle;
                        const typeStr = typeof item === 'string' ? 'movie' : item.type;
                        
                        let subtitleStr = '';
                        if (originalStr !== titleStr) {
                          if (originalStr.toLowerCase().startsWith(titleStr.toLowerCase() + ':')) {
                            subtitleStr = originalStr.substring(titleStr.length + 1).trim();
                          } else {
                            subtitleStr = originalStr;
                          }
                        }
                        
                        return (
                          <div key={`${titleStr}-${idx}`} className="history-item-row text-left">
                            <div className="flex flex-col flex-1 pr-2">
                              <span className="text-xs font-bold text-white line-clamp-1">{titleStr}</span>
                              {subtitleStr && (
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{subtitleStr}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                {typeStr === 'tv' ? '📺 TV' : '🎬 Movie'}
                              </span>
                              <button 
                                className="remove-anchor text-slate-500 hover:text-red transition-colors border-none bg-transparent"
                                onClick={() => {
                                  setWatchHistory(prev => prev.filter((_, i) => i !== idx));
                                  setTimeout(() => generateRecommendations(), 50);
                                }}
                                title="Remove from history logs"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
