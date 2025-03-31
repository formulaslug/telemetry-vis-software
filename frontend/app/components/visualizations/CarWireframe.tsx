import * as THREE from "three";
import { OrbitControls, Plane, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useEffect, useRef, useState } from "react";
import getTextSize from "@/app/utils/getTextSize";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";

interface rotation {
    x: number;
    y: number;
    z: number;
}

function Scene({ rotation }: { rotation: rotation }) {
    return (
        <Canvas camera={{ position: [0, 10, 0], fov: 30 }}>
            <OrbitControls />
            <Car rotation={rotation} />
            <mesh position={[0, -0.15, 0]}>
                <boxGeometry args={[2, 0.1, 4]} />
                <meshBasicMaterial color={"grey"} />
            </mesh>
            <ambientLight intensity={Math.PI / 2} />
            <pointLight position={[0, 10, 0]} decay={0.1} intensity={Math.PI} />
        </Canvas>
    );
}

function Car({ rotation }: { rotation: rotation }) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF("/formula_car.glb");

    useEffect(() => {
        group.current?.setRotationFromEuler(
            new THREE.Euler(rotation.x, rotation.y + Math.PI, rotation.z, "XYZ"),
        );
    }, [rotation]);

    scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((material) => {
                    if (material instanceof THREE.MeshStandardMaterial) {
                        material.wireframe = true;
                    }
                });
            } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.wireframe = true;
            }
        }
    });

    return (
        <group scale={0.4} ref={group}>
            <primitive object={scene} />
        </group>
    );
}

export default function CarWireframe() {
    const [values, setValues] = useState<{ x: number; y: number; z: number }>({
        x: 0,
        y: 0,
        z: 0,
    });
    const { subscribeCursorRow } = useDataMethods();
    useEffect(() => {
        return subscribeCursorRow((cursorRow) => {
            setValues({
                x: cursorRow?.VDM_X_AXIS_ACCELERATION ?? 0,
                y: cursorRow?.VDM_Y_AXIS_ACCELERATION ?? 0,
                z: cursorRow?.VDM_Z_AXIS_ACCELERATION ?? 0,
            });
        });
    }, []);
    const containerRef = useRef<HTMLDivElement>(null);
    const textSize = getTextSize({ ref: containerRef });

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-white/10 overflow-hidden flex flex-col"
        >
            <div className="h-[90%]">
                <Scene rotation={{ x: values.x, y: values.y, z: values.z }} />
            </div>
            <div
                className="h-[10%] w-full bg-neutral-900 flex flex-row justify-evenly items-center"
                style={{ fontSize: textSize }}
            >
                <p>x: {values.x.toFixed(2)}</p>
                <p>y: {values.y.toFixed(2)}</p>
                <p>z: {values.z.toFixed(2)}</p>
            </div>
        </div>
    );
}
