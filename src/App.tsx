import { useEffect, useRef, useState, type CSSProperties } from "react";
import leftSectionImage from "./public/images/budol-shop-bg.jpeg";
import rightSectionImage from "./public/images/budol-shop-bg.jpeg";
import heroVideo from "./public/videos/Budol.mp4";

type RippleParticle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  cx: number;
  cy: number;
};

export default function App() {
  const [phase, setPhase] = useState<"idle" | "breaking" | "sliding" | "dropping" | "settled" | "closing" | "rising">(
    "idle",
  );
  const [ripples, setRipples] = useState<RippleParticle[]>([]);
  const [buttonGlow, setButtonGlow] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);
  const slideTimerRef = useRef<number | null>(null);
  const postSlideTimerRef = useRef<number | null>(null);
  const shellRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rippleTimerRef = useRef<number | null>(null);
  const glowTimerRef = useRef<number | null>(null);
  const rippleIdRef = useRef(0);

  const spawnRipple = () => {
    const shell = shellRef.current;
    const textEl = textRef.current;
    const buttonEl = buttonRef.current;

    if (!shell || !textEl || !buttonEl) return;

    const shellRect = shell.getBoundingClientRect();
    const textRect = textEl.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();

    const startX = textRect.left - shellRect.left + textRect.width * 0.5 + (Math.random() * 18 - 9);
    const startY = textRect.top - shellRect.top + textRect.height * 0.5 + (Math.random() * 10 - 5);
    const targetX = buttonRect.left - shellRect.left + buttonRect.width * 0.5;
    const targetY = buttonRect.top - shellRect.top + buttonRect.height * 0.5;
    const travelX = targetX - startX;
    const travelY = targetY - startY;
    const travelDistance = Math.hypot(travelX, travelY) || 1;
    const normalX = -travelY / travelDistance;
    const normalY = travelX / travelDistance;
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const curveStrength = travelDistance * (isMobile ? 0.22 : 0.14) * (0.8 + Math.random() * 0.6);
    const curveDrop = isMobile ? 4 + Math.random() * 4 : 0;
    const curveX = startX + travelX * 0.52 + normalX * curveStrength;
    const curveY = startY + travelY * 0.52 + Math.abs(normalY) * curveStrength + curveDrop;

    const id = rippleIdRef.current++;
    const ripple: RippleParticle = {
      id,
      x: startX,
      y: startY,
      dx: targetX - startX,
      dy: targetY - startY,
      cx: curveX - startX,
      cy: curveY - startY,
    };

    setRipples((current) => [...current, ripple]);

    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== id));
    }, 1400);
  };

  const handlePlay = () => {
    if (phase !== "idle") return;

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    }

    setVideoComplete(false);
    setPhase("breaking");
    if (slideTimerRef.current !== null) {
      window.clearTimeout(slideTimerRef.current);
    }

    slideTimerRef.current = window.setTimeout(() => {
      setPhase("sliding");
    }, 240);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (phase === "sliding") {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    }

    if (phase === "idle") {
      video.pause();
      video.currentTime = 0;
    }
  }, [phase]);

  useEffect(() => {
    if (postSlideTimerRef.current !== null) {
      window.clearTimeout(postSlideTimerRef.current);
      postSlideTimerRef.current = null;
    }

    if (phase === "sliding") {
      postSlideTimerRef.current = window.setTimeout(() => {
        setPhase("dropping");
      }, 2500);
    }

    if (phase === "dropping") {
      postSlideTimerRef.current = window.setTimeout(() => {
        setPhase("settled");
      }, 760);
    }

    if (phase === "closing") {
      postSlideTimerRef.current = window.setTimeout(() => {
        setPhase("rising");
      }, 2200);
    }

    if (phase === "rising") {
      postSlideTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
        setVideoComplete(false);
      }, 640);
    }

    return () => {
      if (postSlideTimerRef.current !== null) {
        window.clearTimeout(postSlideTimerRef.current);
        postSlideTimerRef.current = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (slideTimerRef.current !== null) {
        window.clearTimeout(slideTimerRef.current);
      }
      if (postSlideTimerRef.current !== null) {
        window.clearTimeout(postSlideTimerRef.current);
      }
      if (rippleTimerRef.current !== null) {
        window.clearInterval(rippleTimerRef.current);
      }
      if (glowTimerRef.current !== null) {
        window.clearTimeout(glowTimerRef.current);
      }
    };
  }, []);

  const startRippleStream = () => {
    if (rippleTimerRef.current !== null) return;

    if (glowTimerRef.current !== null) {
      window.clearTimeout(glowTimerRef.current);
      glowTimerRef.current = null;
    }
    setButtonGlow(true);
    spawnRipple();
    rippleTimerRef.current = window.setInterval(() => {
      spawnRipple();
    }, 190);
  };

  const stopRippleStream = () => {
    if (rippleTimerRef.current !== null) {
      window.clearInterval(rippleTimerRef.current);
      rippleTimerRef.current = null;
    }

    if (glowTimerRef.current !== null) {
      window.clearTimeout(glowTimerRef.current);
    }
    glowTimerRef.current = window.setTimeout(() => {
      setButtonGlow(false);
    }, 520);
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setVideoComplete(true);
    setPhase("closing");
  };

  return (
    <main className={`app-shell is-${phase}${videoComplete ? " is-video-complete" : ""}`} ref={shellRef}>
      <section
        className="app-section app-section-left"
        style={{
          backgroundImage: `url(${leftSectionImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="left-copy">
          <p className="left-kicker red">Coming Soon....</p>
          <h1>Budol.Shop</h1>
          <p className="left-subtitle">Pinaka mabilis, pinaka madali</p>
          <p className="left-cta">
            <button
              type="button"
              className="left-highlight"
              onClick={handlePlay}
              onMouseEnter={startRippleStream}
              onMouseLeave={stopRippleStream}
              ref={textRef}
              aria-label="Open slider"
            >
              Isang click lng.
            </button>
          </p>
        </div>
      </section>
      <section
        className="app-section app-section-right"
        style={{
          backgroundImage: `url(${rightSectionImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <aside className="left-story" aria-label="Shopping message">
          <p className="left-story-question">
            Why search four different apps when you can just search the best of them?
          </p>
          <p className="left-story-body">
            We are not a new app. Not a new store. Not another confusing marketplace. We are just a massive cheat code
            to make your online shopping 100x easier.
          </p>
          <p className="left-story-body">Think of us as your personal AI shopper for the ultimate sulit finds.</p>
          <p className="left-story-signoff">Don’t shop harder. Shop smarter.</p>
          <p className="left-story-tag">All the budol, none of the noise.</p>
        </aside>
      </section>
      <div className="ripple-layer" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple-particle"
            style={
              {
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                "--dx": `${ripple.dx}px`,
                "--dy": `${ripple.dy}px`,
                "--cx": `${ripple.cx}px`,
                "--cy": `${ripple.cy}px`,
                "--size": "74px",
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="app-center-control" aria-hidden="true">
        <button
          type="button"
          className={`play-button${buttonGlow ? " is-glowing" : ""}`}
          aria-label="Play"
          onClick={handlePlay}
          ref={buttonRef}
        >
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </button>
      </div>
      <div className="app-background" aria-hidden="true">
        <video className="app-background-video" ref={videoRef} playsInline preload="auto" onEnded={handleVideoEnded}>
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>
    </main>
  );
}
