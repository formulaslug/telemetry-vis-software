"use client";

import { useEffect, useState } from "react";
import GForceGauge from "./GForceGauge";
import SuspensionGauge from "./SuspensionGauge";

import { Vector3 } from "three";
import CarWireframe from "./CarWireframe";

export default function Home() {
	const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));

	useEffect(() => {
		const intervalId = setInterval(() => {
			const time = Date.now() / 1000; // Time in seconds
			const x = Math.sin(time); // Adjust amplitude as needed
			setPosition(new Vector3(x, x * x, x));
		}, 1); // Roughly 60 frames per second

		return () => clearInterval(intervalId); // Cleanup on unmount
	}, []);

	return (
		<div className="flex justify-center py-10">
			<div className="mx-4 bg-white/10 rounded-[4%] overflow-hidden">
				<GForceGauge X={position.x} Y={position.y} Z={position.z} Dampening={1} />
			</div>
			<div className="mx-4 bg-white/10 rounded-[4%] overflow-hidden">
				<SuspensionGauge S1={position.x} S2={position.y} S3={position.z} S4={0} />
			</div>
			<div className="mx-4 bg-white/10 rounded-[4%] overflow-hidden">
				<CarWireframe
					rotation={{ x: position.x * 0.1, y: position.y, z: position.z * 0.001 }}
				/>
			</div>
		</div>
	);
}
