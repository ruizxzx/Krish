'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 1300;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.pow(Math.random(), .65) * 4.8;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - .5) * 4.8;
      positions[i * 3 + 2] = Math.sin(a) * r;
      sizes[i] = .4 + Math.random() * 1.8;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!points.current) return;
    points.current.rotation.y += .0008;
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, pointer.y * .08, .025);
    points.current.rotation.z = THREE.MathUtils.lerp(points.current.rotation.z, pointer.x * -.04, .025);
    if (material.current) material.current.opacity = .28 + Math.sin(clock.elapsedTime * .7) * .035;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial ref={material} color="#d8ff54" size={.025} sizeAttenuation transparent opacity={.3} depthWrite={false} />
    </points>
  );
}

function Core() {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || !shell.current || !wire.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * -.22 + Math.sin(t * .2) * .08, .035);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * .34 + t * .09, .035);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.x * .35, .03);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, pointer.y * -.25 + Math.sin(t * .65) * .12, .03);
    shell.rotation.z += delta * .16;
    wire.rotation.x -= delta * .12;
    wire.rotation.y += delta * .19;
    const pulse = 1 + Math.sin(t * 1.15) * .035;
    shell.scale.setScalar(pulse);
  });

  return (
    <group ref={group}>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.32, 5]} />
        <meshPhysicalMaterial color="#cfeaa1" roughness={.24} metalness={.55} transmission={.15} transparent opacity={.2} wireframe />
      </mesh>
      <mesh ref={wire} scale={1.35}>
        <torusKnotGeometry args={[1.05, .025, 180, 12, 2, 3]} />
        <meshBasicMaterial color="#70f0ff" transparent opacity={.28} />
      </mesh>
      <mesh scale={.42}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#d8ff54" transparent opacity={.16} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={.35} />
      <pointLight position={[2, 2, 4]} intensity={5} color="#d8ff54" distance={8} />
      <pointLight position={[-4, -1, 1]} intensity={3} color="#704cff" distance={7} />
      <ParticleField />
      <Core />
    </>
  );
}

export function WebGLBackground() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.8], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      fallback={<span />}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#070808'), 0)}
    >
      <Scene />
    </Canvas>
  );
}
