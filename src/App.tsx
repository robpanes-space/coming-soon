import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import leftSectionImage from "./public/images/budol-shop-bg.jpeg";
import rightSectionImage from "./public/images/budol-shop-bg.jpeg";
import heroVideo from "./public/videos/Budol.mp4";

type Phase = "idle" | "breaking" | "sliding" | "dropping" | "settled" | "closing" | "rising";

const clearTimer = (timerRef: MutableRefObject<number | null>) => {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [videoComplete, setVideoComplete] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  const leftSectionStyle: CSSProperties = {
    backgroundImage: `url(${leftSectionImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "cover",
  };

  const rightSectionStyle: CSSProperties = {
    backgroundImage: `url(${rightSectionImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "cover",
  };

  const handlePlay = () => {
    if (phase !== "idle") return;

    setVideoRequested(true);
    setVideoComplete(false);
    setPhase("breaking");
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }

    setVideoComplete(true);
    setPhase("closing");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (phase === "idle") {
      video.pause();
      video.currentTime = 0;
      return;
    }

    if (phase === "sliding") {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
      return () => {
        video.pause();
      };
    }

    if (phase === "closing" || phase === "rising") {
      video.pause();
    }
  }, [phase]);

  useEffect(() => {
    clearTimer(phaseTimerRef);

    if (phase === "breaking") {
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase("sliding");
      }, 240);
      return () => {
        clearTimer(phaseTimerRef);
      };
    }

    if (phase === "sliding") {
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase("dropping");
      }, 2500);
      return () => {
        clearTimer(phaseTimerRef);
      };
    }

    if (phase === "dropping") {
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase("settled");
      }, 760);
      return () => {
        clearTimer(phaseTimerRef);
      };
    }

    if (phase === "closing") {
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase("rising");
      }, 2200);
      return () => {
        clearTimer(phaseTimerRef);
      };
    }

    if (phase === "rising") {
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
        setVideoComplete(false);
      }, 640);
      return () => {
        clearTimer(phaseTimerRef);
      };
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      clearTimer(phaseTimerRef);
    };
  }, []);

  return (
    <main className={`app-shell is-${phase}${videoComplete ? " is-video-complete" : ""}`}>
      <section className="app-section app-section-left" style={leftSectionStyle}>
        <div className="left-copy">
          <p className="left-kicker red">Coming Soon....</p>
          <h1>Budol.Shop</h1>
          <p className="left-subtitle">Pinaka mabilis, pinaka madali</p>
          <p className="left-cta">
            <button type="button" className="left-highlight" onClick={handlePlay} aria-label="Open slider">
              Isang click lng.
            </button>
          </p>
        </div>
      </section>

      <section className="app-section app-section-right" style={rightSectionStyle}>
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
          <p className="left-cta">
            <button type="button" className="left-highlight" onClick={handlePlay} aria-label="Open slider">
              Play video to find out more
            </button>
          </p>
        </aside>
      </section>

      <div className="app-center-control" aria-hidden="true">
        <button type="button" className="play-button" aria-label="Watch video" onClick={handlePlay}>
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </button>
      </div>

      <div className="app-background" aria-hidden="true">
        <video
          className="app-background-video"
          ref={videoRef}
          playsInline
          preload="none"
          poster={leftSectionImage}
          onEnded={handleVideoEnded}
        >
          {videoRequested ? <source src={heroVideo} type="video/mp4" /> : null}
        </video>
      </div>
    </main>
  );
}
