import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = '#fff',
  itemHeightClassName = 'h-[16vh] md:h-[18vh] lg:h-[20vh]',
  autoItemHeight = false
}) {
  const itemHeightStyle =
    autoItemHeight && items.length > 0
      ? { height: `${100 / items.length}%` }
      : undefined;

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}>
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            itemHeightClassName={itemHeightClassName}
            itemHeightStyle={itemHeightStyle}
            isFirst={idx === 0} />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({
  text,
  marqueeText,
  images = [],
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  itemHeightClassName,
  itemHeightStyle,
  isFirst
}) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(6);

  const animationDefaults = { duration: 1.05, ease: 'expo' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 4;
      setRepetitions(Math.max(6, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, marqueeText]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      gsap.set(marqueeInnerRef.current, { x: 0, force3D: true });
      animationRef.current = gsap.fromTo(marqueeInnerRef.current, {
        x: 0
      }, {
        x: -Math.ceil(contentWidth),
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, marqueeText, repetitions, speed]);

  const handleMouseEnter = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const clientX = ev.clientX ?? (ev.touches && ev.touches[0].clientX) ?? 0;
    const clientY = ev.clientY ?? (ev.touches && ev.touches[0].clientY) ?? 0;
    
    // Safely check for edge
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;
    const edge = findClosestEdge(xPos, yPos, rect.width, rect.height);
    
    if (itemLabelRef.current) {
      gsap.to(itemLabelRef.current, { color: '#FFFFFF', duration: 0.28, ease: 'power2.out' });
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const clientX = ev.clientX ?? (ev.changedTouches && ev.changedTouches[0]?.clientX) ?? 0;
    const clientY = ev.clientY ?? (ev.changedTouches && ev.changedTouches[0]?.clientY) ?? 0;
    
    // Safely check for edge
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;
    const edge = findClosestEdge(xPos, yPos, rect.width, rect.height);
    
    if (itemLabelRef.current) {
      gsap.to(itemLabelRef.current, { color: textColor, duration: 0.32, ease: 'power2.out' });
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const hoverText = marqueeText || text;
  const itemLabelRef = useRef(null);
  const marqueeTokens = hoverText
    .split('|')
    .map(token => token.trim())
    .filter(Boolean);
  const displayImage = images[0] || '/profile.png';

  return (
    <div
      className={`flex-none relative overflow-hidden cursor-default ${itemHeightClassName}`}
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      style={{
        borderTop: isFirst ? 'none' : `1px solid ${borderColor}`,
        ...itemHeightStyle
      }}>
      <div
        ref={itemLabelRef}
        className="flex items-center justify-between h-full relative cursor-default select-none uppercase font-bold text-[clamp(1.6rem,8vw,3rem)] md:text-[5.6vh] tracking-tight px-6 md:px-10 lg:px-14"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}>
        <span className="text-left leading-none whitespace-nowrap">{text}</span>
        <div className="hidden md:flex items-center justify-end w-[28vw] max-w-[520px] min-w-[260px] h-[68%] overflow-hidden rounded-2xl border border-white/15 bg-black/10">
          <div className="h-full w-full p-2">
            <img
              src={displayImage}
              alt={`${text} milestone`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}>
        <div className="h-full w-fit flex" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div
              className="marquee-part flex items-center flex-shrink-0 gap-[3.2vw] px-[3.2vw]"
              key={idx}
              style={{ color: marqueeTextColor }}>
              {marqueeTokens.map((token, tokenIdx) => {
                const isStarToken = token === '✦';
                return (
                  <span
                    key={`${token}-${tokenIdx}`}
                    className={`whitespace-nowrap uppercase font-semibold leading-[1.05] ${isStarToken ? 'text-[clamp(1.4rem,8vw,3rem)] md:text-[7.6vh]' : 'text-[clamp(1.2rem,7vw,2.6rem)] md:text-[5.4vh]'}`}
                  >
                    {token}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
