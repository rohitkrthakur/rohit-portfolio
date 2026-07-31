import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const StickyCard = ({ i, item, progress, range, targetScale }) => {
  const container = useRef(null);

  const scale = useTransform(progress, range, [1, targetScale]);
  const opacity = useTransform(progress, range, [1, 1]);
  const y = useTransform(progress, range, [0, -40]);

  const Icon = item.icon;

  return (
    <div
      ref={container}
      className="sticky top-[20vh] flex items-center justify-center"
    >
      <motion.div
        style={{
          scale,
          opacity,
          y,
          top: `${i * 20}px`,
          backgroundColor: item.color ?? "#120F17",
        }}
        className="
          relative
          flex
          min-h-[85vh]
          w-[100vw]
          origin-top
          flex-col
          justify-between
          overflow-hidden
          rounded-t-[40px]
          rounded-b-none
          border
          border-[#2A2433]
          p-10
          text-white
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        "
      >
        <div className="flex h-full w-full items-center justify-between gap-10">

          {/* LEFT CONTENT */}
          <div className="max-w-2xl z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {item.label}
            </p>

            <h3 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
              {item.title}
            </h3>

            <p className="mt-5 text-base leading-relaxed text-white/75 md:text-xl">
              {item.description}
            </p>

            {item.features && item.features.length > 0 && (
              <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-white/70 md:text-base">
                {item.features.map((feature, idx) => (
                  <li key={idx} className="mb-1">
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {item.stack && item.stack.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {item.stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="
                      rounded-full
                      bg-white/10
                      px-3
                      py-1
                      text-xs
                      font-medium
                      tracking-widest
                      text-white/90
                      backdrop-blur-sm
                    "
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="
                  mt-8
                  inline-flex
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-bold
                  tracking-wide
                  text-black
                  transition-colors
                  hover:bg-gray-200
                "
              >
                View on GitHub
              </a>
            ) : null}
          </div>

          {/* RIGHT ICON */}
          <div className="hidden lg:flex flex-1 items-center justify-end pr-10">
            <div
              className="
      relative
      flex
      h-[320px]
      w-[320px]
      items-center
      justify-center
      rounded-[42px]
      border
      border-white/10
      bg-white/[0.03]
      backdrop-blur-md
      shadow-[0_0_80px_rgba(255,255,255,0.04)]
    "
            >
              {/* glow */}
              <div
                className="
        absolute
        inset-0
        rounded-[42px]
        bg-gradient-to-br
        from-white/[0.03]
        to-transparent
        pointer-events-none
      "
              />

              {Icon && (
                <Icon
                  size={170}
                  weight="thin"
                  className="
          text-[white]
          drop-shadow-[0_0_25px_rgba(183,175,255,0.25)]
        "
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-white/10" />
      </motion.div>
    </div>
  );
};

const ScrollStack = ({ items }) => {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={container}
      className="
        relative
        flex
        w-full
        flex-col
        items-center
        justify-center
        pt-[20vh]
      "
    >
      {items.map((item, i) => {
        const targetScale = 1 - (items.length - i - 1) * 0.04;

        return (
          <StickyCard
            key={i}
            i={i}
            item={item}
            progress={scrollYProgress}
            range={[i * 0.2, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
};

export default ScrollStack;