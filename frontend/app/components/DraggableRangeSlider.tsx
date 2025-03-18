import { RangeSlider, RangeSliderProps, RangeSliderValue } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface DraggableRangeSliderProps extends RangeSliderProps {
    draggableBarHeightPx?: number;
    value: RangeSliderValue;
    onChange: (value: RangeSliderValue) => void;
}

export default function DraggableRangeSlider({
    draggableBarHeightPx,
    value,
    onChange,
    ...props
}: DraggableRangeSliderProps) {
    const [range, setRange] = [value, onChange];

    const draggingRef = useRef(false);
    const lastMouseX = useRef(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const width = range[1] - range[0];

    const handleMouseDown = (event: MouseEvent) => {
        draggingRef.current = true;
        lastMouseX.current = event.clientX;
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!draggingRef.current || !sliderRef.current) return;

        const deltaX = event.clientX - lastMouseX.current;
        lastMouseX.current = event.clientX;

        // Convert pixels to range values proportionally
        const sliderWidth = sliderRef.current.clientWidth;
        const rangeWidth = 100; // Assuming the slider goes from 0 to 100
        const scaleFactor = rangeWidth / sliderWidth; // Converts pixels to value change

        const deltaValue = deltaX * scaleFactor; // Smooth movement

        setRange(([start, end]) => {
            let newStart = start + deltaValue;
            let newEnd = end + deltaValue;

            // Prevent exceeding min/max limits
            if (newStart < 0) {
                newStart = 0;
                newEnd = end - start; // Maintain width
            }
            if (newEnd > 100) {
                newEnd = 100;
                newStart = newEnd - (end - start); // Maintain width
            }

            return [newStart, newEnd];
        });
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div ref={sliderRef} className="relative w-full">
            <RangeSlider
                value={range}
                onChange={setRange}
                styles={{
                    track: { cursor: "pointer" },
                    bar: { cursor: "pointer" },
                }}
                {...props}
            />
            {/* Invisible overlay to detect middle drag */}
            <div
                className="absolute top-0 left-0 h-full bg-red-300"
                style={{
                    cursor: "grab",
                    width: `${width - width * 0.1}%`,
                    left: `${range[0] + width * 0.05}%`,
                    height: "20px", // Make it easy to grab
                    backgroundColor: "transparent",
                    zIndex: 10,
                    top: -(20 - (sliderRef.current ? sliderRef.current.offsetHeight : 0)) / 2,
                }}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}
