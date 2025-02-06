import { RefObject, useEffect, useRef, useState } from "react";

export default function getTextSize({
	ref,
}: {
	ref: RefObject<HTMLDivElement>;
}) {
	const [textSize, setTextSize] = useState(1);

	useEffect(() => {
		if (ref) {
			const scaledTextSize = (ref.current?.offsetWidth as number) / 24;
			console.log(scaledTextSize);
			setTextSize(scaledTextSize);
			return () => {
				scaledTextSize;
			};
		}
	}, [ref.current?.offsetWidth as number]);
	return textSize;
}
