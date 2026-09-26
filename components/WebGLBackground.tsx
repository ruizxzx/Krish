'use client';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useMemo,useRef} from 'react';

function Scene(){
 const group=useRef<THREE.Group>(null); const ring=useRef<THREE.Mesh>(null);
 const points=useMemo(()=>{const g=new THREE.BufferGeometry();const p=new Float32Array(360*3);for(let i=0;i<360;i++){const r=2+Math.random()*3,a=Math.random()*Math.PI*2;p[i*3]=Math.cos(a)*r;p[i*3+1]=(Math.random()-.5)*1.8;p[i*3+2]=Math.sin(a)*r;}g.setAttribute('position',new THREE.BufferAttribute(p,3));return g;},[]);
 useFrame((s,d)=>{if(!group.current||!ring.current)return;group.current.rotation.x=THREE.MathUtils.lerp(group.current.rotation.x,s.pointer.y*-.18,.04);group.current.rotation.y=THREE.MathUtils.lerp(group.current.rotation.y,s.pointer.x*.24,.04);group.current.position.y=Math.sin(s.clock.elapsedTime*.65)*.12;ring.current.rotation.z+=d*.16;});
 return <group ref={group}><points geometry={points}><pointsMaterial color="#d9ff62" size={.028} sizeAttenuation transparent opacity={.45} depthWrite={false}/></points><mesh ref={ring} rotation={[.55,0,0]}><torusGeometry args={[1.9,.018,8,160]}/><meshBasicMaterial color="#84f7ff" transparent opacity={.48}/></mesh><mesh rotation={[.3,.7,.2]}><icosahedronGeometry args={[1.15,3]}/><meshBasicMaterial color="#eef0e8" wireframe transparent opacity={.12}/></mesh></group>
}
export function WebGLBackground(){return <div className="webgl" aria-hidden="true"><Canvas dpr={[1,1.45]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} camera={{position:[0,0,7],fov:42}} onCreated={({gl})=>gl.setClearColor(new THREE.Color('#080a0d'),0)} fallback={<span/>}><ambientLight intensity={.35}/><Scene/></Canvas></div>}
