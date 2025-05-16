"use client";

import { RangeSlider, RangeSliderProps, RangeSliderValue } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface DraggableRangeSliderProps extends RangeSliderProps {
    draggableBarHeightPx?: number;
    value: RangeSliderValue;
    min: number;
    max: number;
    onChange: (value: RangeSliderValue) => void;
}

export default function DraggableRangeSlider({
    draggableBarHeightPx,
    value,
    onChange,
    min,
    max,
    ...props
}: DraggableRangeSliderProps) {
    const [range, setRange] = [value, onChange];

    const draggingRef = useRef(false);
    const lastMouseX = useRef(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        draggingRef.current = true;
        console.log("TES");
        lastMouseX.current = event.clientX;
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!draggingRef.current || !sliderRef.current) return;

        event.preventDefault();

        const deltaX = event.clientX - lastMouseX.current;
        lastMouseX.current = event.clientX;

        // Convert pixels to range values proportionally
        const sliderWidth = sliderRef.current.clientWidth;
        const rangeWidth = max; // Assuming the slider goes from 0 to 10
        const scaleFactor = rangeWidth / sliderWidth; // Converts pixels to value change

        const deltaValue = deltaX; // Smooth movement

        const [start, end] = range;

        let newStart = start + deltaValue;
        let newEnd = end + deltaValue;

        // Prevent exceeding min/max limits
        if (newStart < 0) {
            newStart = 0;
            newEnd = end - start; // Maintain width
        }
        if (newEnd > max) {
            newEnd = 100;
            newStart = newEnd - (end - start); // Maintain width
        }

        setRange([newStart, newEnd]);
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [max]);

    return (
        <div className="relative w-full">
            <RangeSlider
                ref={sliderRef}
                value={range}
                onChange={setRange}
                min={min}
                max={max}
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
                    width: `${((range[1] - range[0]) / max) * 100}%`,
                    left: `${(range[0] / max) * 100}%`,
                    height: "20px", // Make it easy to grab
                    // backgroundColor: "transparent",
                    zIndex: 10,
                    top:
                        -(20 - (sliderRef.current ? sliderRef.current.offsetHeight : 0)) / 2 +
                        20,
                }}
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
                    handleMouseDown(e as unknown as MouseEvent)
                }
            />
        </div>
    );
}
