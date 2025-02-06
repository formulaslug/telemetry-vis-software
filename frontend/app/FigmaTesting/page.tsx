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
		<div className="grid grid-cols-6 grid-rows-9 gap-3 md:grid-cols-9 md:grid-rows-6 w-[100vw] h-[100vh] p-4">
			<div className="col-span-1 row-span-1">
				<GForceGauge x={position.x} y={position.y} z={position.z} />
			</div>
			<div className="col-span-1 row-span-1">
				<SuspensionGauge s1={position.x} s2={position.y} s3={position.z} s4={0} />
			</div>
			<div className="col-span-1 row-span-1">
				<CarWireframe x={position.x * 0.1} y={position.y} z={position.z * 0.1} />
			</div>
		</div>
	);
}
