import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SkillSection({ skillsData }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const categories = gsap.utils.toArray('.skill-category');

    categories.forEach((cat) => {
      const title = cat.querySelector('.category-title');
      const items = cat.querySelectorAll('.skill-item');

      if (!title || !items.length) return;

      gsap.set(title, { x: -50, autoAlpha: 0 });
      gsap.set(items, { y: 30, autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cat,
          start: 'top 98%',
          end: 'top 65%',
          scrub: 0.95
        }
      });

      tl.to(title, {
        x: 0,
        autoAlpha: 1,
        duration: 1.0,
        ease: 'none'
      }).to(items, {
        y: 0,
        autoAlpha: 1,
        duration: 0.95,
        stagger: 0.1,
        ease: 'none'
      }, '-=0.4');
    });

    ScrollTrigger.refresh();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full px-6 md:px-10 py-16 md:py-24 text-white">
      <div className="flex flex-col gap-16 md:gap-24">
        {skillsData.map((category, idx) => (
          <div key={idx} className="skill-category flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            {/* Left side: Category Title */}
            <div className="md:w-1/3 shrink-0">
              <h3 className="category-title text-[clamp(2rem,10vw,3.6rem)] md:text-[5rem] font-extrabold uppercase tracking-tight text-gray-300 pointer-events-auto shrink-0 select-none leading-none whitespace-nowrap">
                {category.category}
              </h3>
            </div>
            
            {/* Right side: Skills Grid/Flex */}
            <div className="md:w-2/3 flex flex-wrap gap-4 md:gap-6 pointer-events-auto">
              {category.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className="skill-item flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all rounded-lg md:rounded-xl px-3 py-2 md:px-5 md:py-3 shadow-lg"
                >
                  {item.icon && (
                    <div className="w-5 h-5 md:w-7 md:h-7 flex items-center justify-center shrink-0">
                      {React.createElement(item.icon, { size: "100%", weight: "regular", color: item.color || "#ffffff" })}
                    </div>
                  )}
                  <span className="text-sm md:text-xl font-medium tracking-wide whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
