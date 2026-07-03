"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ZONE_HEX, type CrescentGrid, type Polyline } from "./crescent-data";

/**
 * The actual WebGL globe — dynamically imported by `CrescentGlobe` with
 * `ssr: false` so `three` never enters other pages' bundles and never runs
 * during static export. It renders the precomputed zone grid as a colored point
 * cloud over a dark sphere, with country borders + coastlines for geographic
 * reference. No runtime astronomy — just display of baked data.
 */

const DEG = Math.PI / 180;

/** Longitude/latitude (degrees) → point on a sphere of radius `r`. */
function lonLatToVec3(
  lon: number,
  lat: number,
  r: number,
): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = lon * DEG;
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function ZonePoints({ grid }: { grid: CrescentGrid }) {
  const { positions, colors } = useMemo(() => {
    const pts: number[] = [];
    const cols: number[] = [];
    const c = new THREE.Color();
    for (let la = 0; la < grid.nLat; la++) {
      const lat = grid.latMin + la * grid.step;
      for (let lo = 0; lo < grid.nLon; lo++) {
        const z = grid.zones[la * grid.nLon + lo];
        if (z > 3) continue; // skip "no sunset" cells
        const lon = grid.lonMin + lo * grid.step;
        pts.push(...lonLatToVec3(lon, lat, 1.008));
        c.set(ZONE_HEX[z]);
        cols.push(c.r, c.g, c.b);
      }
    }
    return {
      positions: new Float32Array(pts),
      colors: new Float32Array(cols),
    };
  }, [grid]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
      />
    </points>
  );
}

/** Country borders + coastlines drawn as line segments hugging the sphere. */
function Borders({ land }: { land: Polyline[] }) {
  const positions = useMemo(() => {
    const seg: number[] = [];
    for (const line of land) {
      for (let i = 0; i < line.length - 1; i++) {
        seg.push(...lonLatToVec3(line[i][0], line[i][1], 1.003));
        seg.push(...lonLatToVec3(line[i + 1][0], line[i + 1][1], 1.003));
      }
    }
    return new Float32Array(seg);
  }, [land]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#6b8a86" transparent opacity={0.55} />
    </lineSegments>
  );
}

export default function GlobeScene({
  grid,
  land,
}: {
  grid: CrescentGrid;
  land: Polyline[];
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 2.7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={0.7} />
      {/* Globe body. */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0a0f1a"
          emissive="#0a1512"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {land.length > 0 && <Borders land={land} />}
      <ZonePoints grid={grid} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI - 0.3}
      />
    </Canvas>
  );
}
