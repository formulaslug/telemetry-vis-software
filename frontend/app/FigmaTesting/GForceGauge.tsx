import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import getTextSize from "../utils/getTextSize";

interface GForceProps {
	X: number;
	Y: number;
	Z: number;
	Dampening: number;
}

interface SceneProps {
	polarAngle: number;
	azimuthalAngle: number;
	setActive: React.Dispatch<React.SetStateAction<string>>;
	active: string;
	position: Vector3;
}

interface AngleViewerProps {
	polarAngle: number;
	azimuthalAngle: number;
	active: string;
}

function Sphere({ position }: { position: Vector3 }) {
	return (
		<mesh position={position ?? [0, 0, 0]}>
			<sphereGeometry args={[0.2]} />
			<meshStandardMaterial color={"red"} />
		</mesh>
	);
}

function Grid() {
	return (
		<>
			<mesh>
				<boxGeometry args={[3, 0.1, 0.1]} />
				<meshStandardMaterial color="red" />
			</mesh>
			<mesh>
				<boxGeometry args={[0.1, 3, 0.1]} />
				<meshStandardMaterial color="blue" />
			</mesh>
			<mesh>
				<boxGeometry args={[0.1, 0.1, 3]} />
				<meshStandardMaterial color="green" />
			</mesh>
		</>
	);
}

function AngleViewer({ polarAngle, azimuthalAngle, active }: AngleViewerProps) {
	const controls = useThree((state) => state.controls as any);
	useEffect(() => {
		controls?.setAzimuthalAngle(azimuthalAngle);
		controls?.setPolarAngle(polarAngle);
	}, [polarAngle, azimuthalAngle, active]);

	return null;
}

function Scene({
	polarAngle,
	azimuthalAngle,
	setActive,
	active,
	position,
}: SceneProps) {
	return (
		<Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
			<Grid />
			<OrbitControls
				enablePan={false}
				enableZoom={false}
				makeDefault
				onStart={() => {
					setActive("");
				}}
				maxZoom={5}
				minZoom={5}
			/>
			<AngleViewer
				polarAngle={polarAngle}
				azimuthalAngle={azimuthalAngle}
				active={active}
			/>
			<ambientLight intensity={Math.PI / 2} />
			<pointLight position={[0, 10, 0]} decay={0.1} intensity={Math.PI} />
			<Sphere position={position} />
		</Canvas>
	);
}

export default function GForceGauge({ X, Y, Z, Dampening }: GForceProps) {
	const [polarAngle, setPolarAngle] = useState(Math.PI / 2);
	const [azimuthalAngle, setAzimuthalAngle] = useState(0);

	const [active, setActive] = useState("xy");

	const containerRef = useRef<HTMLDivElement>(null);
	const textSize = getTextSize({ ref: containerRef });

	return (
		<div
			ref={containerRef}
			className="w-full h-full bg-white/10 rounded-[4%] overflow-hidden"
		>
			<div className="h-[90%]">
				<Scene
					position={new Vector3(X, Y, Z)}
					polarAngle={polarAngle}
					azimuthalAngle={azimuthalAngle}
					setActive={setActive}
					active={active}
				/>
			</div>
			<div className="flex justify-center h-[10%]">
				<button
					onClick={() => {
						setPolarAngle(Math.PI / 2);
						setAzimuthalAngle(0);
						setActive("xy");
					}}
					className={`w-1/3 ${active === "xy" ? "bg-red-500" : "bg-neutral-900"}`}
					style={{ fontSize: textSize }}
				>
					xy
				</button>
				<button
					onClick={() => {
						setPolarAngle(0);
						setAzimuthalAngle(0);
						setActive("xz");
					}}
					className={`w-1/3 ${active === "xz" ? "bg-red-500" : "bg-neutral-900"}`}
					style={{ fontSize: textSize }}
				>
					xz
				</button>
				<button
					onClick={() => {
						setPolarAngle(Math.PI / 2);
						setAzimuthalAngle(Math.PI / 2);
						setActive("yz");
					}}
					className={`w-1/3 ${active === "yz" ? "bg-red-500" : "bg-neutral-900"}`}
					style={{ fontSize: textSize }}
				>
					yz
				</button>
			</div>
		</div>
	);
}
