import React, { useState } from 'react';
import { X, Key, Globe, Film, Trash2, Check, Download, HelpCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  tmdbKey, 
  onSaveKey, 
  validateAPIKey,
  selectedPlatforms, 
  onTogglePlatform,
  region,
  onChangeRegion,
  onResetHistory,
  onExportCSV,
  onExportJSON
}) {
  const [keyInput, setKeyInput] = useState(tmdbKey || '');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleUseDemoKey = () => {
    setKeyInput("7900b46950269f88414cb35ef6b0b5cf");
    setValidationError(null);
  };

  const handleSave = async () => {
    const trimmedKey = keyInput.trim();
    if (!trimmedKey) {
      onSaveKey('');
      setSuccessMsg(true);
      setValidationError(null);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const isValid = await validateAPIKey(trimmedKey);
    setIsValidating(false);

    if (isValid) {
      onSaveKey(trimmedKey);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);
    } else {
      setValidationError("⚠️ Invalid API Key. Please verify the characters and make sure there are no trailing spaces.");
    }
  };

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

  const countries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AX', name: 'Åland Islands' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CD', name: 'Congo (DRC)' },
    { code: 'CG', name: 'Congo (Republic)' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CW', name: 'Curaçao' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FK', name: 'Falkland Islands' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GR', name: 'Greece' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GU', name: 'Guam' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'VA', name: 'Holy See' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'North Korea' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PS', name: 'Palestine' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Réunion' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BL', name: 'Saint Barthélemy' },
    { code: 'SH', name: 'Saint Helena' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'MF', name: 'Saint Martin' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SX', name: 'Sint Maarten' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'GS', name: 'South Georgia' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'UM', name: 'US Minor Outlying Islands' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VG', name: 'British Virgin Islands' },
    { code: 'VI', name: 'US Virgin Islands' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'EH', name: 'Western Sahara' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container glass">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Key className="icon-orange" size={20} />
            <h2 className="text-xl font-bold">WatchMatch Preferences</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* TMDB API Key Section */}
          <div className="settings-section">
            <div className="flex justify-between items-center mb-1">
              <h3 className="section-title">1. Global TMDB API Key (Optional)</h3>
              <button 
                type="button"
                className="text-orange text-xxs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
                onClick={() => setShowGuide(!showGuide)}
              >
                <HelpCircle size={12} />
                {showGuide ? "Hide Guide" : "Get Free Key"}
                {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
            
            <p className="section-subtitle">
              Pasting a free TMDB key replaces the local 50-movie offline database with live searches, regional streaming details, and millions of real-time recommendations. 
            </p>

            {/* Collapsible Step-by-Step Guide Accordion */}
            {showGuide && (
              <div className="glass p-3.5 my-3 rounded-lg border border-white/5 bg-white/[0.02] text-left text-xs text-slate-300 leading-normal space-y-2 animate-fadeIn" style={{ animation: 'fadeIn 0.25s ease-out' }}>
                <div className="font-bold text-white flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-orange" />
                  How to get your free key in 2 minutes:
                </div>
                <div className="space-y-1.5 ml-1 text-slate-400">
                  <p><strong>Step 1:</strong> Visit <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="link-highlight font-semibold hover:underline">themoviedb.org/signup</a> and create a free account.</p>
                  <p><strong>Step 2:</strong> Go to your profile settings, select the <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="link-highlight font-semibold hover:underline">API Settings</a> page.</p>
                  <p><strong>Step 3:</strong> Request a free "Developer" API key. Once generated, copy the **v3 API Key** and paste it below.</p>
                </div>
              </div>
            )}

            <div className="key-input-container mt-2">
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter TMDB v3 API Key..." 
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setValidationError(null);
                }}
              />
              <button 
                className="btn-primary flex items-center justify-center gap-1 min-w-[70px]" 
                onClick={handleSave}
                disabled={isValidating}
              >
                {isValidating ? (
                  <span className="inline-block w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : successMsg ? (
                  <Check size={18} />
                ) : (
                  "Save"
                )}
              </button>
            </div>

            {/* Demo Key Quick Fill helper */}
            <div className="mt-2 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Don't have an API key?</span>
              <button 
                type="button"
                className="text-violet-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-white/10 cursor-pointer"
                onClick={handleUseDemoKey}
              >
                <Sparkles size={10} className="text-violet-400" />
                Auto-fill Shared Demo Key
              </button>
            </div>

            {validationError && (
              <span className="text-red text-xs mt-2 flex items-center gap-1 font-medium" style={{ animation: 'shake 0.3s ease-in-out' }}>
                <AlertCircle size={14} className="flex-shrink-0" />
                {validationError}
              </span>
            )}
            {successMsg && (
              <span className="text-green text-xs mt-2 block font-medium">
                ✓ API Key successfully validated! Switching to Live Mode.
              </span>
            )}
          </div>

          {/* Region Picker */}
          <div className="settings-section">
            <h3 className="section-title">2. Streaming Providers Region</h3>
            <p className="section-subtitle">Specifies where to query Netflix, Prime, and Disney+ streaming locations.</p>
            <div className="relative mt-2">
              <select 
                className="input-field cursor-pointer py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white w-full"
                value={region}
                onChange={(e) => onChangeRegion(e.target.value)}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code} className="bg-[#0c0f17] text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Platforms */}
          <div className="settings-section">
            <h3 className="section-title">3. Preferred Networks (Boost Affinity)</h3>
            <p className="section-subtitle">Recommended matches from these networks will receive a +15% Match Percentage boost.</p>
            <div className="platform-grid">
              {platforms.map(p => {
                const isSelected = selectedPlatforms.includes(p.name);
                return (
                  <button 
                    key={p.name}
                    className={`platform-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => onTogglePlatform(p.name)}
                    style={{ '--platform-color': p.color }}
                  >
                    <span className="dot" style={{ backgroundColor: p.color }}></span>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backup & Save watch histories */}
          <div className="settings-section">
            <h3 className="section-title">4. Backup & Save Profile History</h3>
            <p className="section-subtitle">
              Save your consolidated watch histories (combining imported records and any marked "Seen It") directly to your local drive.
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary py-2 text-xs flex-1 flex items-center justify-center gap-1.5" onClick={onExportCSV}>
                <Download size={14} />
                Download CSV History
              </button>
              <button className="btn-secondary py-2 text-xs flex-1 flex items-center justify-center gap-1.5" onClick={onExportJSON}>
                <Download size={14} />
                Download JSON History
              </button>
            </div>
          </div>

          {/* Data Reset */}
          <div className="settings-section border-none pt-2">
            <h3 className="section-title text-red">5. Danger Zone</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="section-subtitle mb-0">Clear all imported watch histories, user ratings, and preferences.</span>
              <button className="btn-danger flex items-center gap-1" onClick={onResetHistory}>
                <Trash2 size={14} />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
