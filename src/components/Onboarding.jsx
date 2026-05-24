import React, { useState, useEffect } from 'react';
import { Upload, Dna, Compass, Search, Plus, X, Film, Check, ShieldAlert, Cpu } from 'lucide-react';
import { parseWatchHistory } from '../utils/csvParser';
import { OFFLINE_CATALOG } from '../utils/recommender';

export default function Onboarding({ 
  onCompleteOnboarding, 
  tmdbKey, 
  searchTitles 
}) {
  const [onboardingStep, setOnboardingStep] = useState(() => {
    const email = localStorage.getItem('watchmatch_user_email');
    return email ? 'setup' : 'login';
  });

  const [localSelectedPlatforms, setLocalSelectedPlatforms] = useState(['Netflix', 'Prime', 'Disney+']);

  const platforms = [
    { name: 'Netflix', color: '#E50914' },
    { name: 'Prime', color: '#00A8E1' },
    { name: 'Disney+', color: '#113CCF' },
    { name: 'Max', color: '#0058FF' },
    { name: 'Apple TV+', color: '#8E8E93' },
    { name: 'Hulu', color: '#3DBB3D' },
    { name: 'Paramount+', color: '#0064FF' },
    { name: 'Peacock', color: '#00b2a9' }
  ];

  const handleToggleLocalPlatform = (platform) => {
    setLocalSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [activeTab, setActiveTab] = useState('csv'); // 'csv' or 'dna'
  const [selectedVibes, setSelectedVibes] = useState({
    mindBending: false,
    spineChilling: false,
    actionPacked: false,
    deepThoughtful: false,
    laughOutLoud: false,
    heartWarming: false
  });
  
  // Custom sliders for vibe intensity
  const [vibeIntensities, setVibeIntensities] = useState({
    mindBending: 8,
    spineChilling: 8,
    actionPacked: 8,
    deepThoughtful: 8,
    laughOutLoud: 8,
    heartWarming: 8
  });

  // For manual Anchor Title seeding
  const [anchorSearch, setAnchorSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnchors, setSelectedAnchors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Ingestion Processing state
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [parsedCount, setParsedCount] = useState(0);
  const [finalItems, setFinalItems] = useState([]);

  // Paste Text raw entry fallback
  const [pastedText, setPastedText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);

  const vibeMetadata = [
    { key: 'mindBending', name: 'Mind-Bending', desc: 'Existential conundrums, multi-verses, and space paradoxes.', gradient: 'linear-gradient(135deg, #007aff, #00c6ff)' },
    { key: 'spineChilling', name: 'Spine-Chilling', desc: 'Dark supernatural mystery, psychological thrillers, and raw tension.', gradient: 'linear-gradient(135deg, #5856d6, #af52de)' },
    { key: 'actionPacked', name: 'Action-Packed', desc: 'High-octane blockbusters, explosions, and intense combat.', gradient: 'linear-gradient(135deg, #ff9500, #ff3b30)' },
    { key: 'deepThoughtful', name: 'Deep & Thoughtful', desc: 'Slow-burn character dramas, philosophical narratives, and history.', gradient: 'linear-gradient(135deg, #34c759, #4cd964)' },
    { key: 'laughOutLoud', name: 'Laugh-Out-Loud', desc: 'Clever satires, physical comedies, and hilarious dialogues.', gradient: 'linear-gradient(135deg, #ffcc00, #ff9500)' },
    { key: 'heartWarming', name: 'Heart-Warming', desc: 'Wholesome family bonding, emotional friendships, and comfort titles.', gradient: 'linear-gradient(135deg, #ff2d55, #ff6b8b)' }
  ];

  // Perform search in real-time or offline
  useEffect(() => {
    if (!anchorSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      if (tmdbKey && searchTitles) {
        const results = await searchTitles(anchorSearch, tmdbKey);
        setSearchResults(results.slice(0, 5));
      } else {
        // Search offline database
        const query = anchorSearch.toLowerCase();
        const matches = OFFLINE_CATALOG.filter(c => 
          c.title.toLowerCase().includes(query) || 
          c.genres.some(g => g.toLowerCase().includes(query))
        ).slice(0, 5);
        setSearchResults(matches);
      }
      setSearchLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [anchorSearch, tmdbKey, searchTitles]);

  const toggleVibe = (key) => {
    setSelectedVibes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleIntensityChange = (key, val) => {
    setVibeIntensities(prev => ({ ...prev, [key]: parseInt(val) }));
  };

  const handleAddAnchor = (item) => {
    if (selectedAnchors.some(a => a.id === item.id)) return;
    if (selectedAnchors.length >= 3) {
      alert("Select up to 3 Seed Anchor titles for matching.");
      return;
    }
    setSelectedAnchors(prev => [...prev, item]);
    setAnchorSearch('');
    setSearchResults([]);
  };

  const handleRemoveAnchor = (id) => {
    setSelectedAnchors(prev => prev.filter(a => a.id !== id));
  };

  // CSV Drag and Drop
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFileContent(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFileContent(file);
  };

  const processFileContent = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      startIngestPipeline(event.target.result, file.name);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    startIngestPipeline(pastedText, 'pasted_history.csv');
  };

  // Animated loading ingestion screen
  const startIngestPipeline = (csvText, filename) => {
    setProcessing(true);
    setProcessingStep(0);
    setProcessingProgress(10);

    // Step 1: Parse
    setTimeout(() => {
      const items = parseWatchHistory(csvText, filename);
      setParsedCount(items.length);
      setFinalItems(items);
      setProcessingStep(1);
      setProcessingProgress(35);

      // Step 2: Clean and Strip Season IDs
      setTimeout(() => {
        setProcessingStep(2);
        setProcessingProgress(65);

        // Step 3: DNA profiling
        setTimeout(() => {
          setProcessingStep(3);
          setProcessingProgress(100);

          // Step 4: Finalize
          setTimeout(() => {
            setProcessing(false);
            // Auto complete onboarding with these items
            onCompleteOnboarding({
              watchHistory: items,
              anchors: items.slice(0, 3).map(i => i.cleanTitle),
              dnaSelection: {},
              selectedPlatforms: localSelectedPlatforms
            });
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Submit manual interest clustering DNA
  const handleDNAClose = () => {
    const finalVibes = {};
    Object.entries(selectedVibes).forEach(([k, active]) => {
      if (active) {
        finalVibes[k] = vibeIntensities[k];
      }
    });

    if (Object.keys(finalVibes).length === 0 && selectedAnchors.length === 0) {
      alert("Please select at least 1 vibe cluster or add an anchor title to seed recommendations.");
      return;
    }

    onCompleteOnboarding({
      watchHistory: [],
      anchors: selectedAnchors.map(a => a.title),
      dnaSelection: finalVibes,
      selectedPlatforms: localSelectedPlatforms
    });
  };

  return (
    <div className="onboarding-container">
      {processing ? (
        // Cinematic ingestion pipeline loading screen
        <div className="processing-overlay glass">
          <div className="processing-box text-center">
            <div className="icon-pulse-container mb-4">
              <Cpu size={40} className="icon-orange animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ingestion Pipeline Active</h2>
            <p className="text-gray mb-6">Analyzing file metadata & aligning recommendation engine...</p>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${processingProgress}%` }}></div>
            </div>
            
            <div className="step-list text-left mt-6 max-w-sm mx-auto">
              <div className={`step-item ${processingStep >= 0 ? 'active' : ''} ${processingStep > 0 ? 'completed' : ''}`}>
                <span className="step-dot"></span>
                <span>Parsing watch history records ({parsedCount} parsed)</span>
              </div>
              <div className={`step-item ${processingStep >= 1 ? 'active' : ''} ${processingStep > 1 ? 'completed' : ''}`}>
                <span className="step-dot"></span>
                <span>Normalizing shows: stripping season markers</span>
              </div>
              <div className={`step-item ${processingStep >= 2 ? 'active' : ''} ${processingStep > 2 ? 'completed' : ''}`}>
                <span className="step-dot"></span>
                <span>Correlating genres & building initial preference vector</span>
              </div>
              <div className={`step-item ${processingStep >= 3 ? 'active' : ''} ${processingStep > 3 ? 'completed' : ''}`}>
                <span className="step-dot"></span>
                <span>Matchmaking completed. Opening Dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Onboarding Screen
        <div className="onboarding-grid">
          <div className="onboarding-info">
            <div className="branding mb-6">
              <span className="brand-logo">🍿</span>
              <h1 className="brand-name">WatchMatch</h1>
            </div>
            <h2 className="title-text text-4xl font-extrabold leading-tight">
              Cinematic Discovery, <br />
              <span className="gradient-text">Engineered For You.</span>
            </h2>
            <p className="desc-text mt-4 text-gray leading-relaxed text-lg">
              Say goodbye to scroll fatigue. WatchMatch processes your streaming histories, maps your core DNA desires, and uses specialized algorithmic archetypes to guide you to the perfect film.
            </p>
            <div className="branding-visual mt-8">
              <span className="branding-visual-title">How it works</span>
              <div className="flex gap-5">
                <div className="branding-step-item">
                  <div className="branding-step-title">1. Input</div>
                  <div className="branding-step-desc">Import CSV or select mood clusters.</div>
                </div>
                <div className="branding-step-item border-l border-white/5 pl-5">
                  <div className="branding-step-title">2. Score</div>
                  <div className="branding-step-desc">Compare against 5 distinct movie archetypes.</div>
                </div>
                <div className="branding-step-item border-l border-white/5 pl-5">
                  <div className="branding-step-title">3. Watch</div>
                  <div className="branding-step-desc">Stream with trailers and locations!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="onboarding-card glass">
            {onboardingStep === 'login' ? (
              <div className="tab-pane flex flex-col justify-between h-full">
                <div>
                  <h3 className="pane-title mb-1">{isSignUp ? "Create Your Cinephile Profile" : "Access WatchMatch Portal"}</h3>
                  <p className="pane-subtitle text-xs text-slate-400">
                    {isSignUp 
                      ? "Establish your custom recommendations key to start tracking history." 
                      : "Sign in with your email or connect as a guest to build your cinematic DNA."}
                  </p>

                  <div className="flex flex-col gap-3 mt-4 text-left">
                    <div>
                      <label className="text-xxs font-semibold text-gray uppercase block mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder="fifam@watchmatch.io" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xxs font-semibold text-gray uppercase block mb-1">Password</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button 
                    className="btn-primary w-full" 
                    onClick={() => {
                      const finalEmail = email.trim() || "guest@watchmatch.io";
                      localStorage.setItem('watchmatch_user_email', finalEmail);
                      setOnboardingStep('setup');
                    }}
                  >
                    {isSignUp ? "Initialize Account" : "Access WatchMatch"}
                  </button>
                  
                  <button 
                    className="btn-secondary w-full"
                    onClick={() => {
                      localStorage.setItem('watchmatch_user_email', 'guest@watchmatch.io');
                      setOnboardingStep('setup');
                    }}
                  >
                    Continue as Anonymous Guest
                  </button>

                  <button 
                    className="btn-text w-full text-center mt-1"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Already have an account? Sign In" : "New to WatchMatch? Create an Account"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Choose Streaming Networks First */}
                <div className="border-b border-white/5 text-left" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem' }}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">1. Choose Streaming Networks First</label>
                  <p className="pane-subtitle text-xs text-slate-400 mb-3" style={{ fontSize: '11px', marginBottom: '0.75rem' }}>
                    Select your active networks to boost recommendations affinity.
                  </p>
                  
                  <div className="platform-grid mb-4">
                    {platforms.map(p => {
                      const isSelected = localSelectedPlatforms.includes(p.name);
                      return (
                        <button 
                          key={p.name}
                          className={`platform-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => handleToggleLocalPlatform(p.name)}
                          style={{ '--platform-color': p.color }}
                        >
                          <span className="dot" style={{ backgroundColor: p.color }}></span>
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div>
                    <button 
                      className={`btn-secondary py-1.5 text-xxs w-full ${localSelectedPlatforms.length === platforms.length ? 'border-orange/60 bg-white/5' : ''}`}
                      onClick={() => setLocalSelectedPlatforms(platforms.map(p => p.name))}
                    >
                      I have them all
                    </button>
                  </div>
                </div>

                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-left">2. Choose Discovery Method</label>

                {/* Tab Navigation */}
                <div className="tab-nav">
                  <button 
                    className={`tab-btn ${activeTab === 'csv' ? 'active' : ''}`}
                    onClick={() => setActiveTab('csv')}
                  >
                    <Upload size={16} />
                    Import History
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'dna' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dna')}
                  >
                    <Dna size={16} />
                    DNA Cluster Setup
                  </button>
                </div>

            {/* Ingestion Hub Tab */}
            {activeTab === 'csv' && (
              <div className="tab-pane">
                <h3 className="pane-title">Ingest Viewing History</h3>
                <p className="pane-subtitle">
                  Upload your Netflix history CSV, Letterboxd CSV, or Trakt JSON. Your data remains fully local and never leaves your browser.
                </p>

                <div 
                  className="upload-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <Upload size={40} className="icon-orange mb-3" />
                  <p className="font-semibold text-sm">Drag and drop file here, or click to browse</p>
                  <p className="text-xs text-gray mt-1">Supports .csv, .json format (Netflix, Trakt, Letterboxd)</p>
                  <input 
                    type="file" 
                    id="file-input" 
                    className="hidden" 
                    accept=".csv,.json"
                    onChange={handleFileUpload} 
                  />
                </div>

                {/* Paste Copy Fallback */}
                <div className="paste-area-section mt-4">
                  <button 
                    className="btn-text w-full text-center"
                    onClick={() => setShowPasteArea(!showPasteArea)}
                  >
                    {showPasteArea ? "Cancel Pasting" : "Or: Copy/Paste CSV Text directly"}
                  </button>

                  {showPasteArea && (
                    <div className="mt-2">
                      <textarea 
                        className="textarea-field w-full h-24"
                        placeholder='Paste CSV content here... (e.g. "Title,Date" followed by lists)'
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                      />
                      <button className="btn-primary w-full mt-2" onClick={handlePasteSubmit}>
                        Analyze Pasted History
                      </button>
                    </div>
                  )}
                </div>

                <div className="divider-or my-4">OR</div>

                <div className="mt-2 text-center">
                  <p className="text-xs text-gray mb-3">No CSV history at hand? Launch with interest DNA instead.</p>
                  <button className="btn-secondary w-full" onClick={() => setActiveTab('dna')}>
                    Configure Movie DNA Profile
                  </button>
                </div>
              </div>
            )}

            {/* Interest Clustering Tab */}
            {activeTab === 'dna' && (
              <div className="tab-pane flex flex-col h-full justify-between">
                <div>
                  <h3 className="pane-title mb-1">Create Movie DNA</h3>
                  <p className="pane-subtitle">
                    Seed recommendations by choosing visual vibes and manual Anchor Titles.
                  </p>

                  {/* Seed Anchor Search */}
                  <div className="anchor-search-section mb-4">
                    <label className="text-xs font-semibold text-gray uppercase block mb-1">1. Add Anchor Titles (Max 3)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="input-field pl-9 pr-4"
                        placeholder="Search blockbuster movies (e.g., Inception, Interstellar...)"
                        value={anchorSearch}
                        onChange={(e) => setAnchorSearch(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 text-gray" size={16} />
                    </div>

                    {/* Autocomplete list */}
                    {searchResults.length > 0 && (
                      <div className="search-autocomplete glass">
                        {searchResults.map(item => (
                          <div 
                            key={item.id} 
                            className="autocomplete-item"
                            onClick={() => handleAddAnchor(item)}
                          >
                            <span className="font-semibold text-sm">{item.title}</span>
                            <span className="text-xs text-gray block">{item.genres.join(', ')} ({item.year})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected anchors lists */}
                    {selectedAnchors.length > 0 && (
                      <div className="selected-anchors-row mt-2 flex flex-wrap gap-2">
                        {selectedAnchors.map(item => (
                          <span key={item.id} className="anchor-badge glass">
                            {item.title}
                            <button className="remove-anchor" onClick={() => handleRemoveAnchor(item.id)}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DNA Vibes Selector Grid */}
                  <label className="text-xs font-semibold text-gray uppercase block mb-2">2. Map DNA Vibe Weights</label>
                  <div className="vibe-cluster-grid">
                    {vibeMetadata.map(v => {
                      const isActive = selectedVibes[v.key];
                      return (
                        <div 
                          key={v.key}
                          className={`vibe-card ${isActive ? 'active' : ''}`}
                          onClick={() => toggleVibe(v.key)}
                          style={{ '--active-gradient': v.gradient }}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">{v.name}</span>
                            {isActive && <Check size={14} className="text-orange" />}
                          </div>
                          <p className="text-xs text-gray leading-tight mb-2">{v.desc}</p>
                          
                          {isActive && (
                            <div className="intensity-control mt-2" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between text-xxs text-gray mb-1">
                                <span>Intensity</span>
                                <span>{vibeIntensities[v.key] * 10}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={vibeIntensities[v.key]}
                                onChange={(e) => handleIntensityChange(v.key, e.target.value)}
                                className="vibe-slider"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  onClick={handleDNAClose}
                >
                  <Compass size={16} />
                  Assemble Profile & Generate Matches
                </button>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
