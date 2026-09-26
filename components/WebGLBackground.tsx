'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';

function ParticleField({ intensity }: { intensity: number }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 850;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 2.8 + Math.pow(Math.random(), 0.65) * 5.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.2;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame(({ pointer, clock }) => {
    const node = points.current;
    if (!node) return;
    node.rotation.y += 0.0007 * intensity;
    node.rotation.x = THREE.MathUtils.lerp(node.rotation.x, pointer.y * 0.08, 0.025);
    node.rotation.z = THREE.MathUtils.lerp(node.rotation.z, pointer.x * -0.06, 0.025);
    (node.material as THREE.PointsMaterial).opacity = 0.14 + Math.sin(clock.elapsedTime * 0.55) * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#d9ff64" size={0.024} transparent opacity={0.14} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function OrbitalRing({ radius, rotation, color, speed, dashed = false }: { radius: number; rotation: [number, number, number]; color: string; speed: number; dashed?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed;
    ref.current.rotation.x += delta * speed * 0.11;
  });
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, dashed ? 0.008 : 0.013, 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={dashed ? 0.28 : 0.42} depthWrite={false} />
    </mesh>
  );
}

function FloatingPanel({ index, position, rotation, accent }: { index: number; position: [number, number, number]; rotation: [number, number, number]; accent: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + index;
    ref.current.position.y = position[1] + Math.sin(t * 0.55) * 0.12;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.3) * 0.07;
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.68, 0.98, 0.045]} />
        <meshBasicMaterial color="#101312" transparent opacity={0.76} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[0.48, 0.68, 0.012]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} />
      </mesh>
      <mesh position={[-0.24, 0.35, 0.032]}>
        <boxGeometry args={[0.14, 0.012, 0.008]} />
        <meshBasicMaterial color="#e9ece2" transparent opacity={0.55} />
      </mesh>
      <mesh position={[-0.24, 0.28, 0.032]}>
        <boxGeometry args={[0.22, 0.008, 0.008]} />
        <meshBasicMaterial color="#e9ece2" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function Core({ intensity }: { intensity: number }) {
  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const knot = useRef<THREE.Mesh>(null);
  const scroll = useRef(0);

  useEffect(() => {
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      scroll.current = window.scrollY / max;
    };
    addEventListener('scroll', update, { passive: true });
    update();
    return () => removeEventListener('scroll', update);
  }, []);

  useFrame(({ pointer, clock }, delta) => {
    if (!root.current || !shell.current || !knot.current) return;
    const t = clock.elapsedTime;
    const s = scroll.current;
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, pointer.y * -0.18 + s * 0.65 + Math.sin(t * 0.18) * 0.04, 0.032);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointer.x * 0.32 + t * 0.075 + s * 1.2, 0.032);
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, pointer.x * 0.22, 0.03);
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, pointer.y * -0.16 + Math.sin(t * 0.55) * 0.1, 0.03);
    root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, -s * 0.8, 0.035);
    shell.current.rotation.z += delta * 0.19 * intensity;
    knot.current.rotation.x -= delta * 0.12 * intensity;
    knot.current.rotation.y += delta * 0.22 * intensity;
    knot.current.scale.setScalar(1 + Math.sin(t * 1.15) * 0.028);
  });

  return (
    <group ref={root}>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.36, 3]} />
        <meshBasicMaterial color="#cfe9a1" transparent opacity={0.18} wireframe />
      </mesh>
      <mesh ref={knot} scale={1.16}>
        <torusKnotGeometry args={[1.04, 0.036, 140, 8, 2, 3]} />
        <meshBasicMaterial color="#71efff" transparent opacity={0.33} />
      </mesh>
      <mesh scale={0.38}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color="#d9ff64" transparent opacity={0.32} />
      </mesh>
      <OrbitalRing radius={1.72} rotation={[0.55, 0.25, 0.15]} color="#d9ff64" speed={0.18 * intensity} />
      <OrbitalRing radius={2.04} rotation={[1.06, -0.2, 0.4]} color="#71efff" speed={-0.12 * intensity} dashed />
      <OrbitalRing radius={2.38} rotation={[0.22, 1.0, -0.35]} color="#a27bff" speed={0.08 * intensity} dashed />
      <FloatingPanel index={1} position={[2.55, 0.78, -0.35]} rotation={[0.15, -0.4, -0.15]} accent="#d9ff64" />
      <FloatingPanel index={2} position={[-2.45, -0.55, -0.8]} rotation={[0.1, 0.35, 0.18]} accent="#71efff" />
      <FloatingPanel index={3} position={[0.4, -2.25, -1.0]} rotation={[-0.15, 0.15, 0.08]} accent="#a27bff" />
    </group>
  );
}

function Scene({ intensity }: { intensity: number }) {
  return (
    <>
      <ParticleField intensity={intensity} />
      <Core intensity={intensity} />
    </>
  );
}

export function WebGLBackground({ intensity = 1 }: { intensity?: number }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const narrow = innerWidth < 900;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(!coarse && !narrow && !reduced);
  }, []);

  if (!enabled) return null;

  return (
    <Canvas
      dpr={[1, 1.15]}
      camera={{ position: [0, 0, 7.1], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      className="hero-canvas"
      frameloop="always"
      fallback={<div />}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#070808'), 0)}
    >
      <Scene intensity={Math.max(0.45, Math.min(intensity, 1.35))} />
    </Canvas>
  );
}
