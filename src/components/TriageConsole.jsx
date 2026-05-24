import React, { useState } from 'react';
import { Compass, Film, Tv, Check, Heart, Sliders, ArrowRight, HelpCircle, MessageSquare, Search, X } from 'lucide-react';

export default function TriageConsole({ 
  watchHistory, 
  onCompleteTriage 
}) {
  const [step, setStep] = useState('welcome'); // 'welcome', 'categories', 'blend-preference', 'mood-anchors', 'mood-content-type', 'mood-aspect-preference'
  
  // Triage state variables
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [blendPreference, setBlendPreference] = useState('all'); // 'all' (consolidated) or 'split' (movies from each)
  
  const [selectedAnchors, setSelectedAnchors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferredType, setPreferredType] = useState('any'); // 'any', 'movie', 'tv'
  const [aspectPreference, setAspectPreference] = useState('content'); // 'content' (thematic vibes) or 'type' (genres and pacing)

  const availableGenres = [
    "Action", "Sci-Fi", "Comedy", "Drama", "Thriller", "Horror", "Mystery", "Family", "Adventure", "Animation"
  ];

  const handleToggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      if (prev.length >= 5) {
        alert("Please select up to 5 categories.");
        return prev;
      }
      return [...prev, genre];
    });
  };

  const handleToggleAnchor = (title) => {
    setSelectedAnchors(prev => {
      if (prev.includes(title)) {
        return prev.filter(t => t !== title);
      }
      return [...prev, title];
    });
  };

  // Option A trigger
  const handleOptionA = () => {
    onCompleteTriage({
      mode: 'any'
    });
  };

  // Option B step advance
  const handleOptionBNext = () => {
    if (selectedGenres.length === 0) {
      alert("Please select at least 1 category to proceed.");
      return;
    }
    if (selectedGenres.length > 1) {
      setStep('blend-preference');
    } else {
      // 1 genre directly completes onboarding
      onCompleteTriage({
        mode: 'category',
        genres: selectedGenres,
        blend: 'single'
      });
    }
  };

  const handleOptionBComplete = (blend) => {
    onCompleteTriage({
      mode: 'category',
      genres: selectedGenres,
      blend: blend
    });
  };

  // Option C step advance
  const handleOptionCNext = () => {
    if (selectedAnchors.length < 2) {
      alert("Please select at least 2 titles from your viewing history to establish a mood profile.");
      return;
    }
    setStep('mood-content-type');
  };

  const handleOptionCAspect = (aspect) => {
    onCompleteTriage({
      mode: 'mood',
      anchors: selectedAnchors,
      contentType: preferredType,
      aspect: aspect
    });
  };

  // Seed popular history list if watch history is empty for mood C
  const getSeedingHistory = () => {
    const rawList = watchHistory && watchHistory.length > 0
      ? watchHistory.map(h => typeof h === 'string' ? h : h.cleanTitle)
      : ["Inception", "Interstellar", "Breaking Bad", "Stranger Things", "Everything Everywhere All at Once", "The Matrix"];
      
    // Exclude list of famous movies with colons to avoid stripping their subtitles
    const movieColons = ["dune: part", "glass onion", "across the spider-verse", "avatar: the last airbender", "folie à deux"];

    return rawList.map(title => {
      if (!title) return '';
      const lower = title.toLowerCase();
      
      // If it's a known movie with colon, preserve the full title
      if (movieColons.some(m => lower.includes(m))) {
        return title;
      }
      
      // Otherwise, if it has a colon, it's a TV episode/hierarchy structure. Strip it to get ONLY the show title!
      const colonIdx = title.indexOf(':');
      if (colonIdx !== -1) {
        return title.substring(0, colonIdx).trim();
      }
      
      return title;
    }).filter(Boolean);
  };

  const getFilteredSeedingHistory = () => {
    const list = getSeedingHistory();
    // Unique list to avoid duplicates in bubble grid
    const uniqueList = Array.from(new Set(list));
    
    if (!searchQuery.trim()) return uniqueList;
    
    const query = searchQuery.toLowerCase().trim();
    return uniqueList.filter(title => title.toLowerCase().includes(query));
  };

  return (
    <div className="onboarding-container max-w-2xl mx-auto my-12">
      <div className="onboarding-card glass p-8 flex flex-col justify-between min-h-[500px]">
        
        {/* STEP WELCOME (WELCOME TRIAGE HUB) */}
        {step === 'welcome' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="icon-orange" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">WatchMatch Triage Manager</span>
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase text-white tracking-tight leading-tight">What are you in the mood for tonight?</h2>
              <p className="pane-subtitle">Walk through our quick interactive questionnaire to instantly slice our databases to your exact mood.</p>
              
              <div className="flex flex-col gap-4 mt-6">
                
                {/* Option A card */}
                <div className="triage-option-card option-a group" onClick={handleOptionA}>
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-orange font-bold block mb-1">Option A</span>
                    <h3 className="font-extrabold text-white text-base">"I'm up for anything"</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Skip filters and display the absolute best algorithmic match based on all history and profile data uploaded so far.</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-orange transform transition-transform group-hover:translate-x-1" />
                </div>

                {/* Option B card */}
                <div className="triage-option-card option-b group" onClick={() => setStep('categories')}>
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-[#007aff] font-bold block mb-1">Option B</span>
                    <h3 className="font-extrabold text-white text-base">"Specific Category or Categories"</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Pick 1 to 5 genres you want to watch. Filter candidates that match them perfectly, or generate a mixed selection box.</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-[#007aff] transform transition-transform group-hover:translate-x-1" />
                </div>

                {/* Option C card */}
                <div className="triage-option-card option-c group" onClick={() => setStep('mood-anchors')}>
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-violet-400 font-bold block mb-1">Option C</span>
                    <h3 className="font-extrabold text-white text-base">"I have a mood, just not sure what to watch"</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Pick 2 or more titles you enjoyed from your history logs to seed matching algorithms, content format ratios, and pacing.</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-violet-400 transform transition-transform group-hover:translate-x-1" />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STEP B.1: CATEGORIES SELECT */}
        {step === 'categories' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="text-[#007aff]" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Option B: Category Selection</span>
              </div>
              <h2 className="text-xl font-bold mb-1 text-white">Which categories are you considering?</h2>
              <p className="pane-subtitle text-xs">Select 1 to 5 categories to align discovery lists.</p>

              {/* Navigation Controls at the Top */}
              <div className="flex gap-3 mb-6">
                <button className="btn-secondary py-1.5 text-xs flex-1" onClick={() => setStep('welcome')}>Back</button>
                <button className="btn-primary py-1.5 text-xs flex-1 flex items-center justify-center gap-1" onClick={handleOptionBNext}>
                  Continue
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-6">
                {availableGenres.map(g => {
                  const isSelected = selectedGenres.includes(g);
                  return (
                    <button 
                      key={g}
                      onClick={() => handleToggleGenre(g)}
                      className={`region-pill py-2.5 px-4 font-semibold text-xs flex items-center gap-1.5 transition-all ${isSelected ? 'active text-white border-blue-500 bg-blue-500/10' : ''}`}
                    >
                      {isSelected && <Check size={12} className="text-[#007aff]" />}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP B.2: CATEGORY BLEND PREFERENCE */}
        {step === 'blend-preference' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="text-[#007aff]" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Option B: Blending Preference</span>
              </div>
              <h2 className="text-xl font-bold mb-1 text-white">How should we blend your selected categories?</h2>
              <p className="pane-subtitle text-xs">You selected: {selectedGenres.join(', ')}.</p>

              {/* Navigation Controls at the Top */}
              <div className="flex gap-3 mb-6">
                <button className="btn-secondary py-1.5 text-xs w-24" onClick={() => setStep('categories')}>Back</button>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div 
                  className="triage-option-card option-b group"
                  onClick={() => handleOptionBComplete('all')}
                >
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-[#007aff] font-bold block mb-1">Method 1</span>
                    <h4 className="font-extrabold text-white text-base">Consolidated Core Match</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Discover a masterwork that merges ALL or as many of your selected categories as possible into a single experience.</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-[#007aff] transform transition-transform group-hover:translate-x-1" />
                </div>

                <div 
                  className="triage-option-card option-b group"
                  onClick={() => handleOptionBComplete('split')}
                >
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-[#007aff] font-bold block mb-1">Method 2</span>
                    <h4 className="font-extrabold text-white text-base">Mixed Selection Portfolio</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Keep categories distinct. The backup squad drawer will display targeted matches selected from each category individually.</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-[#007aff] transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP C.1: SELECT SEEN ANCHORS */}
        {step === 'mood-anchors' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="text-violet-400" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Option C: Seeding Anchors</span>
              </div>
              <h2 className="text-xl font-bold mb-1 text-white">Which titles enjoy your high-rating?</h2>
              <p className="pane-subtitle text-xs">Select 2 or more titles you liked from your viewing log to establish a mood vector.</p>

              {/* Navigation Controls at the Top */}
              <div className="flex gap-3 mb-4">
                <button className="btn-secondary py-1.5 text-xs flex-1" onClick={() => { setSearchQuery(''); setStep('welcome'); }}>Back</button>
                <button className="btn-primary py-1.5 text-xs flex-1 flex items-center justify-center gap-1" onClick={handleOptionCNext}>
                  Continue
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Selected Anchors inline list */}
              {selectedAnchors.length > 0 && (
                <div className="selected-anchors-row flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/5 text-left transition-all duration-300">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider w-full mb-1" style={{ letterSpacing: '0.5px' }}>Selected Anchors ({selectedAnchors.length}):</span>
                  {selectedAnchors.map(title => (
                    <span 
                      key={title} 
                      className="anchor-badge active cursor-pointer flex items-center gap-1.5 py-1 px-2.5 text-xxs font-semibold rounded-lg text-white hover:bg-violet-500/30 transition-all duration-200"
                      onClick={() => handleToggleAnchor(title)}
                      style={{ background: 'rgba(175, 82, 222, 0.15)', borderColor: 'rgba(175, 82, 222, 0.5)' }}
                    >
                      <Check size={10} className="text-violet-400" />
                      {title}
                      <X size={10} className="text-slate-400 hover:text-white ml-1 flex-shrink-0" />
                    </span>
                  ))}
                </div>
              )}

              {/* Sleek Glass Search Bar */}
              <div className="relative mt-4 mb-3">
                <input
                  type="text"
                  className="input-field w-full pl-9 pr-8 py-2 text-xs"
                  placeholder="Search your viewing history for anchors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search size={14} />
                </span>
                {searchQuery && (
                  <button 
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                {getFilteredSeedingHistory().length === 0 ? (
                  <p className="text-xs text-slate-500 italic mt-2">No matching titles found in your viewing log.</p>
                ) : (
                  getFilteredSeedingHistory().map(title => {
                    const isSelected = selectedAnchors.includes(title);
                    return (
                      <button 
                        key={title}
                        onClick={() => handleToggleAnchor(title)}
                        className={`anchor-badge cursor-pointer flex items-center gap-1.5 transition-all text-xxs ${isSelected ? 'active' : 'text-slate-300'}`}
                      >
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <Check size={10} className="text-violet-400" style={{ color: '#af52de' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] shadow-[0_0_6px_#34c759] inline-block animate-pulse" style={{ backgroundColor: '#34c759', boxShadow: '0 0 6px #34c759' }} title="Selected"></span>
                          </div>
                        )}
                        {title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP C.2: PREFER MOVIE OR SHOW */}
        {step === 'mood-content-type' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="text-violet-400" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Option C: Format Preference</span>
              </div>
              <h2 className="text-xl font-bold mb-1 text-white">Do you prefer a movie or a TV show tonight?</h2>
              <p className="pane-subtitle text-xs">Filter content types to align recommendations pacing.</p>

              {/* Navigation Controls at the Top */}
              <div className="flex gap-3 mb-6">
                <button className="btn-secondary py-1.5 text-xs flex-1" onClick={() => setStep('mood-anchors')}>Back</button>
                <button className="btn-primary py-1.5 text-xs flex-1 flex items-center justify-center gap-1" onClick={() => setStep('mood-aspect-preference')}>
                  Continue
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button 
                  className={`platform-btn flex-col gap-2 py-5 font-bold ${preferredType === 'any' ? 'active border-violet-500' : ''}`}
                  onClick={() => setPreferredType('any')}
                  style={{ '--platform-color': '#af52de' }}
                >
                  <Compass size={24} />
                  <span>I don't mind</span>
                </button>
                <button 
                  className={`platform-btn flex-col gap-2 py-5 font-bold ${preferredType === 'movie' ? 'active border-violet-500' : ''}`}
                  onClick={() => setPreferredType('movie')}
                  style={{ '--platform-color': '#af52de' }}
                >
                  <Film size={24} />
                  <span>Movie</span>
                </button>
                <button 
                  className={`platform-btn flex-col gap-2 py-5 font-bold ${preferredType === 'tv' ? 'active border-violet-500' : ''}`}
                  onClick={() => setPreferredType('tv')}
                  style={{ '--platform-color': '#af52de' }}
                >
                  <Tv size={24} />
                  <span>TV Show</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP C.3: MOOD ASPECT PREFERENCE */}
        {step === 'mood-aspect-preference' && (
          <div className="flex flex-col justify-between h-full flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="text-violet-400" size={20} />
                <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Option C: Similarity Mode</span>
              </div>
              <h2 className="text-xl font-bold mb-1 text-white">What did you enjoy most about your seeds?</h2>
              <p className="pane-subtitle text-xs">Help us calibrate exact matching targets.</p>

              {/* Navigation Controls at the Top */}
              <div className="flex gap-3 mb-6">
                <button className="btn-secondary py-1.5 text-xs w-24" onClick={() => setStep('mood-content-type')}>Back</button>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div 
                  className="triage-option-card option-c group"
                  onClick={() => handleOptionCAspect('content')}
                >
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-violet-400 font-bold block mb-1">Method 1</span>
                    <h4 className="font-extrabold text-white text-base">The Content itself</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Find matches based on plot details, theme patterns, and emotional mood vibes vector vectors (e.g. slow-burn tension, existential dread).</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-violet-400 transform transition-transform group-hover:translate-x-1" />
                </div>

                <div 
                  className="triage-option-card option-c group"
                  onClick={() => handleOptionCAspect('type')}
                >
                  <div className="text-left flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider text-violet-400 font-bold block mb-1">Method 2</span>
                    <h4 className="font-extrabold text-white text-base">The Type & Pacing</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Find matches sharing exact category tags, global formatting structures, and rating intensity tempo (e.g. fast-paced sci-fi actions).</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-violet-400 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
