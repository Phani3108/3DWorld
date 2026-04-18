import { Canvas } from "@react-three/fiber";
// import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { useProgress } from "@react-three/drei";
import { useAtom } from "jotai";
import { useEffect, useState, useRef, Component } from "react";
import { Experience } from "./components/Experience";
import { Loader, BubblesBackground } from "./components/Loader";
import {
  SocketManager,
  socket,
  itemsAtom,
  usernameAtom,
} from "./components/SocketManager";
import { UI } from "./components/UI";
import { ActivityFeed } from "./components/ActivityFeed";
import { WelcomeModal } from "./components/WelcomeModal";
import { CharacterMenu, followedCharacterAtom } from "./components/Avatar";
import { Minimap } from "./components/Minimap";
import soundManager from "./audio/SoundManager";
import AudioSettingsPanel from "./audio/AudioSettingsPanel";
import { BulletinBoardPanel } from "./components/BulletinBoard";
import ProfileCard from "./components/ProfileCard";
import WorldMap from "./components/WorldMap";
import FoodPanel from "./components/FoodPanel";
import BazaarPanel from "./components/BazaarPanel";
import LibraryPanel from "./components/LibraryPanel";
import QuestsPanel from "./components/QuestsPanel";
import VenueInfoCard from "./components/VenueInfoCard";
import LanguageBadge from "./components/LanguageBadge";
import { HelpSheet } from "./components/HelpSheet";
import { updateProfile as apiUpdateProfile } from "./lib/api";

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ConnectionBanner = () => {
  const [connected, setConnected] = useState(socket.connected);
  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  if (connected) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
      Connection lost — reconnecting…
    </div>
  );
};

const makeFallbackUsername = (role = "human") => {
  const prefix = role === "agent" ? "Agent" : "Guest";
  return `${prefix}-${Math.random().toString(36).slice(2, 6)}`;
};

const FollowIndicator = () => {
  const [followedCharacter, setFollowedCharacter] = useAtom(followedCharacterAtom);
  if (!followedCharacter) return null;
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[35] flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-blue-400/30">
      <span className="text-sm font-medium">Following {followedCharacter.name}</span>
      <button
        onClick={() => setFollowedCharacter(null)}
        className="ml-1 bg-white/20 hover:bg-white/30 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

function App() {
  const { progress } = useProgress();
  const [loaded, setLoaded] = useState(false);
  const [username, setUsername] = useAtom(usernameAtom);
  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem("3dworld_onboarded_v2")
  );
  const [items] = useAtom(itemsAtom);
  const soundInitRef = useRef(false);

  useEffect(() => {
    const isOnboarded = localStorage.getItem("3dworld_onboarded_v2") === "1";
    const storedName = (localStorage.getItem("3dworld_username") || "").trim();
    if (!isOnboarded || storedName) return;
    const fallback = makeFallbackUsername(localStorage.getItem("3dworld_role") || "human");
    localStorage.setItem("3dworld_username", fallback);
    setUsername(fallback);
  }, [setUsername]);

  // Cleanup legacy invite-link state from previous builds.
  useEffect(() => {
    localStorage.removeItem("3dworld_pendingInvite");
    if (window.location.search.includes("invite=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (progress === 100 && items) {
      setLoaded(true); // As progress can go back to 0 when new resources are loaded, we need to make sure we don't fade out the UI when that happens
    }
  }, [progress]);

  // Initialize sound system on first user interaction (browser autoplay policy)
  useEffect(() => {
    const initSound = () => {
      if (!soundInitRef.current) {
        soundInitRef.current = true;
        soundManager.init();
        soundManager.playMusic("ambient_room");
      }
    };
    window.addEventListener("click", initSound, { once: true });
    window.addEventListener("keydown", initSound, { once: true });
    return () => {
      window.removeEventListener("click", initSound);
      window.removeEventListener("keydown", initSound);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ConnectionBanner />
      <SocketManager />
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={loaded && showWelcome ? "never" : "always"}
        camera={{
          position: [0, 8, 2],
          fov: 30,
        }}
      >
        <color attach="background" args={["#ffffff"]} />
        <Experience loaded={loaded} />
        {/* Impact badly performances without a noticeable good result */}
        {/* <EffectComposer>
          <N8AO intensity={0.42} />
        </EffectComposer> */}
      </Canvas>
      <Loader loaded={loaded} />

      {loaded && <ActivityFeed />}
      {loaded && <CharacterMenu />}
      {loaded && <FollowIndicator />}
      {loaded && <UI />}
      {loaded && <Minimap />}
      {loaded && <AudioSettingsPanel />}
      {loaded && <BulletinBoardPanel />}
      {loaded && <ProfileCard />}
      {loaded && <WorldMap />}
      {loaded && <FoodPanel />}
      {loaded && <BazaarPanel />}
      {loaded && <LibraryPanel />}
      {loaded && <QuestsPanel />}
      {loaded && <VenueInfoCard />}
      {loaded && <LanguageBadge />}
      {loaded && <HelpSheet />}
      {loaded && showWelcome && (
        <>
          <BubblesBackground />
          <WelcomeModal
            onChoice={(choice, name, extras = {}) => {
              localStorage.setItem("3dworld_role", choice);
              localStorage.setItem("3dworld_onboarded_v2", "1");
              const storedName = (localStorage.getItem("3dworld_username") || "").trim();
              const resolvedName = (name || "").trim() || storedName || makeFallbackUsername(choice);
              localStorage.setItem("3dworld_username", resolvedName);
              setUsername(resolvedName);
              setShowWelcome(false);

              // Persist profile patch (avatar/accent/bio/pronouns/homeCity/socials).
              // Fire-and-forget; UI does not block on the response.
              const userId = localStorage.getItem("3dworld_user_id");
              if (userId && extras && Object.keys(extras).length > 0) {
                apiUpdateProfile(userId, extras).catch((err) => {
                  console.warn("[profile] update failed:", err);
                });
              }
            }}
          />
        </>
      )}
    </ErrorBoundary>
  );
}

export default App;
