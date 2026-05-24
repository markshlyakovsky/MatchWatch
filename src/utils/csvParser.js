/**
 * csvParser.js
 * Ingestion and sanitization pipeline for watch history files (CSV/JSON/XML).
 */

/**
 * Strips episode titles, season markers, and release years to return clean movie/show names.
 * Example: "Stranger Things: Season 3: Chapter 6: E Pluribus Unum" -> "Stranger Things"
 * Example: "Breaking Bad: Season 5: Felina" -> "Breaking Bad"
 * Example: "The Matrix (1999)" -> "The Matrix"
 */
export function cleanTitle(title) {
  if (!title) return '';
  
  // Decode double quotes if any
  let clean = title.replace(/^"|"$/g, '').trim();

  // Pattern 1: Strip standard Netflix television hierarchy
  // e.g., "Show Name: Season 1: Episode Title" or "Show Name: Limited Series: Episode"
  const netflixSeriesRegex = /^(.*?):\s*(Season\s+\d+|Series\s+\d+|Part\s+\d+|Volume\s+\d+|Chapter\s+\d+|Book\s+\d+|Limited Series|Miniseries|Specials)/i;
  const match = clean.match(netflixSeriesRegex);
  if (match && match[1]) {
    clean = match[1];
  }

  // Pattern 2: Strip generic colon patterns for episodes if it matches a typical long string
  // e.g. "Show Name: Episode Name" where it's 3 parts
  const parts = clean.split(':');
  if (parts.length > 2) {
    // If we have "Name: Subtitle: Subtitle2", take the first segment if it's substantial
    clean = parts[0].trim();
  }

  // Pattern 3: Strip movie release years (e.g. "The Matrix (1999)" -> "The Matrix")
  clean = clean.replace(/\s*\(\d{4}\)$/, '');

  return clean.trim();
}

/**
 * Simple robust CSV string parser that handles quotes and commas correctly.
 */
export function parseCSV(csvText) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF after CR
      }
      currentLine.push(currentVal.trim());
      if (currentLine.length > 0 && currentLine.some(val => val !== '')) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  
  // Push remaining
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal.trim());
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Detects import format (Netflix, Trakt, Letterboxd) and returns standardized entries:
 * { originalTitle: string, cleanTitle: string, date: string, type: 'movie' | 'tv' | 'unknown' }
 */
