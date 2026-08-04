"use client";

import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";

// Real-life property and feature JPG images hosted on Unsplash
const IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Modern Flat
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Bungalow / Villa
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Shared PG / Bedroom
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Luxury Apartment
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Studio Room / Single PG
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop&fm=jpg", // Exterior Property
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop&fm=jpg", // House / Home
];

const FRAME_COLORS = ["#0F6E56", "#1D9E75", "#D85A30", "#0F6E56", "#1D9E75", "#D85A30", "#0F6E56"];

function Card({ position, rotationY, color, texture }) {
  // Box face order: +x, -x, +y, -y, +z, -z
  // The card sits with its +z face pointing outward (toward the camera side
  // of the ring), so that's the one face that gets the property photo.
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    ],
    [color, texture]
  );

  return (
    <mesh position={position} rotation={[0, rotationY, 0]} material={materials}>
      <boxGeometry args={[1.5, 1.85, 0.07]} />
    </mesh>
  );
}

function Ring({ count, radius, speed, tilt }) {
  const groupRef = useRef(null);
  const textures = useLoader(THREE.TextureLoader, IMAGES.slice(0, count));

  const cards = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotationY: angle,
        color: FRAME_COLORS[i % FRAME_COLORS.length],
        texture: textures[i],
      };
    });
  }, [count, radius, textures]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      {cards.map((c, i) => (
        <Card key={i} position={c.position} rotationY={c.rotationY} color={c.color} texture={c.texture} />
      ))}
    </group>
  );
}

export default function CardRing3D({ count = 7, radius = 3.2, height = 360, interactive = true }) {
  return (
    <div style={{ width: "100%", height }}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 7.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 4]} intensity={0.9} />
        <Suspense fallback={null}>
          <Ring count={count} radius={radius} speed={interactive ? 0.18 : 0.12} tilt={0.08} />
        </Suspense>
      </Canvas>
    </div>
  );
}