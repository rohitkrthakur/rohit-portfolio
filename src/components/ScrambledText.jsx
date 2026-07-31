import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const paragraph = rootRef.current.querySelector('p');
    if (!paragraph) return;

    const split = SplitText.create(paragraph, {
      type: 'words, chars',
      charsClass: 'inline-block will-change-transform',
      wordsClass: 'inline-block whitespace-nowrap'
    });

    split.chars.forEach(charEl => {
      gsap.set(charEl, { attr: { 'data-content': charEl.innerHTML } });
    });

    const handleMove = e => {
      split.chars.forEach(charEl => {
        const { left, top, width, height } = charEl.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(charEl, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: charEl.dataset.content || '',
              chars: scrambleChars,
              speed
            },
            ease: 'none'
          });
        }
      });
    };

    const el = rootRef.current;
    el.addEventListener('pointermove', handleMove);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div
      ref={rootRef}
      className={`max-w-[1000px] text-black ${className}`}
      style={style}
    >
      <p>{children}</p>
    </div>
  );
};

export default ScrambledText;
