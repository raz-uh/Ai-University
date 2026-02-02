'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AICoreProps {
    position: [number, number, number];
}

export default function AICore({ position }: AICoreProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Custom shader for pulsing effect
    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color1: { value: new THREE.Color('#4f46e5') },
            color2: { value: new THREE.Color('#818cf8') },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }

        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.003;
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      // Pulsing effect
      float pulse = sin(time * 2.0) * 0.5 + 0.5;
      
      // Fresnel effect for glow
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      
      // Mix colors based on pulse and fresnel
      vec3 color = mix(color1, color2, pulse);
      color += fresnel * 0.5;
      
      // Add animated patterns
      float pattern = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time) * 0.1;
      color += pattern;
      
      gl_FragColor = vec4(color, 0.9);
    }
  `;

    return (
        <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />

            {/* Inner glow sphere */}
            <Sphere args={[0.95, 32, 32]}>
                <meshStandardMaterial
                    color="#a78bfa"
                    emissive="#a78bfa"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.3}
                />
            </Sphere>
        </Sphere>
    );
}
