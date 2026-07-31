import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react"

const DESKTOP_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)"
const TEXT_TARGET_SELECTOR = "p, span, a, button, label, h1, h2, h3, h4, h5, h6, small, strong, em, li, dt, dd, figcaption, blockquote"
const CLICKABLE_TARGET_SELECTOR = "a, button, input, textarea, select, label, summary, [role='button'], [role='link'], [data-clickable='true']"
const HERO_TARGET_SELECTOR = "#me"

function isTrackablePointer(pointerType) {
  return pointerType !== "touch"
}

const DefaultCursorSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ transform: "scale(0.5) rotate(-22deg)", transformOrigin: "50% 50%" }}>
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="black" />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="white"
          strokeWidth={2.25825} />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export function SmoothCursor({
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  }
}) {
  const magnifierSize = 90
  const magnifierScale = 1.6
  const lastMousePos = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastUpdateTime = useRef(Date.now())
  const previousAngle = useRef(0)
  const accumulatedRotation = useRef(0)
  const magnifierContentRef = useRef(null)
  const magnifierTargetRef = useRef(null)
  const isClickableHoverRef = useRef(false)
  const isHeroHoverRef = useRef(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [isClickableHover, setIsClickableHover] = useState(false)
  const [isHeroHover, setIsHeroHover] = useState(false)

  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  })
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY)

    const updateEnabled = () => {
      const nextIsEnabled = mediaQuery.matches
      setIsEnabled(nextIsEnabled)

      if (!nextIsEnabled) {
        setIsVisible(false)
      }
    }

    updateEnabled()
    mediaQuery.addEventListener("change", updateEnabled)

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled)
    };
  }, [])

  useEffect(() => {
    const root = document.documentElement

    if (isEnabled) {
      root.classList.add("smooth-cursor-active")
    } else {
      root.classList.remove("smooth-cursor-active")
    }

    return () => {
      root.classList.remove("smooth-cursor-active")
    }
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    let timeout = null

    const updateVelocity = (currentPos) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastUpdateTime.current

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        }
      }

      lastUpdateTime.current = currentTime
      lastMousePos.current = currentPos
    }

    const smoothPointerMove = (e) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }

      const target = e.target
      const textTarget = target ? target.closest(TEXT_TARGET_SELECTOR) : null
      const clickableTarget = target ? target.closest(CLICKABLE_TARGET_SELECTOR) : null
      const heroTarget = target ? target.closest(HERO_TARGET_SELECTOR) : null
      const nextIsClickableHover = Boolean(
        clickableTarget &&
        !clickableTarget.hasAttribute("disabled") &&
        clickableTarget.getAttribute("aria-disabled") !== "true"
      )
      const nextIsHeroHover = Boolean(heroTarget)

      if (nextIsClickableHover !== isClickableHoverRef.current) {
        isClickableHoverRef.current = nextIsClickableHover
        setIsClickableHover(nextIsClickableHover)
      }

      if (nextIsHeroHover !== isHeroHoverRef.current) {
        isHeroHoverRef.current = nextIsHeroHover
        setIsHeroHover(nextIsHeroHover)
      }

      setIsVisible(true)

      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)

      if (magnifierContentRef.current) {
        magnifierContentRef.current.style.transform =
          `translate(${-currentPos.x * (magnifierScale - 1)}px, ${-currentPos.y * (magnifierScale - 1)}px) scale(${magnifierScale})`
      }

      if (textTarget && magnifierContentRef.current) {
        if (magnifierTargetRef.current !== textTarget) {
          magnifierTargetRef.current = textTarget
          magnifierContentRef.current.innerHTML = ""
          const clone = textTarget.cloneNode(true)
          clone.style.position = "absolute"
          clone.style.margin = "0"
          clone.style.pointerEvents = "none"
          magnifierContentRef.current.appendChild(clone)
        }

        const clone = magnifierContentRef.current.firstElementChild
        if (clone) {
          const rect = textTarget.getBoundingClientRect()
          clone.style.left = `${rect.left}px`
          clone.style.top = `${rect.top}px`
        }
      } else if (magnifierTargetRef.current) {
        magnifierTargetRef.current = null
        if (magnifierContentRef.current) {
          magnifierContentRef.current.innerHTML = ""
        }
      }

      const speed = Math.sqrt(Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2))

      cursorX.set(currentPos.x)
      cursorY.set(currentPos.y)

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90

        let angleDiff = currentAngle - previousAngle.current
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        accumulatedRotation.current += angleDiff
        rotation.set(accumulatedRotation.current)
        previousAngle.current = currentAngle

        scale.set(0.95)

        if (timeout !== null) {
          clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
          scale.set(1)
        }, 150)
      }
    }

    let rafId = 0
    const throttledPointerMove = (e) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }

      if (rafId) return

      rafId = requestAnimationFrame(() => {
        smoothPointerMove(e)
        rafId = 0
      })
    }

    document.body.style.cursor = "none"
    window.addEventListener("pointermove", throttledPointerMove, {
      passive: true,
    })

    return () => {
      window.removeEventListener("pointermove", throttledPointerMove)
      document.body.style.cursor = "auto"
      if (rafId) cancelAnimationFrame(rafId)
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    };
  }, [cursorX, cursorY, rotation, scale, isEnabled])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const handlePointerDown = (e) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }
      setIsPointerDown(true)
    }

    const handlePointerUp = (e) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }
      setIsPointerDown(false)
    }

    const handleWindowBlur = () => {
      setIsPointerDown(false)
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    window.addEventListener("pointercancel", handlePointerUp, { passive: true })
    window.addEventListener("blur", handleWindowBlur)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
      window.removeEventListener("blur", handleWindowBlur)
    }
  }, [isEnabled])

  if (!isEnabled) {
    return null
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: 0,
        scale: 0.9,
        zIndex: 9999,
        pointerEvents: "none",
        willChange: "transform",
        opacity: isVisible ? 1 : 0,
      }}
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{
        duration: 0.15,
      }}>
      <DefaultCursorSVG />
    </motion.div>
  );
}
