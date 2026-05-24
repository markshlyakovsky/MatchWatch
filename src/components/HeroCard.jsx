import React, { useState } from 'react';
import { Play, CheckCircle2, RefreshCw, X, ChevronRight, MonitorPlay } from 'lucide-react';

export default function HeroCard({ 
  movie, 
  onMarkSeen, 
  onReroll, 
  isWatched 
}) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  if (!movie) {
    return (
      <div className="hero-card-empty glass flex flex-col justify-center items-center text-center p-12">
        <MonitorPlay size={48} className="icon-orange mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Assembling Recommendations...</h2>
        <p className="text-gray mt-2 text-sm max-w-xs">We are curating matches based on your interest DNA and history files.</p>
      </div>
    );
  }

  // Get matching provider badges
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'Netflix':
        return <span className="streaming-badge netflix">Netflix</span>;
      case 'Prime':
        return <span className="streaming-badge prime">Prime</span>;
      case 'Disney+':
        return <span className="streaming-badge disney">Disney+</span>;
      case 'Max':
        return <span className="streaming-badge max-go">Max</span>;
      case 'Apple TV+':
        return <span className="streaming-badge apple">Apple TV+</span>;
      case 'Hulu':
        return <span className="streaming-badge hulu">Hulu</span>;
      case 'Paramount+':
        return <span className="streaming-badge paramount">Paramount+</span>;
      case 'Peacock':
        return <span className="streaming-badge peacock">Peacock</span>;
      default:
        return <span className="streaming-badge rent">{provider}</span>;
    }
  };

  const hasTrailer = !!movie.trailerUrl;
  const matchColor = movie.matchPercentage > 85 ? '#ff5a36' : (movie.matchPercentage > 70 ? '#5856d6' : '#8e8e93');

  return (
    <div className="hero-card-container">
      {/* Background Poster/Backdrop Full-Bleed with dark gradients */}
      <div 
        className="hero-backdrop" 
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      {/* Main Metadata and Typography */}
      <div className="hero-content flex flex-col justify-end">
        {/* Match Percentage Badge */}
        <div className="match-pill mb-3 inline-flex items-center gap-1.5" style={{ '--match-border': matchColor }}>
          <span className="pulse-indicator" style={{ backgroundColor: matchColor }}></span>
          <span className="font-extrabold text-sm tracking-wider" style={{ color: matchColor }}>
            {movie.matchPercentage}% Match
          </span>
        </div>

        {/* Primary Heading */}
        <h1 className="hero-title text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase leading-none">
          {movie.title}
        </h1>

        {/* Secondary Metadata Info Row */}
        <div className="hero-meta flex flex-wrap items-center gap-3 text-xs md:text-sm font-medium text-slate-300 mb-4">
          <span className="meta-year font-bold text-white">{movie.year}</span>
          <span className="meta-separator">•</span>
          <span className="meta-runtime">{movie.runtime}</span>
          <span className="meta-separator">•</span>
          <div className="meta-genres flex items-center gap-1 flex-wrap">
            {movie.genres.map((g, idx) => (
              <span key={g} className="genre-pill-tag">
                {g}{idx < movie.genres.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
          <span className="meta-separator">•</span>
          <span className="meta-rating font-bold text-yellow-400">★ {movie.rating}</span>
        </div>

        {/* Synopsis Text Section */}
        <p className="hero-synopsis text-sm text-slate-300 leading-relaxed mb-6 max-w-2xl">
          {synopsisExpanded 
            ? movie.synopsis 
            : `${movie.synopsis.slice(0, 160)}${movie.synopsis.length > 160 ? '...' : ''}`
          }
          {movie.synopsis.length > 160 && (
            <button 
              className="text-orange ml-1 font-semibold focus:outline-none inline-flex items-center hover:underline"
              onClick={() => setSynopsisExpanded(!synopsisExpanded)}
            >
              {synopsisExpanded ? 'Show Less' : 'Read More'}
              <ChevronRight size={14} className={`transform transition-transform ${synopsisExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </p>

        {/* Primary Actions Row */}
        <div className="hero-actions flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Stream Availability providers */}
            <div className="streaming-provider-section flex flex-col gap-1.5">
              <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold">Where to watch:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {movie.streamingProviders && movie.streamingProviders.length > 0 ? (
                  movie.streamingProviders.map(p => (
                    <React.Fragment key={typeof p === 'string' ? p : p.name || 'unknown'}>{getProviderIcon(typeof p === 'string' ? p : p.name)}</React.Fragment>
                  ))
                ) : null}
                {movie.rentBuyProviders && movie.rentBuyProviders.length > 0 && (
                  <>
                    {movie.streamingProviders && movie.streamingProviders.length > 0 && (
                      <span className="text-slate-500 text-[10px] font-semibold mx-0.5">or</span>
                    )}
                    {movie.rentBuyProviders.map(store => (
                      <span key={store} className="streaming-badge rent" title={`Rent or buy on ${store}`}>
                        {store}
                      </span>
                    ))}
                  </>
                )}
                {(!movie.streamingProviders || movie.streamingProviders.length === 0) && (!movie.rentBuyProviders || movie.rentBuyProviders.length === 0) && (
                  <span className="streaming-badge rent">Not Available</span>
                )}
              </div>
            </div>

            {/* Watch Trailer CTA */}
            {hasTrailer && (
              <button 
                className="btn-trailer-trigger flex items-center gap-2"
                onClick={() => setShowTrailer(true)}
              >
                <div className="play-icon-circle">
                  <Play size={16} fill="white" />
                </div>
                <div className="text-left">
                  <span className="block text-xxs uppercase tracking-wider text-slate-400">Cinematic Clip</span>
                  <span className="font-bold text-sm text-white">Watch Trailer</span>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Reroll */}
            <button 
              className="action-icon-btn glass" 
              onClick={onReroll}
              title="Reroll this match"
            >
              <RefreshCw size={18} />
              <span>Reroll</span>
            </button>

            {/* Seen It */}
            <button 
              className={`action-icon-btn glass ${isWatched ? 'active-seen' : ''}`}
              onClick={() => onMarkSeen(movie)}
              title="Mark as watched"
            >
              <CheckCircle2 size={18} className={isWatched ? 'text-green' : ''} />
              <span>{isWatched ? 'Watched' : 'Seen It'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Immersive Trailer Popup Modal */}
      {showTrailer && hasTrailer && (
        <div className="modal-overlay z-[200]">
          <div className="video-modal-container glass max-w-4xl w-full aspect-video relative">
            <button 
              className="absolute -top-10 right-0 text-white flex items-center gap-1.5 hover:text-orange focus:outline-none"
              onClick={() => setShowTrailer(false)}
            >
              <X size={18} />
              <span className="text-sm font-bold">Close Video</span>
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${movie.trailerUrl}?autoplay=1`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl shadow-2xl"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
