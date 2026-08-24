"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Camera positions & targets for centered room focus
const ROOM_CAMERA_PRESETS = {
  all: { pos: [9.5, 10.5, 9.5], target: [-3.2, 0, 1.2] },
  living: { pos: [3.5, 4.8, 4.8], target: [1.5, 0.5, 0.5] },
  kitchen: { pos: [-3.5, 5.2, 4.5], target: [-2, 0.5, -0.5] },
  bedroom: { pos: [4.5, 5.8, -3], target: [2.5, 0.5, -2] },
  garden: { pos: [-6.5, 5.5, 2], target: [-4.5, 0.5, 1.5] },
};

function ControlsAndCamera({ roomMode }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef(null);
  const targetPos = useRef(new THREE.Vector3(...ROOM_CAMERA_PRESETS.all.pos));
  const targetLook = useRef(new THREE.Vector3(...ROOM_CAMERA_PRESETS.all.target));

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 3.5;
    controls.maxDistance = 28;
    controlsRef.current = controls;

    return () => controls.dispose();
  }, [camera, gl]);

  useEffect(() => {
    const preset = ROOM_CAMERA_PRESETS[roomMode] || ROOM_CAMERA_PRESETS.all;
    targetPos.current.set(...preset.pos);
    targetLook.current.set(...preset.target);
  }, [roomMode]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.06);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.06);
      controlsRef.current.update();
    }
  });

  return null;
}

