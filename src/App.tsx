/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { Music, Music2, Heart, MailOpen, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Autoplay prevented or missing file", e);
            setAudioError(true);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioError) {
      const timer = setTimeout(() => setAudioError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [audioError]);

  useEffect(() => {
    // Attempt autoplay on first interaction if possible
    const handleFirstClick = () => {
      if (!isPlaying && audioRef.current) {
        // We don't force play here to respect browser policies, 
        // but user will likely click to open the letter anyway.
      }
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[var(--color-espresso)]">
      {/* Background Ambience */}
      <div className="noise-overlay opacity-[0.08]" />
      <div className="vignette opacity-60" />
      
      {/* Dust Particles */}
      <DustParticles />

      {/* SVG Filters for Ink Bleed and Rough Edges */}
      <svg className="hidden outline-none">
        <filter id="ink-bleed">
          {/* Subtle displacement for rough ink edges */}
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" result="displaced" />
          
          {/* Micro-texture within the ink to simulate paper fiber interaction */}
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" result="fiberNoise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" in="fiberNoise" result="lightFiber" />
          <feComposite operator="out" in="displaced" in2="lightFiber" result="faintlyTexturedInk" />
          
          <feMerge>
            <feMergeNode in="faintlyTexturedInk" />
          </feMerge>
        </filter>
        <filter id="rough-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </svg>

      {/* Audio Error Hint */}
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-wax-red px-4 py-2 rounded-sm border border-gold/40 shadow-xl"
          >
            <p className="text-parchment-light font-typewriter text-[10px] uppercase tracking-widest whitespace-nowrap">
              Melody not found. Please upload song.mp3
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef} 
        src="/song.mp3" 
        loop 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />

      {/* Audio Control (Gramophone Inspired) */}
      <div className="fixed top-6 right-6 sm:top-12 sm:right-12 z-50 flex flex-col items-center gap-1 sm:gap-2 opacity-60">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(112, 66, 20, 0.15)" }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleAudio}
          className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-sepia rounded-full flex items-center justify-center cursor-pointer transition-colors bg-parchment-light/5 shadow-inner"
          id="audio-toggle"
        >
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <Music className={`w-5 h-5 sm:w-6 sm:h-6 ${isPlaying ? 'text-sepia fill-sepia/20' : 'text-sepia/30'}`} />
          </motion.div>
        </motion.button>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-sepia font-bold">
          {isPlaying ? "Melody: On" : "Melody: Off"}
        </span>
      </div>

      {/* Decoration: Bottom Right Flourish (SVG) */}
      <div className="fixed bottom-0 right-0 opacity-10 pointer-events-none z-10 translate-x-1/4 translate-y-1/4">
        <svg width="300" height="300" viewBox="0 0 100 100" className="fill-gold">
          <path d="M10,50 Q25,25 50,50 T90,50 Q105,75 50,90 T0,50" fill="none" stroke="currentColor" strokeWidth="0.2"/>
        </svg>
      </div>

      {/* Main Content Container */}
      <main className="relative z-30 w-full h-full flex items-center justify-center px-4 sm:px-0">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)", y: -40 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm sm:max-w-md aspect-[3/2] cursor-pointer group"
              onClick={() => {
                setIsOpen(true);
                if (!isPlaying && audioRef.current) {
                  audioRef.current.play().catch(() => {});
                }
              }}
              id="envelope-container"
            >
              {/* The Envelope Card */}
              <div className="relative w-full h-full bg-[var(--color-parchment-light)] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),inset_0_0_80px_rgba(112,66,20,0.1)] rounded-sm border border-sepia/20 overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10">
                
                {/* Decorative Ribbon (Virtual) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-sepia/5 z-0" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[2px] bg-sepia/5 z-0" />

                {/* Corner Ornaments */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-gold/30 rounded-tl-sm" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-gold/30 rounded-tr-sm" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-gold/30 rounded-bl-sm" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-gold/30 rounded-br-sm" />

                <div className="flex flex-col items-center gap-6 sm:gap-8 relative z-10">
                  <div className="space-y-2 text-center">
                    <p className="text-sepia/40 text-[9px] sm:text-[10px] tracking-[0.5em] uppercase font-bold italic animate-pulse">
                      A Secret Preserved
                    </p>
                    <h1 className="text-4xl sm:text-6xl font-hand text-espresso">To You...</h1>
                  </div>

                  {/* Wax Seal with Drip Effect */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-wax-red/20 blur-md rounded-full" />
                    <motion.div 
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-wax-red rounded-full flex items-center justify-center shadow-lg transform rotate-12 transition-transform duration-700 group-hover:rotate-0 border border-gold/40 relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-parchment-light text-xl sm:text-2xl font-bold tracking-tighter drop-shadow-sm">F.V.</span>
                    </motion.div>
                  </div>

                  <div className="font-typewriter text-[8px] sm:text-[9px] uppercase tracking-[0.4em] text-sepia/40 mt-4">
                    Tap to open the letter
                  </div>
                </div>

                {/* Texture Layer */}
                <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full max-w-[92vw] sm:max-w-[800px] h-auto sm:h-[600px] aspect-auto sm:aspect-[4/3] bg-[var(--color-parchment-light)] shadow-2xl rounded-sm p-8 sm:p-16 border border-gold/20 flex flex-col items-center justify-center overflow-hidden"
              id="letter-body"
              style={{ filter: "url(#rough-edge)" }}
            >
              {/* Letter Heading Meta */}
              <div className="absolute top-4 left-0 w-full text-center sm:top-10">
                 <p className="font-typewriter text-[8px] sm:text-[10px] uppercase tracking-[0.5em] text-sepia/40">
                  EST. 1967 • INTIMATE RECORDS
                </p>
              </div>

              <div className="text-center space-y-8 sm:space-y-12 max-w-xl relative z-10 ink-texture pt-4 sm:pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sepia/40 text-[9px] sm:text-xs tracking-[0.6em] uppercase font-bold italic opacity-60">The Vow</p>
                  <h1 className="text-5xl sm:text-7xl md:text-8xl leading-tight text-espresso tracking-[-0.03em] font-black uppercase drop-shadow-sm ink-shadow mb-4">
                    I LOVE YOU
                  </h1>
                </div>

                <div className="relative py-4 sm:py-8">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-16 h-[1px] bg-gold opacity-30"></div>
                  <div className="px-4 writing-rhythm ink-press-area">
                    <div className="text-2xl sm:text-4xl italic text-sepia/90 font-hand leading-relaxed script-glow">
                      &ldquo;And if it&rsquo;s quite alright, <br/> 
                      <span className="text-3xl sm:text-5xl font-script text-espresso not-italic inline-block mt-4 sm:mt-6 rotate-[-1deg] ink-shadow">I need you, baby</span>&rdquo;
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-16 h-[1px] bg-gold opacity-30"></div>
                </div>

                <div className="pt-4 sm:pt-8 flex flex-col items-center gap-4 sm:gap-6">
                  <p className="text-base sm:text-xl text-sepia/80 tracking-wide max-w-xs sm:max-w-md mx-auto leading-relaxed font-script opacity-80">
                    To warm a lonely night, <br className="sm:hidden" /> I pray you&rsquo;ll let me love you.
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 sm:mt-6">
                     <div className="h-[0.5px] w-12 sm:w-20 bg-sepia/15" />
                     <Heart className="w-5 h-5 sm:w-7 h-7 text-wax-red/30 fill-wax-red/5 stroke-[0.5]" />
                     <div className="h-[0.5px] w-12 sm:w-20 bg-sepia/15" />
                  </div>
                </div>
              </div>

              {/* Texture Layers */}
              <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
              
              {/* Floating Dust (More intense over the open letter) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gold/5 to-transparent z-0" />

              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 sm:top-8 sm:left-8 opacity-20 hover:opacity-100 transition-all p-2 z-50 rounded-full hover:bg-parchment-dark/10"
                title="Seal Letter"
              >
                <MailOpen className="w-4 h-4 sm:w-5 sm:h-5 text-sepia" />
              </button>

              {/* Bottom Stamp */}
              <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 opacity-30 transform -rotate-12 select-none pointer-events-none">
                 <div className="border-2 border-sepia px-2 py-1 rounded text-[10px] sm:text-xs font-typewriter text-sepia uppercase tracking-widest">
                   Verified 1967
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile-Friendly Footer */}
      <footer className="fixed bottom-4 sm:bottom-6 w-full text-center z-40">
        <p className="font-typewriter text-[7px] sm:text-[9px] uppercase tracking-[0.3em] text-gold/60 sm:text-sepia/60 bg-espresso/40 backdrop-blur-[2px] py-1 inline-block px-4 rounded-full">
          Modern Digital Relic &bull; Forever Yours
        </p>
      </footer>
    </div>
  );
}

function DustParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/20 rounded-full blur-[1px]"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.4, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
