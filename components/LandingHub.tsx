'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import AICore from './AICore';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function LandingHub() {
    const groupRef = useRef<THREE.Group>(null);

    // Subtle rotation animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central AI Core */}
            <AICore position={[0, 0, 0]} />

            {/* Floating platform rings */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2, 2.5, 64]} />
                    <meshStandardMaterial
                        color="#4f46e5"
                        emissive="#4f46e5"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </Float>

            {/* Outer ring */}
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
                <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[3, 3.3, 64]} />
                    <meshStandardMaterial
                        color="#818cf8"
                        emissive="#818cf8"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            </Float>

            {/* Orbiting particles */}
            {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 4;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <Float
                        key={i}
                        speed={3 + i * 0.2}
                        rotationIntensity={0.5}
                        floatIntensity={1}
                    >
                        <mesh position={[x, Math.sin(angle) * 0.5, z]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshStandardMaterial
                                color="#c4b5fd"
                                emissive="#c4b5fd"
                                emissiveIntensity={0.8}
                            />
                        </mesh>
                    </Float>
                );
            })}
        </group>
    );
}