export default function SplineMiniHome3D({ activeRoom = "all", isNight = false }) {
  const bgColor = isNight ? "#090D16" : "#5DA63C";

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [9.5, 10.5, 9.5], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Dynamic Canvas Clear Background Color */}
        <color attach="background" args={[bgColor]} />

        <ControlsAndCamera roomMode={activeRoom} />

        {/* LIGHTING SETUP */}
        <ambientLight intensity={isNight ? 0.35 : 1.25} />
        <directionalLight
          castShadow
          position={[14, 18, 12]}
          intensity={isNight ? 0.35 : 1.85}
          color={isNight ? "#93C5FD" : "#FFF7ED"}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-12, 12, -10]} intensity={0.3} color="#E0E7FF" />

        {/* Warm Night Point Lights */}
        {isNight && (
          <>
            <pointLight position={[1.5, 2, 0.5]} intensity={3.0} distance={7} color="#F59E0B" />
            <pointLight position={[-2, 2, -0.5]} intensity={3.0} distance={7} color="#F97316" />
            <pointLight position={[2.5, 2, -2]} intensity={3.0} distance={7} color="#38BDF8" />
            <pointLight position={[-5, 1.5, 3]} intensity={2.5} distance={6} color="#FDE047" />
          </>
        )}

        {/* 3D SCENE MODELING */}
        <group position={[0, -0.5, 0]}>
          
          {/* 1. EXPANDED MASSIVE GROUND LAWN SLAB (FULL SCREEN COVERAGE) */}
          <mesh receiveShadow position={[0, -0.2, 0]}>
            <boxGeometry args={[140, 0.4, 140]} />
            <meshStandardMaterial color={isNight ? "#0F172A" : "#62B33D"} roughness={0.7} />
          </mesh>

          {/* Garden Fence & Lamp Posts */}
          <FenceLine isNight={isNight} />
          <GardenLampPosts isNight={isNight} />

          {/* 2. SWIMMING POOL & SUN DECK */}
          <SwimmingPoolArea isNight={isNight} />

          {/* 3. BBQ PATIO & GARDEN BENCH */}
          <BBQPatioArea isNight={isNight} />

          {/* 4. FLOWER BEDS, COBBLESTONE PATH & PET ZONE */}
          <GardenPathAndFlowers isNight={isNight} />
          <OutdoorGardenTrees isNight={isNight} />

          {/* 5. HOUSE FLOOR SLAB */}
          <mesh receiveShadow position={[0.5, 0.05, -0.5]}>
            <boxGeometry args={[11, 0.15, 9.5]} />
            <meshStandardMaterial color={isNight ? "#1E293B" : "#FDF5E6"} roughness={0.4} />
          </mesh>

          {/* Room Flooring Tiles */}
          <mesh position={[-0.5, 0.14, -2.8]}>
            <boxGeometry args={[3.4, 0.02, 3]} />
            <meshStandardMaterial color="#60A5FA" roughness={0.3} />
          </mesh>
          <mesh position={[3.4, 0.14, -2.5]}>
            <boxGeometry args={[4.0, 0.02, 3.6]} />
            <meshStandardMaterial color="#D97706" roughness={0.6} />
          </mesh>

          {/* Wall Dividers */}
          <WallsDivider isNight={isNight} />

          {/* 6. LIVING ROOM & FIREPLACE */}
          <group position={[1.5, 0.15, 0.8]}>
            <mesh castShadow receiveShadow position={[0, 0.35, 1.2]}>
              <boxGeometry args={[2.5, 0.45, 0.9]} />
              <meshStandardMaterial color="#F48FB1" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 0.75, 1.5]}>
              <boxGeometry args={[2.5, 0.5, 0.3]} />
              <meshStandardMaterial color="#F06292" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[-1.2, 0.55, 1.2]}>
              <boxGeometry args={[0.25, 0.4, 0.9]} />
              <meshStandardMaterial color="#F06292" />
            </mesh>
            <mesh castShadow position={[1.2, 0.55, 1.2]}>
              <boxGeometry args={[0.25, 0.4, 0.9]} />
              <meshStandardMaterial color="#F06292" />
            </mesh>

            {/* Coffee Table & Vase */}
            <mesh castShadow receiveShadow position={[0, 0.3, 0.2]}>
              <cylinderGeometry args={[0.65, 0.65, 0.2, 32]} />
              <meshStandardMaterial color="#E0B880" roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0, 0.45, 0.2]}>
              <cylinderGeometry args={[0.08, 0.06, 0.2, 16]} />
              <meshStandardMaterial color="#38BDF8" />
            </mesh>

            {/* Fireplace */}
            <group position={[2.1, 0, 0]}>
              <mesh castShadow position={[0, 0.6, 0]}>
                <boxGeometry args={[0.5, 1.2, 1.1]} />
                <meshStandardMaterial color="#881337" />
              </mesh>
              <mesh position={[-0.2, 0.3, 0]}>
                <boxGeometry args={[0.15, 0.2, 0.6]} />
                <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={1.5} />
              </mesh>
            </group>

            {/* Armchair */}
            <mesh castShadow position={[-1.6, 0.35, 0.2]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.8, 0.45, 0.8]} />
              <meshStandardMaterial color="#8B5CF6" />
            </mesh>

            {/* TV Unit */}
            <group position={[0, 0, -1.2]}>
              <mesh castShadow position={[0, 0.35, 0]}>
                <boxGeometry args={[2.2, 0.4, 0.6]} />
                <meshStandardMaterial color="#D97706" />
              </mesh>
              <mesh castShadow position={[-0.4, 0.85, 0]}>
                <boxGeometry args={[0.9, 0.6, 0.3]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
              <mesh position={[-0.4, 0.85, 0.16]}>
                <planeGeometry args={[0.75, 0.45]} />
                <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </group>

          {/* 7. KITCHEN & DINING */}
          <group position={[-2.2, 0.15, -0.5]}>
            <mesh castShadow position={[-1.8, 1.0, 1.5]}>
              <boxGeometry args={[0.9, 1.8, 0.9]} />
              <meshStandardMaterial color="#FF7A00" roughness={0.3} />
            </mesh>
            <mesh castShadow position={[-1.8, 0.45, -0.5]}>
              <boxGeometry args={[0.9, 0.8, 2.4]} />
              <meshStandardMaterial color="#22C55E" roughness={0.4} />
            </mesh>
            <group position={[0.3, 0, 0.8]}>
              <mesh castShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[1.6, 0.1, 1.1]} />
                <meshStandardMaterial color="#D97706" />
              </mesh>
              {[
                [-0.6, 0],
                [0.6, 0],
                [0, -0.65],
                [0, 0.65],
              ].map(([cx, cz], i) => (
                <mesh key={i} castShadow position={[cx, 0.3, cz]}>
                  <boxGeometry args={[0.35, 0.35, 0.35]} />
                  <meshStandardMaterial color="#FBBF24" />
                </mesh>
              ))}
              <mesh castShadow position={[0, 0.62, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
                <meshStandardMaterial color="#F472B6" />
              </mesh>
            </group>
          </group>

          {/* 8. BEDROOM & WORKSTATION DESK */}
          <group position={[3.2, 0.15, -2.5]}>
            <mesh castShadow position={[0, 0.35, -0.3]}>
              <boxGeometry args={[1.7, 0.45, 2.2]} />
              <meshStandardMaterial color="#EAB308" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 0.6, -1.1]}>
              <boxGeometry args={[1.4, 0.15, 0.4]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <group position={[-1.3, 0, 1.0]}>
              <mesh castShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[0.6, 0.08, 1.1]} />
                <meshStandardMaterial color="#78350F" />
              </mesh>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[0.3, 0.25, 0.02]} />
                <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.6} />
              </mesh>
            </group>
          </group>

        </group>
      </Canvas>
    </div>
  );
}