export function parseWatchHistory(fileContent, fileName = '') {
  const nameLower = fileName.toLowerCase();
  
  // Handle JSON format
  if (nameLower.endsWith('.json') || fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(fileContent);
      const rawItems = Array.isArray(parsed) ? parsed : (parsed.movies || parsed.shows || parsed.history || []);
      
      const standardizedItems = [];

      rawItems.forEach(item => {
        // --- FORMAT 1: Trakt/Plex Detailed Episode/Show Watch Event ---
        if (item.type === 'episode' && item.show) {
          const showTitle = item.show.title || '';
          const ep = item.episode || {};
          const epTitle = ep.title ? `: ${ep.title}` : '';
          const seasonText = ep.season !== undefined ? `: Season ${ep.season}` : '';
          
          standardizedItems.push({
            originalTitle: `${showTitle}${seasonText}${epTitle}`,
            cleanTitle: showTitle,
            date: item.watched_at || item.date || new Date().toISOString().split('T')[0],
            type: 'tv'
          });
        }
        // --- FORMAT 2: Trakt/Plex Aggregate Show plays/seasons summary ---
        else if (item.show && Array.isArray(item.seasons)) {
          const showTitle = item.show.title || '';
          item.seasons.forEach(season => {
            const seasonNum = season.number;
            if (Array.isArray(season.episodes)) {
              season.episodes.forEach(episode => {
                standardizedItems.push({
                  originalTitle: `${showTitle}: Season ${seasonNum}: Episode ${episode.number}`,
                  cleanTitle: showTitle,
                  date: episode.last_watched_at || item.last_watched_at || new Date().toISOString().split('T')[0],
                  type: 'tv'
                });
              });
            } else {
              // Standardized season fallback if no episodes array is defined
              standardizedItems.push({
                originalTitle: `${showTitle}: Season ${seasonNum}`,
                cleanTitle: showTitle,
                date: item.last_watched_at || new Date().toISOString().split('T')[0],
                type: 'tv'
              });
            }
          });
        }
        // --- FORMAT 1/2: Trakt/Plex Movie Watch or Summary ---
        else if (item.movie) {
          const movieTitle = item.movie.title || '';
          standardizedItems.push({
            originalTitle: movieTitle,
            cleanTitle: movieTitle,
            date: item.watched_at || item.last_watched_at || item.date || new Date().toISOString().split('T')[0],
            type: 'movie'
          });
        }
        // --- STANDARD FORMAT: Flat JSON array fallback ---
        else {
          const rawTitle = item.title || item.name || item.movie_title || item.show_title || '';
          if (rawTitle) {
            standardizedItems.push({
              originalTitle: rawTitle,
              cleanTitle: cleanTitle(rawTitle),
              date: item.date || item.watched_at || new Date().toISOString().split('T')[0],
              type: item.type || (item.season !== undefined ? 'tv' : 'unknown')
            });
          }
        }
      });

      return standardizedItems.filter(item => item.cleanTitle !== '');
    } catch (e) {
      console.error('Failed to parse history as JSON:', e);
    }
  }

  // Otherwise treat as CSV
  const rows = parseCSV(fileContent);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().replace(/["']/g, '').trim());
  const dataRows = rows.slice(1);

  // Column Index Mapping
  let titleIdx = -1;
  let dateIdx = -1;
  let typeIdx = -1;
  let format = 'unknown';

  // Netflix Format: "Title", "Date"
  if (headers.includes('title') && headers.includes('date')) {
    titleIdx = headers.indexOf('title');
    dateIdx = headers.indexOf('date');
    format = 'netflix';
  } 
  // Letterboxd Format: "Date", "Name", "Year", "Letterboxd URI"
  else if (headers.includes('name') && headers.includes('date')) {
    titleIdx = headers.indexOf('name');
    dateIdx = headers.indexOf('date');
    format = 'letterboxd';
  }
  // Trakt Format: "Title", "Year", "Watched At", "Type"
  else if (headers.includes('watched at') || headers.includes('watched_at')) {
    titleIdx = headers.indexOf('title');
    dateIdx = headers.includes('watched at') !== -1 ? headers.indexOf('watched at') : headers.indexOf('watched_at');
    typeIdx = headers.indexOf('type');
    format = 'trakt';
  }
  // Fallback default: find columns by position
  else {
    titleIdx = 0; // Assume first column is title
    dateIdx = headers.length > 1 ? 1 : 0; // Assume second is date
  }

  return dataRows.map(row => {
    const rawTitle = row[titleIdx] || '';
    if (!rawTitle) return null;

    const cleaned = cleanTitle(rawTitle);
    const rawDate = row[dateIdx] || '';
    const rawType = typeIdx !== -1 ? row[typeIdx] : 'unknown';

    // Figure out type based on cleanTitle difference or headers
    let itemType = 'unknown';
    if (rawType.toLowerCase() === 'movie' || rawType.toLowerCase() === 'show' || rawType.toLowerCase() === 'episode') {
      itemType = rawType.toLowerCase() === 'episode' ? 'tv' : rawType.toLowerCase();
    } else if (format === 'netflix') {
      // If original title contains markers like "Season" or "Episode" or "Chapter", it's TV
      itemType = /Season|Series|Part|Volume|Chapter|Episode|Limited Series/i.test(rawTitle) ? 'tv' : 'movie';
    } else if (format === 'letterboxd') {
      itemType = 'movie'; // Letterboxd is exclusively movies
    }

    let finalCleaned = cleaned;
    if (itemType === 'tv') {
      const colonIdx = finalCleaned.indexOf(':');
      if (colonIdx !== -1) {
        finalCleaned = finalCleaned.substring(0, colonIdx).trim();
      }
    }

    return {
      originalTitle: rawTitle,
      cleanTitle: finalCleaned,
      date: rawDate,
      type: itemType
    };
  }).filter(item => item !== null && item.cleanTitle !== '');
}
