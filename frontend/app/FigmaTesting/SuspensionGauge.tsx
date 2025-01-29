import { useEffect, useRef } from "react";

interface suspensionInfo {
	S1: number;
	S2: number;
	S3: number;
	S4: number;
}

function SuspensionCanvas({ S1, S2, S3, S4 }: suspensionInfo) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const spacingMultiplier = 0.1;
		const heightMultiplier = 1;

		if (canvas) {
			// Set canvas dimensions to match its rendered size
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;

			const scaleFactor = canvas.height * heightMultiplier;

			const context = canvas.getContext("2d");
			if (context) {
				// Drawing logic
				const gradient = context.createLinearGradient(
					0,
					canvas.height,
					0,
					canvas.height - scaleFactor
				);
				gradient.addColorStop(0.88, "rgba(89, 255, 0, .2)");
				gradient.addColorStop(0, "rgba(255, 0, 0, .2)");

				context.fillStyle = gradient;

				context.fillRect(0, canvas.height, canvas.width, -scaleFactor);
				context.fillRect(
					canvas.width / 4,
					canvas.height,
					canvas.width,
					-scaleFactor
				);
				context.fillRect(
					(canvas.width / 4) * 2,
					canvas.height,
					canvas.width,
					-scaleFactor
				);
				context.fillRect(
					(canvas.width / 4) * 3,
					canvas.height,
					canvas.width,
					-scaleFactor
				);

				const frontGradient = context.createLinearGradient(
					0,
					canvas.height,
					0,
					canvas.height - scaleFactor
				);
				frontGradient.addColorStop(0.88, "rgba(89, 255, 0, 1)");
				frontGradient.addColorStop(0, "rgba(255, 0, 0, 1)");

				context.fillStyle = frontGradient;

				context.fillRect(
					0,
					canvas.height,
					canvas.width / 4,
					Math.abs(S1) * -scaleFactor
				);
				context.fillRect(
					canvas.width / 4,
					canvas.height,
					canvas.width / 4,
					Math.abs(S2) * -scaleFactor
				);
				context.fillRect(
					(canvas.width / 4) * 2,
					canvas.height,
					canvas.width / 4,
					Math.abs(S3) * -scaleFactor
				);
				context.fillRect(
					(canvas.width / 4) * 3,
					canvas.height,
					canvas.width / 4,
					Math.abs(S4) * -scaleFactor
				);
			}
		}
	}, [S1, S2, S3, S4]);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: "100%", height: "100%" }} // Ensure it scales with the container
		/>
	);
}

function SuspensionGauge({ S1, S2, S3, S4 }: suspensionInfo) {
	return (
		<div className="w-full h-full bg-white/10 rounded-[4%] overflow-hidden">
			<SuspensionCanvas S1={S1} S2={S2} S3={S3} S4={S4} />
		</div>
	);
}

export default SuspensionGauge;
