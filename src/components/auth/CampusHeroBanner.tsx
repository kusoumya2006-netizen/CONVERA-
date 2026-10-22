import React, { useState } from 'react';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import { MapPin, Building2, ExternalLink } from 'lucide-react';

export const CampusHeroBanner: React.FC = () => {
  const [imgSrc, setImgSrc] = useState<string>(svceEntranceImg);

  const handleImageError = () => {
    // Graceful fallback to public asset path or Wikimedia CDN if bundler path fails
    if (imgSrc !== '/assets/svce-entrance.jpg') {
      setImgSrc('/assets/svce-entrance.jpg');
    } else {
      setImgSrc('https://commons.wikimedia.org/wiki/Special:FilePath/SVCE%20entrance%20close%20up.jpg?width=1800');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl group">
      {/* Responsive Cover Image */}
      <div className="relative w-full h-52 sm:h-60 overflow-hidden">
        <img
          src={imgSrc}
          onError={handleImageError}
          alt="Sri Venkateswara College of Engineering (SVCE) main entrance, Sriperumbudur"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="eager"
        />

        {/* Subtle Dark Graphite & Silver Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/85 text-amber-400 border border-amber-500/30 backdrop-blur-sm shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            THE REAL-WORLD CONTEXT
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-sm">
            <Building2 className="w-3 h-3 text-slate-400" />
            AICTE PID: 1-4328901
          </span>
        </div>

        {/* Hero Narrative Overlay Text */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug drop-shadow-md">
            Every institution has a story.
            <br />
            <span className="text-slate-200 font-normal">Every case deserves connected context.</span>
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Sri Venkateswara College of Engineering (SVCE) · Sriperumbudur</span>
          </div>
        </div>
      </div>

      {/* Attribution Footer */}
      <div className="px-3.5 py-2 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <span className="truncate">
          PHOTO: PLANEMAD / WIKIMEDIA COMMONS
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 underline decoration-slate-600 transition-colors inline-flex items-center gap-0.5"
            title="Creative Commons Attribution-ShareAlike 3.0 Unported"
          >
            <span>CC BY-SA 3.0</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a
            href="https://commons.wikimedia.org/wiki/File:SVCE_entrance_close_up.jpg"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 underline decoration-slate-600 transition-colors"
          >
            Source File
          </a>
        </div>
      </div>
    </div>
  );
};
