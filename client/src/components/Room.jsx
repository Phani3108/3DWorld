import {
  Grid,
  Html,
  useCursor,
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import { atom, useAtom } from "jotai";
import React, { Suspense, useEffect, useMemo, useRef, useState, Component } from "react";
import { useGrid } from "../hooks/useGrid";
import { Avatar } from "./Avatar";
import { TownHall } from "./TownHall";
import { Apartment } from "./Apartment";
import { ShopBuilding } from "./ShopBuilding";
import { SmallBuilding } from "./SmallBuilding";
import { Skyscraper } from "./Skyscraper";
import { BulletinBoard } from "./BulletinBoard";
import { showRoomSelectorAtom } from "./UI";
import { Landmark } from "./landmarks/Landmark";
import { Prop } from "./props/Prop";
import { cityAtom, venuesInCityAtom, currentVenueAtom } from "./SocketManager";

class AvatarErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("Avatar failed to load:", err?.message);
    if (typeof this.props.onError === "function") {
      this.props.onError(err);
    }
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
import { Item } from "./Item";
import { ProximityItem } from "./ProximityItem";
import { charactersAtom, mapAtom, socket, userAtom, htmlVisibleSetAtom, itemsAtom } from "./SocketManager";
import {
  buildModeAtom,
  draggedItemAtom,
  draggedItemRotationAtom,
  shopModeAtom,
  selectedShopItemAtom,
} from "./UI";
import soundManager from "../audio/SoundManager";

export const roomItemsAtom = atom([]);

const MAX_RENDERED_AVATARS = 150;
const LOCAL_FALLBACK_AVATAR_URL = "/models/sillyNubCat.glb";

const CharacterList = React.memo(() => {
  const [characters] = useAtom(charactersAtom);
  const [user] = useAtom(userAtom);
  const [htmlVisibleSet, setHtmlVisibleSet] = useAtom(htmlVisibleSetAtom);

  const handleAvatarLoadError = (character) => {
    if (!character) return;
    const localUserId = localStorage.getItem("3dworld_user_id");
    const isLocalCharacter = character.id === user || (localUserId && character.userId === localUserId);
    if (!isLocalCharacter) return;
    const currentUrl = (character.avatarUrl || "").split("?")[0];
    if (currentUrl === LOCAL_FALLBACK_AVATAR_URL) return;
    localStorage.setItem("avatarURL", LOCAL_FALLBACK_AVATAR_URL);
    localStorage.removeItem("3dworld_avatar_chosen");
    socket.emit("characterAvatarUpdate", LOCAL_FALLBACK_AVATAR_URL);
  };

  const nearestCharacters = useMemo(() => {
    const currentUser = characters.find((c) => c.id === user);
    const userPos = currentUser?.position || [0, 0];

    const distanceSq = (pos) => {
      const dx = pos[0] - userPos[0];
      const dy = pos[1] - userPos[1];
      return dx * dx + dy * dy;
    };

    const others = characters.filter((c) => c.id !== user);

    others.sort((a, b) => {
      // Non-bot players first, then by distance
      if (a.isBot !== b.isBot) return a.isBot ? 1 : -1;
      return distanceSq(a.position) - distanceSq(b.position);
    });

    const capped = others.slice(0, MAX_RENDERED_AVATARS - (currentUser ? 1 : 0));

    // Always include the current user at the front
    if (currentUser) {
      capped.unshift(currentUser);
    }

    return capped;
  }, [characters, user]);

  // Compute nearest 20 IDs for HTML overlay rendering (Task 3)
  useEffect(() => {
    // nearestCharacters is already sorted by distance (user first, then by proximity)
    // Take the first 20 (user + nearest 19 others)
    const nearest20 = new Set();
    const limit = Math.min(20, nearestCharacters.length);
    for (let i = 0; i < limit; i++) {
      nearest20.add(nearestCharacters[i].id);
    }
    setHtmlVisibleSet(nearest20);
  }, [nearestCharacters, setHtmlVisibleSet]);

  return (
    <>
      {nearestCharacters.map((character) => (
        <AvatarErrorBoundary
          key={`${character.id}-${character.avatarUrl || ""}`}
          onError={() => handleAvatarLoadError(character)}
        >
          <Suspense>
            <Avatar
              id={character.id}
              userId={character.userId}
              gridPosition={character.position}
              hairColor={character.hairColor}
              topColor={character.topColor}
              bottomColor={character.bottomColor}
              avatarUrl={character.avatarUrl}
              name={character.name}
              isBot={character.isBot}
              leaving={character.leaving}
              showHtmlOverlay={htmlVisibleSet.has(character.id)}
              vehicleId={character.vehicleId}
              expertise={character.expertise}
            />
          </Suspense>
        </AvatarErrorBoundary>
      ))}
    </>
  );
});

export const Room = () => {
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);
  const [map] = useAtom(mapAtom);
  const [items, setItems] = useAtom(roomItemsAtom);
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  const { vector3ToGrid, gridToVector3 } = useGrid();

  const scene = useThree((state) => state.scene);
  const [user] = useAtom(userAtom);
  const [, setShowRoomSelector] = useAtom(showRoomSelectorAtom);
  const [itemsCatalog] = useAtom(itemsAtom);
  const [, setCity] = useAtom(cityAtom);
  const [venuesInCity] = useAtom(venuesInCityAtom);
  const [currentVenue] = useAtom(currentVenueAtom);

  // Phase 3: Keep `cityAtom` in sync with the current map so UI chrome
  // (WorldMap button label, city info pill, etc.) can read the city directly.
  useEffect(() => {
    if (map?.isCity && map?.cityId) {
      setCity({
        id: map.cityId,
        theme: map.theme,
        landmarks: map.landmarks,
        tagline: map.tagline,
        emoji: map.emoji,
      });
    } else {
      setCity(null);
    }
  }, [map?.isCity, map?.cityId, setCity]);

  const isCity = !!map?.isCity;
  const cityGround = map?.theme?.palette?.ground || null;

  // Track pointer position to distinguish taps from drags (mobile camera rotation)
  const pointerDownPos = useRef(null);
  const TAP_THRESHOLD = 12; // px — movement below this is treated as a tap

  useEffect(() => {
    setItems(map.items);
  }, [map]);

  const onPlaneClicked = (e) => {
    // Only respond to left-click (button 0); ignore right-click used for camera rotation
    if (e.nativeEvent?.button !== undefined && e.nativeEvent.button !== 0) return;

    // On touch/pointer devices, ignore if the pointer moved significantly (was a drag, not a tap)
    if (pointerDownPos.current) {
      const dx = (e.nativeEvent?.clientX || 0) - pointerDownPos.current.x;
      const dy = (e.nativeEvent?.clientY || 0) - pointerDownPos.current.y;
      pointerDownPos.current = null;
      if (Math.hypot(dx, dy) > TAP_THRESHOLD) return;
    }
    if (!buildMode) {
      const character = scene.getObjectByName(`character-${user}`);
      if (!character) {
        return;
      }
      socket.emit(
        "move",
        vector3ToGrid(character.position),
        vector3ToGrid(e.point)
      );
    } else {
      if (draggedItem !== null) {
        if (canDrop) {
          setItems((prev) => {
            const newItems = [...prev];
            delete newItems[draggedItem].tmp;
            newItems[draggedItem].gridPosition = vector3ToGrid(e.point);
            newItems[draggedItem].rotation = draggedItemRotation;
            return newItems;
          });
          soundManager.play("item_place");
        }
        setDraggedItem(null);
      }
    }
  };

  // Wrapper: record pointer start position, then call onPlaneClicked on pointerUp (which checks drag distance)
  const onPlanePointerDown = (e) => {
    pointerDownPos.current = {
      x: e.nativeEvent?.clientX || 0,
      y: e.nativeEvent?.clientY || 0,
    };
    // In build mode, fire immediately (drag-to-place items)
    if (buildMode) onPlaneClicked(e);
  };

  const onPlanePointerUp = (e) => {
    // In non-build mode, fire on pointerUp so we can detect drag vs tap
    if (!buildMode) onPlaneClicked(e);
  };

  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [dragPosition, setDragPosition] = useState([0, 0]);
  const [canDrop, setCanDrop] = useState(false);

  useEffect(() => {
    if (draggedItem === null) {
      setItems((prev) => prev.filter((item) => !item.tmp));
    }
  }, [draggedItem]);

  useEffect(() => {
    if (draggedItem === null) {
      // FIXED: issue with 0 being falsy
      return;
    }
    const item = items[draggedItem];
    const width =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[1]
        : item.size[0];
    const height =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[0]
        : item.size[1];

    let droppable = true;

    // check if item is in bounds
    if (
      dragPosition[0] < 0 ||
      dragPosition[0] + width > map.size[0] * map.gridDivision
    ) {
      droppable = false;
    }
    if (
      dragPosition[1] < 0 ||
      dragPosition[1] + height > map.size[1] * map.gridDivision
    ) {
      droppable = false;
    }
    // check if item is not colliding with other items
    if (!item.walkable && !item.wall) {
      items.forEach((otherItem, idx) => {
        // ignore self
        if (idx === draggedItem) {
          return;
        }

        // ignore wall & floor
        if (otherItem.walkable || otherItem.wall) {
          return;
        }

        // check item overlap
        const otherWidth =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[1]
            : otherItem.size[0];
        const otherHeight =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[0]
            : otherItem.size[1];
        if (
          dragPosition[0] < otherItem.gridPosition[0] + otherWidth &&
          dragPosition[0] + width > otherItem.gridPosition[0] &&
          dragPosition[1] < otherItem.gridPosition[1] + otherHeight &&
          dragPosition[1] + height > otherItem.gridPosition[1]
        ) {
          droppable = false;
        }
      });
    }

    setCanDrop(droppable);
  }, [dragPosition, draggedItem, items, draggedItemRotation]);

  useEffect(() => {
    if (buildMode) {
      setItems(map?.items || []);
    } else {
      socket.emit("itemsUpdate", items);
    }
  }, [buildMode]);

  const [selectedShopItem, setSelectedShopItem] = useAtom(selectedShopItemAtom);

  const onItemSelected = (item) => {
    setShopMode(false);

    setItems((prev) => [
      ...prev,
      {
        ...item,
        gridPosition: [0, 0],
        tmp: true,
      },
    ]);
    setDraggedItem(items.length);
    setDraggedItemRotation(item.rotation || 0);
  };

  // Watch for item selections from the HTML shop panel
  useEffect(() => {
    if (selectedShopItem) {
      onItemSelected(selectedShopItem);
      setSelectedShopItem(null);
    }
  }, [selectedShopItem]);

  return (
    <>
      {/* City sky tint — overrides App.jsx's default white background */}
      {isCity && map?.theme?.palette?.sky && (
        <color attach="background" args={[map.theme.palette.sky]} />
      )}

      {buildMode &&
        items.map((item, idx) => (
          <Item
            key={`${item.name}-${idx}`}
            item={item}
            onClick={() => {
              setDraggedItem((prev) => {
                if (prev === null) soundManager.play("item_pickup");
                return prev === null ? idx : prev;
              });
              setDraggedItemRotation(item.rotation || 0);
            }}
            isDragging={draggedItem === idx}
            dragPosition={dragPosition}
            dragRotation={draggedItemRotation}
            canDrop={canDrop}
          />
        ))}
      {!buildMode &&
        map.items.map((item, idx) => {
          const def = itemsCatalog?.[item.name];
          const isSittable = def && def.sittable;
          return (
            <ProximityItem
              key={`${item.name}-${idx}`}
              gridPosition={item.gridPosition}
              size={item.size}
              rotation={item.rotation || 0}
            >
              <Item
                item={item}
                onSitClick={isSittable ? () => socket.emit("sit", idx) : undefined}
              />
            </ProximityItem>
          );
        })}

      {buildMode && (
        <mesh
          rotation-x={-Math.PI / 2}
          position-y={-0.002}
          onPointerDown={onPlanePointerDown}
          onPointerUp={onPlanePointerUp}
          onPointerEnter={() => setOnFloor(true)}
          onPointerLeave={() => setOnFloor(false)}
          onPointerMove={(e) => {
            const newPosition = vector3ToGrid(e.point);
            if (
              !dragPosition ||
              newPosition[0] !== dragPosition[0] ||
              newPosition[1] !== dragPosition[1]
            ) {
              setDragPosition(newPosition);
            }
          }}
          position-x={map.size[0] / 2}
          position-z={map.size[1] / 2}
          receiveShadow
        >
          <planeGeometry args={map.size} />
          <meshStandardMaterial color="#7a7a7a" />
        </mesh>
      )}
      {buildMode && (
        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      )}
      {!buildMode && <CharacterList />}

      {/* === CITY SURROUNDINGS (large plaza rooms) === */}
      {/* Ground plane + interactive labels: only when NOT building */}
      {!buildMode && !shopMode && map.size[0] > 30 && (
        <group>
          <mesh
            rotation-x={-Math.PI / 2}
            position-y={-0.01}
            position-x={map.size[0] / 2}
            position-z={map.size[1] / 2}
            receiveShadow
            onPointerDown={onPlanePointerDown}
            onPointerUp={onPlanePointerUp}
            onPointerEnter={() => setOnFloor(true)}
            onPointerLeave={() => setOnFloor(false)}
          >
            <planeGeometry args={map.size} />
            <meshStandardMaterial color={cityGround || "#7a7a7a"} />
          </mesh>

          {/* Plaza buildings — shown for the original plaza only, not for cities */}
          {!isCity && (
            <>
              <group
                position={[7, 0, map.size[1] / 2]}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRoomSelector(true);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <Apartment scale={5.9} rotation-y={Math.PI / 2} />
                <Html position={[0, 4.5, 0]} center distanceFactor={20} zIndexRange={[1, 0]} style={{ pointerEvents: "none" }}>
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-amber-200 whitespace-nowrap">
                    <p className="text-sm font-bold text-amber-700 text-center">APARTMENTS</p>
                    <p className="text-[10px] text-amber-500 text-center">Click to view rooms</p>
                  </div>
                </Html>
              </group>

              {/* Town Hall - non-interactive landmark */}
              <TownHall scale={4.1} position={[map.size[0] / 2, 0, 8]} />

              {/* Bulletin Board - in front of Town Hall */}
              <BulletinBoard position={[map.size[0] / 2, 0, 12]} scale={1.8} />
            </>
          )}

          {/* City banner — floats above the spawn so arrivals instantly know where they are */}
          {isCity && (
            <Html position={[map.size[0] / 2, 5, map.size[1] / 2]} center distanceFactor={24} zIndexRange={[1, 0]} style={{ pointerEvents: "none" }}>
              <div
                className="rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md whitespace-nowrap"
                style={{
                  background: `linear-gradient(135deg, ${map?.theme?.palette?.accent}cc, #0008)`,
                  border: `1px solid ${map?.theme?.palette?.accent || "#fff"}55`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{map?.emoji || "🌍"}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{map?.cityId?.toUpperCase()}</div>
                    {map?.tagline && <div className="text-[10px] text-white/80">{map.tagline}</div>}
                  </div>
                </div>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* Plaza buildings in build mode (plaza-only) */}
      {!shopMode && !isCity && map.size[0] > 30 && (
        <group onPointerOver={null} raycast={() => null}>
          {/* Show apartment in build mode (it's rendered interactively above when not building) */}
          {buildMode && <Apartment scale={5.9} position={[7, 0, map.size[1] / 2]} rotation-y={Math.PI / 2} />}
          {buildMode && <TownHall scale={4.1} position={[map.size[0] / 2, 0, 8]} />}
          <ShopBuilding scale={5.9} position={[map.size[0] - 7, 0, map.size[1] / 2]} rotation-y={-Math.PI / 2} />
          <SmallBuilding scale={5.9} position={[11, 0, 11]} rotation-y={Math.PI * 1.5} />
          <SmallBuilding scale={5.9} position={[map.size[0] - 18, 0, 16]} rotation-y={-Math.PI / 4} />
          <Skyscraper scale={5.9} position={[map.size[0] / 2 + 14, 0, 6]} />
          <Skyscraper scale={5.9} position={[5.5, 0, 5.5]} />
          <Skyscraper scale={5.9} position={[map.size[0] - 5.5, 0, 5.5]} />
          <Skyscraper scale={5.9} position={[5.5, 0, map.size[1] - 5.5]} />
          <Skyscraper scale={5.9} position={[map.size[0] - 5.5, 0, map.size[1] - 5.5]} />
        </group>
      )}

      {/* City landmarks — rendered from the catalog footprint data */}
      {!shopMode && isCity && map.landmarks && (
        <group raycast={() => null}>
          {map.landmarks.map((lm, i) => (
            <Landmark
              key={`${lm.type}-${i}`}
              type={lm.type}
              footprint={lm.footprint}
              palette={map.theme?.palette}
              gridDivision={map.gridDivision}
            />
          ))}
        </group>
      )}

      {/* Venue floor decals — subtle tinted rectangles so you can SEE where
          to walk for a themed experience. Current venue gets a stronger tint. */}
      {!shopMode && isCity && venuesInCity && venuesInCity.length > 0 && (
        <group raycast={() => null}>
          {venuesInCity.map((v) => {
            if (!v.footprint) return null;
            const div = map.gridDivision || 2;
            const worldX = (v.footprint.x + v.footprint.w / 2);
            const worldZ = (v.footprint.z + v.footprint.d / 2);
            const worldW = v.footprint.w;
            const worldD = v.footprint.d;
            const active = currentVenue?.id === v.id;
            const color = active ? "#fbbf24" : (map?.theme?.palette?.accent || "#fb7185");
            const opacity = active ? 0.35 : 0.12;
            return (
              <mesh
                key={v.id}
                rotation-x={-Math.PI / 2}
                position={[worldX, 0.02, worldZ]}
              >
                <planeGeometry args={[worldW, worldD]} />
                <meshBasicMaterial color={color} transparent opacity={opacity} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Phase 7C.1: Venue-layout props — tables, counters, lamps, etc.
          Pulled from each venue's `layout` array (merged server-side from
          shared/venueLayouts.js). Non-interactive — pure decoration. */}
      {!shopMode && isCity && venuesInCity && venuesInCity.length > 0 && (
        <group raycast={() => null}>
          {venuesInCity.flatMap((v) =>
            (v.layout || []).map((p, i) => (
              <Prop
                key={`${v.id}:${p.prop}:${i}`}
                type={p.prop}
                gridPosition={p.grid}
                rotation={p.rotation || 0}
                accent={map?.theme?.palette?.accent || "#fb7185"}
                gridDivision={map.gridDivision || 2}
              />
            ))
          )}
        </group>
      )}

      {/* === INTERIOR ROOM (smaller generated rooms) === */}
      {!buildMode && !shopMode && map.size[0] <= 30 && (
        <group>
          <mesh
            rotation-x={-Math.PI / 2}
            position-y={-0.01}
            position-x={map.size[0] / 2}
            position-z={map.size[1] / 2}
            receiveShadow
            onPointerDown={onPlanePointerDown}
            onPointerUp={onPlanePointerUp}
            onPointerEnter={() => setOnFloor(true)}
            onPointerLeave={() => setOnFloor(false)}
          >
            <planeGeometry args={map.size} />
            <meshStandardMaterial color="#c4a882" />
          </mesh>

          <group raycast={() => null}>
            <mesh position={[map.size[0] / 2, 2, -0.15]} castShadow receiveShadow>
              <boxGeometry args={[map.size[0] + 0.3, 4, 0.3]} />
              <meshStandardMaterial color="#e8e0d4" />
            </mesh>
            <mesh position={[map.size[0] / 2, 2, map.size[1] + 0.15]} castShadow receiveShadow>
              <boxGeometry args={[map.size[0] + 0.3, 4, 0.3]} />
              <meshStandardMaterial color="#e8e0d4" />
            </mesh>
            <mesh position={[-0.15, 2, map.size[1] / 2]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 4, map.size[1] + 0.3]} />
              <meshStandardMaterial color="#e8e0d4" />
            </mesh>
            <mesh position={[map.size[0] + 0.15, 2, map.size[1] / 2]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 4, map.size[1] + 0.3]} />
              <meshStandardMaterial color="#e8e0d4" />
            </mesh>
          </group>
        </group>
      )}
    </>
  );
};