/* Feature 1: Private Swimming Pool & Sun Deck */
function SwimmingPoolArea({ isNight }) {
  return (
    <group position={[-3.8, 0.05, 3.2]}>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[3.4, 0.25, 2.6]} />
        <meshStandardMaterial color="#0284C7" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.0, 0.02, 2.2]} />
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.1}
          opacity={0.85}
          transparent
          emissive="#0284C7"
          emissiveIntensity={isNight ? 0.6 : 0.2}
        />
      </mesh>
      <group position={[2.0, 0.15, -0.6]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.1, 1.2]} />
          <meshStandardMaterial color="#F87171" />
        </mesh>
        <mesh castShadow position={[0.4, 1.0, -0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 2.0, 12]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        <mesh castShadow position={[0.4, 1.9, -0.4]}>
          <coneGeometry args={[0.9, 0.45, 8]} />
          <meshStandardMaterial color="#F87171" />
        </mesh>
      </group>
    </group>
  );
}

/* Feature 2: BBQ Patio & Outdoor Bench */
function BBQPatioArea({ isNight }) {
  return (
    <group position={[5.2, 0.05, 3]}>
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[3.8, 0.06, 3.2]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <group position={[-1.1, 0.45, 0.8]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.4]} />
          <meshStandardMaterial color="#FF5500" emissive="#FF5500" emissiveIntensity={1.2} />
        </mesh>
      </group>
      <mesh castShadow position={[0.8, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#9A3412" />
      </mesh>
    </group>
  );
}

/* Feature 3: Garden Path, Flower Beds & Pet Zone */
function GardenPathAndFlowers({ isNight }) {
  return (
    <group>
      {[-4, -3, -2, -1, 0, 1].map((z, i) => (
        <mesh key={i} receiveShadow position={[-0.8, 0.02, 4 + z * 0.8]}>
          <boxGeometry args={[0.9, 0.02, 0.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
        </mesh>
      ))}

      {[
        [-3.2, 1.2, "#EC4899"],
        [-2.2, 1.5, "#FBBF24"],
        [2.2, 2.5, "#A855F7"],
        [3.5, 2.2, "#EC4899"],
      ].map(([fx, fz, color], i) => (
        <group key={i} position={[fx, 0.2, fz]}>
          <mesh castShadow position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#15803D" />
          </mesh>
          <mesh castShadow position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}

      <group position={[1.8, 0.1, 4.5]}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.8]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.65, 0.4, 4]} />
          <meshStandardMaterial color="#7F1D1D" />
        </mesh>
        <mesh position={[0.6, 0.08, 0.3]}>
          <cylinderGeometry args={[0.12, 0.09, 0.1, 16]} />
          <meshStandardMaterial color="#38BDF8" />
        </mesh>
      </group>
    </group>
  );
}

/* Garden Lamp Posts */
function GardenLampPosts({ isNight }) {
  return (
    <group>
      {[
        [-3.8, 4.5],
        [2.2, 4.5],
      ].map(([lx, lz], i) => (
        <group key={i} position={[lx, 0.1, lz]}>
          <mesh castShadow position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial
              color="#FDE047"
              emissive="#FDE047"
              emissiveIntensity={isNight ? 1.5 : 0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Garden Trees */
function OutdoorGardenTrees({ isNight }) {
  return (
    <group position={[-7.5, 0, -2]}>
      <group position={[0, 0, 0]}>
        <mesh castShadow position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 2.0, 12]} />
          <meshStandardMaterial color="#78350F" />
        </mesh>
        <mesh castShadow position={[0, 2.7, 0]}>
          <sphereGeometry args={[1.3, 16, 16]} />
          <meshStandardMaterial color={isNight ? "#0F172A" : "#15803D"} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* Walls Divider */
function WallsDivider({ isNight }) {
  const wallColor = isNight ? "#334155" : "#F1EAD8";
  return (
    <group position={[0.5, 0.45, -0.5]}>
      <mesh castShadow position={[0, 0, -4.65]}>
        <boxGeometry args={[11, 0.7, 0.15]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh castShadow position={[-5.4, 0, 0]}>
        <boxGeometry args={[0.15, 0.7, 9.5]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh castShadow position={[1, 0, -1]}>
        <boxGeometry args={[0.15, 0.7, 7.3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}

/* Outdoor Fence */
function FenceLine({ isNight }) {
  const fenceColor = isNight ? "#64748B" : "#FFFFFF";
  return (
    <group position={[-5.8, 0.4, 0]}>
      {[-5, -3, -1, 1, 3, 5].map((z, i) => (
        <mesh key={i} castShadow position={[0, 0, z]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color={fenceColor} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.08, 10.2]} />
        <meshStandardMaterial color={fenceColor} />
      </mesh>
    </group>
  );
}
