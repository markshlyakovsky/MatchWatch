import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Sparkles, Star } from 'lucide-react';

export default function BottomDrawer({ 
  archetypes, 
  onSelectBackup, 
  activeHeroId 
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!archetypes || archetypes.length === 0) return null;

  // Archetype Badge styling mapping
  const getArchetypeColor = (name) => {
    switch (name) {
      case 'The Direct Line':
        return '#007aff';
      case 'The Hidden Gem':
        return '#af52de';
      case 'The Left-Field Curveball':
        return '#ff9500';
      case 'The Crowd-Pleaser':
        return '#ff2d55';
      case 'The Deep Cut':
        return '#34c759';
      default:
        return '#8e8e93';
    }
  };

  return (
    <div className={`bottom-drawer-container glass-strong ${isOpen ? 'expanded' : 'collapsed'}`}>
      
      {/* Sliding Drawer Header Trigger Handle */}
      <div 
        className="drawer-trigger flex items-center justify-between px-6 py-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="icon-orange animate-pulse" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            {isOpen ? "Hide Backup Squad" : "Show Backup Squad (5 Thematic Archetypes)"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xxs uppercase bg-white/10 px-2 py-0.5 rounded-full text-slate-400 font-semibold">
            {archetypes.length} Alternatives Loaded
          </span>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {/* Drawer Body horizontal scroll list */}
      <div className="drawer-body px-6 pb-6 overflow-hidden">
        <div className="drawer-cards-scroll flex items-stretch gap-4 overflow-x-auto py-2">
          {archetypes.map((movie) => {
            if (!movie) return null;

            const isCurrentHero = movie.id === activeHeroId;
            const archetypeColor = getArchetypeColor(movie.archetypeName);

            return (
              <div 
                key={`${movie.id}-${movie.archetypeName}`}
                className={`drawer-card glass flex flex-col justify-between cursor-pointer transition-all duration-300 ${isCurrentHero ? 'active-hero-border' : ''}`}
                onClick={() => onSelectBackup(movie)}
              >
                {/* Poster Thumbnail */}
                <div className="relative aspect-[16/9] w-full rounded-t-lg overflow-hidden group">
                  <img 
                    src={movie.backdrop} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/40 to-transparent"></div>
                  
                  {/* Archetype Badge */}
                  <span 
                    className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-lg border"
                    style={{ 
                      borderColor: archetypeColor, 
                      backgroundColor: `${archetypeColor}1a`, 
                      color: archetypeColor 
                    }}
                  >
                    {movie.archetypeName}
                  </span>

                  {/* Match score overlay badge */}
                  <span className="absolute bottom-2 right-2 text-xxs font-extrabold bg-[#ff5a36] text-white px-1.5 py-0.5 rounded">
                    {movie.matchPercentage}% Match
                  </span>
                </div>

                {/* Metadata content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1 mb-0.5 uppercase tracking-wide">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xxs text-slate-400 font-semibold mb-2">
                      <span>{movie.year} • {movie.genres[0]}</span>
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Star size={10} fill="currentColor" /> {movie.rating}
                      </span>
                    </div>
                  </div>
                  
                  {/* Subtitle description detailing why this title was chosen */}
                  <p className="text-slate-400 text-[11px] leading-tight line-clamp-2 border-t border-white/5 pt-2">
                    {movie.archetypeDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
