/**
 * useTMDB.js
 * Custom hook for calling TMDB API, mapping results to vibes, and fetching streaming providers.
 */
import { useState, useCallback } from 'react';
import { OFFLINE_CATALOG } from '../utils/recommender';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function useTMDB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper to perform fetch requests to TMDB.
   */
  const fetchTMDB = useCallback(async (endpoint, apiKey, params = {}) => {
    if (!apiKey) throw new Error("TMDB API Key is required.");
    
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: 'en-US',
      ...params
    });

    const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }, []);

  /**
   * Validates a TMDB API Key by making a simple request.
   */
  const validateAPIKey = useCallback(async (apiKey) => {
    if (!apiKey) return false;
    try {
      const url = `${BASE_URL}/trending/all/day?api_key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url);
      return response.ok;
    } catch (e) {
      console.error("API Key validation error:", e);
      return false;
    }
  }, []);

  /**
   * Maps TMDB genre IDs to simple UI genres.
   */
  const mapGenreIdsToNames = useCallback((genreIds) => {
    const genreMap = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
      10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
      10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
    };
    return (genreIds || []).map(id => genreMap[id] || "Drama").slice(0, 3);
  }, []);

  /**
   * Analyzes movie overview/genres to score the 6 Core DNA Vibes.
   */
  const analyzeVibes = useCallback((title, overview = '', genres = []) => {
    const text = `${title} ${overview}`.toLowerCase();
    
    const vibeKeywords = {
      mindBending: ['dream', 'reality', 'twist', 'memory', 'time travel', 'multiverse', 'puzzle', 'dimension', 'space', 'psychological', 'sci-fi', 'illusion', 'quantum', 'mystery', 'inception', 'timeline'],
      spineChilling: ['horror', 'scary', 'ghost', 'serial killer', 'creepy', 'tension', 'suspense', 'monster', 'dark', 'paranormal', 'haunted', 'blood', 'demon', 'nightmare', 'thriller'],
      actionPacked: ['action', 'explosion', 'fight', 'gun', 'car chase', 'battle', 'war', 'superhero', 'combat', 'martial arts', 'survival', 'heist', 'escape', 'stunt', 'velocity'],
      deepThoughtful: ['drama', 'existential', 'meaning', 'philosophical', 'grief', 'society', 'politics', 'history', 'slow burn', 'character study', 'love', 'corruption', 'tragedy', 'relationships'],
      laughOutLoud: ['comedy', 'hilarious', 'funny', 'laugh', 'humor', 'satire', 'parody', 'sitcom', 'absurd', 'joking', 'silly', 'wit'],
      heartWarming: ['family', 'friendship', 'wholesome', 'dog', 'inspiring', 'cute', 'uplifting', 'feel-good', 'christmas', 'children', 'comfort', 'kindness', 'triumph', 'tearjerker']
    };

    const vibes = { mindBending: 2, spineChilling: 1, actionPacked: 2, deepThoughtful: 3, laughOutLoud: 2, heartWarming: 3 };

    // Increment based on keyword counts
    Object.entries(vibeKeywords).forEach(([vibe, keywords]) => {
      let matches = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const count = (text.match(regex) || []).length;
        matches += count;
      });

      // Factor in genre boosts
      if (vibe === 'mindBending' && (genres.includes('Sci-Fi') || genres.includes('Mystery') || genres.includes('Sci-Fi & Fantasy'))) vibes[vibe] += 4;
      if (vibe === 'spineChilling' && (genres.includes('Horror') || genres.includes('Thriller'))) vibes[vibe] += 5;
      if (vibe === 'actionPacked' && (genres.includes('Action') || genres.includes('Adventure') || genres.includes('Action & Adventure'))) vibes[vibe] += 5;
      if (vibe === 'deepThoughtful' && (genres.includes('Drama') || genres.includes('Documentary') || genres.includes('History'))) vibes[vibe] += 4;
      if (vibe === 'laughOutLoud' && genres.includes('Comedy')) vibes[vibe] += 5;
      if (vibe === 'heartWarming' && (genres.includes('Family') || genres.includes('Animation'))) vibes[vibe] += 3;

      vibes[vibe] = Math.min(10, Math.max(1, vibes[vibe] + Math.min(4, matches)));
    });

    return vibes;
  }, []);

  /**
   * Search for movies/TV shows by keyword.
   */
  const searchTitles = useCallback(async (query, apiKey) => {
    if (!query) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTMDB('/search/multi', apiKey, { query });
      
      return data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(item => ({
          id: item.id,
          title: item.title || item.name,
          type: item.media_type,
          year: item.release_date ? parseInt(item.release_date.split('-')[0]) : (item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : 'N/A'),
          backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
          poster: item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=500&q=80',
          rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 7.0,
          genres: mapGenreIdsToNames(item.genre_ids),
          synopsis: item.overview || "No description available."
        }));
    } catch (e) {
      setError(e.message);
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchTMDB, mapGenreIdsToNames]);

  /**
   * Resolves trailer links and regional watch providers for a given title.
   */
  const getWatchAndTrailer = useCallback(async (id, type, apiKey, region = 'US') => {
    try {
      const endpoints = [
        fetchTMDB(`/${type}/${id}/videos`, apiKey),
        fetchTMDB(`/${type}/${id}/watch/providers`, apiKey)
      ];
      
      const [videosData, providersData] = await Promise.all(endpoints);
      
      // Extract trailer key
      const trailer = (videosData.results || []).find(
        vid => vid.site === 'YouTube' && (vid.type === 'Trailer' || vid.type === 'Teaser')
      ) || (videosData.results || [])[0];
      
      const trailerUrl = trailer ? trailer.key : '';

      // Extract regional providers
      let regionalResults = providersData.results?.[region] || {};
      
      // Fallback to US region if detected region has no streaming or digital purchase options listed in TMDB
      if (!regionalResults.flatrate && !regionalResults.ads && !regionalResults.rent && !regionalResults.buy) {
        if (region !== 'US') {
          regionalResults = providersData.results?.['US'] || {};
        }
      }

      const flatrate = regionalResults.flatrate || [];
      const ads = regionalResults.ads || [];
      const rent = regionalResults.rent || [];
      const buy = regionalResults.buy || [];

      // Normalize known streaming provider names
      const normalizeStreamingName = (name) => {
        if (name.includes('Netflix')) return 'Netflix';
        if (name.includes('Disney')) return 'Disney+';
        if (name.includes('Amazon Prime') || name.includes('Prime Video')) return 'Prime';
        if (name.includes('HBO') || name.includes('Max')) return 'Max';
        if (name.includes('Apple TV')) return 'Apple TV+';
        if (name.includes('Hulu')) return 'Hulu';
        if (name.includes('Paramount')) return 'Paramount+';
        if (name.includes('Peacock')) return 'Peacock';
        return name;
      };

      // Normalize rent/buy store names to friendly labels
      const normalizeStoreName = (name) => {
        if (name.includes('Apple TV') || name.includes('Apple iTunes') || name.includes('iTunes')) return 'Apple TV';
        if (name.includes('Google Play')) return 'Google Play';
        if (name.includes('Amazon') || name.includes('Prime Video')) return 'Amazon';
        if (name.includes('Vudu') || name.includes('Fandango')) return 'Vudu';
        if (name.includes('YouTube')) return 'YouTube';
        if (name.includes('Microsoft')) return 'Microsoft';
        return name;
      };

      // Build streaming providers list (subscription-included) — plain string array
      const streamProviders = [...flatrate, ...ads].map(p => normalizeStreamingName(p.provider_name));
      const uniqueStream = [...new Set(streamProviders)].slice(0, 3);

      // Build rent/buy providers list with actual store names — plain string array
      const rentBuyRaw = [...rent, ...buy].map(p => normalizeStoreName(p.provider_name));
      const uniqueRentBuy = [...new Set(rentBuyRaw)].filter(n => !uniqueStream.includes(n)).slice(0, 3);

      return { 
        trailerUrl, 
        streamingProviders: uniqueStream,
        rentBuyProviders: uniqueRentBuy
      };
    } catch (e) {
      console.error("Error fetching watch/trailer metadata:", e);
      return { trailerUrl: '', streamingProviders: [], rentBuyProviders: [] };
    }
  }, [fetchTMDB]);

  /**
   * Generates live recommendations based on TMDB.
   * Now extended to support triageConfig parameters.
   */
  const getLiveRecommendations = useCallback(async (
    anchors, 
    dnaSelection, 
    watchHistory, 
    preferences, 
    apiKey, 
    region = 'US', 
    triageConfig = { mode: 'any' }
  ) => {
    setLoading(true);
    setError(null);

    try {
      let recommendedIds = [];
      let seedNames = [];

      // Step 1: Find recommendations based on selected anchor titles
      // For Option C, we use the user's picked mood anchors as the TMDB seed query!
      const activeSeeds = (triageConfig.mode === 'mood' && triageConfig.anchors && triageConfig.anchors.length > 0) 
        ? triageConfig.anchors 
        : anchors;

      if (activeSeeds && activeSeeds.length > 0) {
        const seedPromises = activeSeeds.map(async (anchor) => {
          try {
            const searchResults = await fetchTMDB('/search/multi', apiKey, { query: anchor });
            const firstMatch = searchResults.results?.[0];
            if (firstMatch) {
              seedNames.push(firstMatch.title || firstMatch.name);
              const recs = await fetchTMDB(`/${firstMatch.media_type}/${firstMatch.id}/recommendations`, apiKey);
              if (recs && recs.results) {
                return recs.results.map(r => ({ ...r, seedType: firstMatch.media_type }));
              }
            }
          } catch (e) {
            console.error(`Error fetching recommendations for seed "${anchor}":`, e);
          }
          return [];
        });

        const resultsArray = await Promise.all(seedPromises);
        resultsArray.forEach(recsList => {
          recommendedIds.push(...recsList);
        });
      }

      // Step 2: Fallback to trending/popular if no anchors are found/selected
      if (recommendedIds.length === 0) {
        const trending = await fetchTMDB('/trending/all/day', apiKey);
        if (trending.results) {
          recommendedIds.push(...trending.results.map(r => ({ ...r, seedType: r.media_type || 'movie' })));
        }
      }

      // Step 3: Remove duplicate recommendations and filter out history items
      const historyTitles = watchHistory.map(h => typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase());
      const uniqueRecsMap = new Map();
      
      recommendedIds.forEach(item => {
        const title = item.title || item.name;
        if (!title) return;
        
        const cleanName = title.toLowerCase();
        if (historyTitles.includes(cleanName)) return; // skip already watched
        
        // Filter by content type preference
        const type = item.media_type || item.seedType || 'movie';
        if (preferences.contentType && preferences.contentType.length > 0 && !preferences.contentType.includes(type)) {
          return;
        }

        // Triage Option C Format restriction: Movie vs TV Show
        if (triageConfig.mode === 'mood' && triageConfig.contentType && triageConfig.contentType !== 'any') {
          if (type !== triageConfig.contentType) return;
        }

        // Triage Option B Category restriction: Must match at least one selected category
        const genresMapped = mapGenreIdsToNames(item.genre_ids);
        if (triageConfig.mode === 'category' && triageConfig.genres && triageConfig.genres.length > 0) {
          const matchesAny = genresMapped.some(g => triageConfig.genres.includes(g));
          if (!matchesAny) return;
        }

        if (!uniqueRecsMap.has(item.id)) {
          uniqueRecsMap.set(item.id, { ...item, type });
        }
      });

      const uniqueRecs = Array.from(uniqueRecsMap.values());

      // If we still have nothing, return offline database fallback
      if (uniqueRecs.length === 0) {
        console.warn("No items returned from TMDB recommendations. Falling back to offline database.");
        return null;
      }

      // Step 4: Map and score recommendations based on DNA vibes / Triage Mode
      const scoredList = uniqueRecs.map(item => {
        const title = item.title || item.name;
        const genresMapped = mapGenreIdsToNames(item.genre_ids);
        const vibes = analyzeVibes(title, item.overview || '', genresMapped);

        let finalPercentage = 50;

        // A. "I'm up for anything" Mode / Standard
        if (triageConfig.mode === 'any') {
          let score = 0;
          let weightSum = 0;
          Object.entries(dnaSelection || {}).forEach(([v, weight]) => {
            const activeWeight = typeof weight === 'boolean' ? (weight ? 10 : 0) : weight;
            if (activeWeight > 0) {
              score += (vibes[v] || 0) * activeWeight;
              weightSum += activeWeight;
            }
          });

          if (weightSum > 0) {
            finalPercentage = Math.round((score / (weightSum * 10)) * 100);
          } else {
            finalPercentage = Math.round(50 + (item.vote_average || 7.0) * 5);
          }
        }
        // B. "Specific categories" Mode
        else if (triageConfig.mode === 'category') {
          const selected = triageConfig.genres || [];
          const overlaps = genresMapped.filter(g => selected.includes(g)).length;
          
          let genreScore = 50;
          if (selected.length > 0) {
            if (triageConfig.blend === 'all') {
              genreScore = (overlaps / selected.length) * 100;
            } else {
              genreScore = overlaps > 0 ? 80 + (overlaps * 4) : 50;
            }
          }
          finalPercentage = Math.round(genreScore);
        }
        // C. "I have a mood just not sure what to watch" Mode
        else if (triageConfig.mode === 'mood') {
          const seeds = triageConfig.anchors || [];
          const aspect = triageConfig.aspect || 'content';
          
          let moodScoreSum = 0;
          let seedMatches = 0;

          // Approx paces for TMDB candidate
          const candidatePace = ((vibes.actionPacked || 0) + (vibes.spineChilling || 0)) - (vibes.deepThoughtful || 0);

          // Get seed average paces
          let seedPaceSum = 0;
          let seedPaceCount = 0;
          seeds.forEach(sTitle => {
            const sItem = OFFLINE_CATALOG.find(x => x.title.toLowerCase() === sTitle.toLowerCase());
            if (sItem) {
              seedPaceSum += (((sItem.vibes?.actionPacked || 0) + (sItem.vibes?.spineChilling || 0)) - (sItem.vibes?.deepThoughtful || 0));
              seedPaceCount++;
            }
          });
          const avgSeedPace = seedPaceCount > 0 ? (seedPaceSum / seedPaceCount) : 0;

          seeds.forEach(seedTitle => {
            const seedItem = OFFLINE_CATALOG.find(x => x.title.toLowerCase() === seedTitle.toLowerCase());
            if (seedItem) {
              seedMatches++;
              if (aspect === 'content') {
                // Plot vibe vector Dot product overlap
                let dotProduct = 0;
                let cMag = 0;
                let sMag = 0;
                Object.keys(vibes).forEach(v => {
                  const cVal = vibes[v];
                  const sVal = seedItem.vibes[v];
                  dotProduct += cVal * sVal;
                  cMag += cVal * cVal;
                  sMag += sVal * sVal;
                });
                moodScoreSum += (cMag > 0 && sMag > 0) ? (dotProduct / (Math.sqrt(cMag) * Math.sqrt(sMag))) * 100 : 0;
              } else {
                // Genres overlap + Pace Closeness
                const genreOverlap = genresMapped.filter(g => seedItem.genres.includes(g)).length;
                const genreScore = seedItem.genres.length > 0 ? (genreOverlap / seedItem.genres.length) * 100 : 0;

                const paceDiff = Math.abs(candidatePace - avgSeedPace);
                const paceScore = Math.max(0, 100 - (paceDiff * 8));
                moodScoreSum += (genreScore * 0.5) + (paceScore * 0.5);
              }
            }
          });

          if (seedMatches > 0) {
            finalPercentage = Math.round(moodScoreSum / seedMatches);
          } else {
            finalPercentage = Math.round(50 + (item.vote_average || 7.0) * 5);
          }
        }

        // Apply global popularity boosts
        finalPercentage += Math.round(((item.vote_average || 7.0) - 7.0) * 3);
        finalPercentage = Math.max(52, Math.min(99, finalPercentage));

        return {
          id: item.id,
          title,
          type: item.type,
          year: item.release_date ? parseInt(item.release_date.split('-')[0]) : (item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : 'N/A'),
          runtime: item.type === 'tv' ? 'Series' : '2h approx',
          rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 7.0,
          genres: genresMapped,
          synopsis: item.overview || "No synopsis available.",
          vibes,
          matchPercentage: finalPercentage,
          backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
          poster: item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=500&q=80'
        };
      });

      // Sort by match affinity
      scoredList.sort((a, b) => b.matchPercentage - a.matchPercentage);

      // Grab the best pick
      const bestPickCandidate = scoredList[0];

      // Fetch streaming providers and trailers for the top 6 titles asynchronously
      const topSix = scoredList.slice(0, 6);
      const detailedTopSix = await Promise.all(
        topSix.map(async (cand) => {
          const detail = await getWatchAndTrailer(cand.id, cand.type, apiKey, region);
          return { ...cand, ...detail };
        })
      );

      const bestPick = detailedTopSix[0];
      const backupCandidates = detailedTopSix.slice(1);

      // Step 5: Map into 5 Card Archetypes
      const archetypes = [];

      if (triageConfig.mode === 'category' && triageConfig.blend === 'split' && triageConfig.genres && triageConfig.genres.length > 1) {
        const selectedGenres = triageConfig.genres;
        const drawnIds = new Set([bestPick.id]);
        const drawerItems = [];

        // For each selected category, find the single best matching candidate not already selected
        selectedGenres.forEach(genre => {
          const match = backupCandidates.find(c => c.genres.includes(genre) && !drawnIds.has(c.id));
          if (match) {
            drawnIds.add(match.id);
            drawerItems.push({
              ...match,
              archetypeName: `Category: ${genre}`,
              archetypeDesc: `The top-scoring choice specifically representing the ${genre} genre.`
            });
          }
        });

        // Fill remaining drawer slots to keep exactly 5 backup cards
        let fillIdx = 0;
        while (drawerItems.length < 5 && fillIdx < backupCandidates.length) {
          const cand = backupCandidates[fillIdx];
          if (!drawnIds.has(cand.id)) {
            drawnIds.add(cand.id);
            drawerItems.push({
              ...cand,
              archetypeName: "Alternative Pick",
              archetypeDesc: "Highly recommended related genre blend choice."
            });
          }
          fillIdx++;
        }

        archetypes.push(...drawerItems.slice(0, 5));
      } else {
        // Archetype 1: The Direct Line
        if (backupCandidates[0]) {
          archetypes.push({
            ...backupCandidates[0],
            archetypeName: "The Direct Line",
            archetypeDesc: "Extremely similar thematic threads and storytelling style."
          });
        }

        // Archetype 2: The Hidden Gem (High average, slightly lower vote count)
        const gemCandidate = scoredList.slice(6).find(c => c.rating >= 7.6) || backupCandidates[1];
        if (gemCandidate) {
          const details = await getWatchAndTrailer(gemCandidate.id, gemCandidate.type, apiKey, region);
          archetypes.push({
            ...gemCandidate,
            ...details,
            archetypeName: "The Hidden Gem",
            archetypeDesc: "Highly rated but flies slightly under the mainstream radar."
          });
        }

        // Archetype 3: The Left-Field Curveball (A different genre overlap, high vibe)
        const bestGenres = bestPick ? bestPick.genres : [];
        const curveCandidate = scoredList.slice(6).find(c => c.genres.every(g => !bestGenres.includes(g))) || backupCandidates[2];
        if (curveCandidate) {
          const details = await getWatchAndTrailer(curveCandidate.id, curveCandidate.type, apiKey, region);
          archetypes.push({
            ...curveCandidate,
            ...details,
            archetypeName: "The Left-Field Curveball",
            archetypeDesc: "An unexpected genre shift with the perfect energetic vibe."
          });
        }

        // Archetype 4: The Crowd-Pleaser (Extreme ratings, very popular)
        const crowdCandidate = scoredList.slice(6).find(c => c.rating >= 8.2) || backupCandidates[3];
        if (crowdCandidate) {
          const details = await getWatchAndTrailer(crowdCandidate.id, crowdCandidate.type, apiKey, region);
          archetypes.push({
            ...crowdCandidate,
            ...details,
            archetypeName: "The Crowd-Pleaser",
            archetypeDesc: "An absolute favorite loved by reviewers and fans alike."
          });
        }

        // Archetype 5: The Deep Cut (Highly deep/thoughtful)
        const deepCandidate = scoredList.slice(6).find(c => c.vibes.deepThoughtful >= 8) || backupCandidates[4] || backupCandidates[backupCandidates.length - 1];
        if (deepCandidate) {
          const details = await getWatchAndTrailer(deepCandidate.id, deepCandidate.type, apiKey, region);
          archetypes.push({
            ...deepCandidate,
            ...details,
            archetypeName: "The Deep Cut",
            archetypeDesc: "Intense, complex storytelling that lingers long after watching."
          });
        }
      }

      return {
        bestPick,
        archetypes: archetypes.filter(Boolean)
      };

    } catch (e) {
      setError(e.message);
      console.error("TMDB Live Recommendation Failed:", e);
      return null; // Signals fallback to offline catalog in App.jsx
    } finally {
      setLoading(false);
    }
  }, [fetchTMDB, analyzeVibes, mapGenreIdsToNames, getWatchAndTrailer]);

  return {
    loading,
    error,
    searchTitles,
    getWatchAndTrailer,
    getLiveRecommendations,
    validateAPIKey
  };
}
