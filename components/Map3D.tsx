import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { EXCHANGE_SERVERS, ExchangeServer } from "../data/exchanges";
import { useAppContext } from "../lib/appContext";

type Props = {
  filterProviders?: Record<string, boolean>;
  onSelect?: (id: string | null) => void;
  highlightedPair?: { from: string; to: string } | null;
};

function latLonToVector3(lat: number, lon: number, radius = 5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Marker component stays simple
function Marker({ server, onClick }: { server: ExchangeServer; onClick: (id: string) => void }) {
  const ref = useRef<any>();
  const pos = useMemo(() => latLonToVector3(server.latitude, server.longitude, 5.01), [server]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.3;
  });
  const color = server.provider === "AWS" ? "#FF9900" : server.provider === "GCP" ? "#4285F4" : "#0089D6";
  return (
    <group position={pos}>
      <mesh ref={ref} onClick={() => onClick(server.id)}>
        <coneGeometry args={[0.06, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html distanceFactor={10}>
        <div style={{ color: "#fff", fontSize: 12, textAlign: "center", pointerEvents: "none" }}>{server.name}</div>
      </Html>
    </group>
  );
}

// RegionVisualization: simple clustered region markers (instanced spheres)
function RegionVisualization({ regions }: { regions: { lat: number; lon: number; count: number; provider?: string }[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    if (!meshRef.current) return;
    regions.forEach((r, i) => {
      const pos = latLonToVector3(r.lat, r.lon, 5.02);
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.scale.setScalar(0.12 + Math.min(1.0, r.count * 0.06));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [regions, dummy]);
  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, regions.length]}>
      <sphereGeometry args={[0.5, 12, 12]} />
      <meshStandardMaterial color={"#33ccff"} transparent opacity={0.2} />
    </instancedMesh>
  );
}

/* GPUArcs component - unchanged except canvas/lighting fixes applied above */
function GPUArcs({ pairs }: { pairs: { from: ExchangeServer; to: ExchangeServer; latency: number }[] }) {
  const { gl, scene } = useThree();
  const maxInstances = Math.max(1, pairs.length);
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);

  const baseCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = t;
      const y = Math.sin(t * Math.PI) * 0.3;
      pts.push(new THREE.Vector3(x, y, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const baseGeometry = useMemo(() => {
    return new THREE.TubeGeometry(baseCurve, 64, 0.01, 8, false);
  }, [baseCurve]);

  const [shaderMaterial] = useState(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.9 }
      },
      vertexShader: `
        attribute vec3 instanceColor;
        attribute float instanceSpeed;
        attribute float instanceWidth;
        varying vec3 vColor;
        varying float vU;
        void main() {
          vColor = instanceColor;
          vU = uv.x;
          vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec3 vColor;
        varying float vU;
        void main() {
          float dash = fract(vU - time * 0.6);
          float alpha = step(0.0, 0.45 - abs(dash - 0.45));
          alpha *= 0.8;
          gl_FragColor = vec4(vColor, alpha * opacity);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return mat;
  });

  useEffect(() => {
    if (!instancedRef.current) return;
    const instanced = instancedRef.current;
    const dummy = new THREE.Object3D();
    const colors = new Float32Array(maxInstances * 3);
    const speeds = new Float32Array(maxInstances);
    const widths = new Float32Array(maxInstances);

    pairs.forEach((p, idx) => {
      const start = latLonToVector3(p.from.latitude, p.from.longitude, 5.01);
      const end = latLonToVector3(p.to.latitude, p.to.longitude, 5.01);
      const dir = end.clone().sub(start).normalize();
      const axis = new THREE.Vector3(1, 0, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);
      const length = start.distanceTo(end);

      dummy.position.copy(start);
      dummy.quaternion.copy(quaternion);
      dummy.scale.set(length, 1, 1);
      dummy.updateMatrix();
      instanced.setMatrixAt(idx, dummy.matrix);

      let colorCode = "#2ECC71"; // Green (low latency)
      if (p.latency > 50) colorCode = "#F1C40F"; // Yellow (medium latency)
      if (p.latency > 120) colorCode = "#E74C3C"; // Red (high latency)
      const color = new THREE.Color(colorCode);

      colors[idx * 3 + 0] = color.r;
      colors[idx * 3 + 1] = color.g;
      colors[idx * 3 + 2] = color.b;

      speeds[idx] = Math.max(0.2, 1.2 - Math.min(1.0, p.latency / 300));
      widths[idx] = Math.max(0.004, Math.min(0.03, 0.02 * (100 / (p.latency + 10))));
    });

    instanced.geometry.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(colors, 3));
    instanced.geometry.setAttribute("instanceSpeed", new THREE.InstancedBufferAttribute(speeds, 1));
    instanced.geometry.setAttribute("instanceWidth", new THREE.InstancedBufferAttribute(widths, 1));

    instanced.count = pairs.length;
    instanced.instanceMatrix.needsUpdate = true;
  }, [pairs, maxInstances]);

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.time.value = clock.getElapsedTime();
  });

  return <instancedMesh ref={instancedRef} args={[baseGeometry, shaderMaterial, Math.max(1, pairs.length)]} />;
}

export default function Map3D({ filterProviders = {}, onSelect, highlightedPair }: Props) {
  const globeRef = useRef<any>();
  const [latestPairs, setLatestPairs] = useState<{ from: ExchangeServer; to: ExchangeServer; latency: number }[]>([]);
  const [regions, setRegions] = useState<{ lat: number; lon: number; count: number }[]>([]);

  // Try to load a small texture from public/earth-dark.jpg — optional, falls back to colored material
  const earthTexture = useMemo(() => {
    try {
      const loader = new THREE.TextureLoader();
      return loader.load("/bluemarble-2048-light.png");
    } catch {
      return null;
    }
  }, []);

  const { allUpdates } = useAppContext();

  useEffect(() => {
    const pairs = allUpdates.map((u) => {
      const from = EXCHANGE_SERVERS.find((s) => s.id === u.from)!;
      const to = EXCHANGE_SERVERS.find((s) => s.id === u.to)!;
      return { from, to, latency: u.ms };
    });
    const filtered = pairs.filter((p) => {
      return (filterProviders[p.from.provider] ?? true) && (filterProviders[p.to.provider] ?? true);
    });
    setLatestPairs(filtered.slice(0, 200));
  }, [allUpdates, filterProviders]);

  useEffect(() => {
    const regionMap: Record<string, { latSum: number; lonSum: number; count: number }> = {};
    EXCHANGE_SERVERS.forEach((s) => {
      const key = `${s.provider}__${s.region}`;
      if (!regionMap[key]) regionMap[key] = { latSum: 0, lonSum: 0, count: 0 };
      regionMap[key].latSum += s.latitude;
      regionMap[key].lonSum += s.longitude;
      regionMap[key].count += 1;
    });
    const regs = Object.values(regionMap).map((r) => ({
      lat: r.latSum / r.count,
      lon: r.lonSum / r.count,
      count: r.count
    }));
    setRegions(regs);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* improved lighting */}
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#cfeaff", "#04061a", 0.35]} />
      <directionalLight position={[10, 10, 10]} intensity={1.0} />

      <group ref={globeRef}>
        {/* Globe */}
        <mesh>
          <sphereGeometry args={[5, 64, 64]} />
          {earthTexture ? (
            <meshStandardMaterial map={earthTexture} metalness={0.05} roughness={0.8} />
          ) : (
            <meshPhongMaterial color={"#0b3a5a"} specular={"#111"} shininess={12} />
          )}
        </mesh>

        {/* subtle atmosphere overlay */}
        <mesh renderOrder={10}>
          <sphereGeometry args={[5.06, 64, 64]} />
          <meshBasicMaterial color={"#2a6fb2"} transparent opacity={0.06} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* region visualization */}
        <RegionVisualization regions={regions} />

        {/* markers */}
        {EXCHANGE_SERVERS.filter((s) => filterProviders[s.provider] ?? true).map((s) => (
          <Marker key={s.id} server={s} onClick={onSelect!} />
        ))}

        {/* GPU-accelerated arcs */}
        <GPUArcs pairs={latestPairs} />
      </group>

      <OrbitControls enablePan enableZoom enableRotate target={[0, 0, 0]} />
    </Canvas>
  );
}
