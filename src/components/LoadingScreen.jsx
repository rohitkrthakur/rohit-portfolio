import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    // Assets to preload
    const assets = [
      '/photos/Ai-Stock.png',
      '/photos/Bulksender.png',
      '/photos/Zero-Trace.png',
      '/photos/Tracura.png',
      '/photos/rakesh2.png',
    ];

    let loadedCount = 0;
    const totalAssets = assets.length;

    // Use a GSAP object to animate the percentage smoothly
    const progressObj = { value: 0 };
    
    const updateProgress = () => {
      loadedCount++;
      const target = (loadedCount / totalAssets) * 100;
      
      gsap.to(progressObj, {
        value: target,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          setProgress(Math.round(progressObj.value));
          if (progressObj.value >= 100) {
            handleComplete();
          }
        }
      });
    };

    const handleComplete = () => {
      if (!isLoaded) {
        setIsLoaded(true);
        // Small delay to let user see 100%
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };

    if (totalAssets === 0) {
      updateProgress();
    } else {
      assets.forEach((src) => {
        if (src.endsWith('.mp4')) {
          const video = document.createElement('video');
          video.src = src;
          video.preload = 'auto';
          video.onloadeddata = updateProgress;
          video.onerror = updateProgress; // Continue even on error
        } else {
          const img = new Image();
          img.src = src;
          img.onload = updateProgress;
          img.onerror = updateProgress;
        }
      });
    }

    // Safety fallback: if loading takes more than 10 seconds, force complete
    const fallbackTimer = setTimeout(() => {
      gsap.to(progressObj, {
        value: 100,
        duration: 1,
        onUpdate: () => setProgress(Math.round(progressObj.value)),
        onComplete: handleComplete
      });
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [onComplete, isLoaded]);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col justify-end p-6 sm:p-10 pointer-events-none cursor-none"
      key="loading-screen"
      initial={{ y: 0 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Large Counter Right Aligned */}
      <div className="flex justify-end items-end w-full leading-none">
        <h1 
          ref={counterRef}
          className="text-white font-black tracking-tighter"
          style={{ 
            fontSize: 'clamp(80px, 22vw, 250px)',
            marginRight: '0', 
            marginBottom: '0'
          }}
        >
          {progress}
        </h1>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
