import React, { useState } from 'react';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import { MapPin, Building2, ExternalLink } from 'lucide-react';

export const CampusHeroBanner: React.FC = () => {
  const [imgSrc, setImgSrc] = useState<string>(svceEntranceImg);

  const handleImageError = () => {
    if (imgSrc !== '/assets/svce-entrance.jpg') {
      setImgSrc('/assets/svce-entrance.jpg');
    } else {
      setImgSrc('https://commons.wikimedia.org/wiki/Special:FilePath/SVCE%20entrance%20close%20up.jpg?width=1800');
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#272D35] bg-[#0B0D10] shadow-xl group">
      {/* Responsive Cover Image */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          src={imgSrc}
          onError={handleImageError}
          alt="Sri Venkateswara College of Engineering (SVCE) main entrance, Sriperumbudur"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="eager"
        />

        {/* Subtle Dark Graphite & Silver Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/60 to-transparent" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#08090B]/85 text-[#A3B86C] border border-[#A3B86C]/30 backdrop-blur-sm shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#69C9A0] animate-pulse" />
            REAL-WORLD CONTEXT
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#08090B]/80 text-[#E8EAED] border border-[#272D35] backdrop-blur-sm">
            <Building2 className="w-3 h-3 text-[#A0A7B2]" />
            AICTE PID: 1-4328901
          </span>
        </div>

        {/* Hero Narrative Overlay Text */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-[#E8EAED] tracking-tight leading-snug drop-shadow-md">
            Every institution has a story.
            <br />
            <span className="text-[#A0A7B2] font-normal">Every case deserves connected intelligence.</span>
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A0A7B2] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#A3B86C] shrink-0" />
            <span className="truncate">Sri Venkateswara College of Engineering (SVCE) · Sriperumbudur</span>
          </div>
        </div>
      </div>

      {/* Attribution Footer */}
      <div className="px-3.5 py-1.5 bg-[#0B0D10] border-t border-[#272D35] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#737D8B] font-mono">
        <span className="truncate">
          PHOTO: PLANEMAD / WIKIMEDIA COMMONS
        </span>
        <div className="flex items-center gap-2 text-[#737D8B]">
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#A3B86C] underline decoration-[#272D35] transition-colors inline-flex items-center gap-0.5"
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
            className="hover:text-[#E8EAED] underline decoration-[#272D35] transition-colors"
          >
            Source File
          </a>
        </div>
      </div>
    </div>
  );
};
