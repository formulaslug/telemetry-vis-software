import * as THREE from "three";
import { OrbitControls, Plane, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useEffect, useRef } from "react";

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
			new THREE.Euler(rotation.x, rotation.y + Math.PI, rotation.z, "XYZ")
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

function CarWireframe({ rotation }: { rotation: rotation }) {
	return (
		<div className="w-full h-full bg-white/10 rounded-[4%] overflow-hidden flex flex-col">
			<div className="h-[90%]">
				<Scene rotation={rotation} />
			</div>
			<div className="h-[10%] w-full bg-neutral-900 text-[1.5vmin] flex flex-row justify-evenly items-center">
				<p>x: {rotation.x.toFixed(2)}</p>
				<p>y: {rotation.y.toFixed(2)}</p>
				<p>z: {rotation.z.toFixed(2)}</p>
			</div>
		</div>
	);
}

export default CarWireframe;
