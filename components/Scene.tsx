'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { ReactNode } from 'react';

interface SceneProps {
    children: ReactNode;
}

export default function Scene({ children }: SceneProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            style={{ width: '100%', height: '100vh' }}
        >
            {/* Ambient lighting */}
            <ambientLight intensity={0.3} />

            {/* Directional light */}
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Point light for dramatic effect */}
            <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} />

            {/* Starfield background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Scene content */}
            {children}

            {/* Camera controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={false}
                maxDistance={10}
                minDistance={3}
            />
        </Canvas>
    );
}
