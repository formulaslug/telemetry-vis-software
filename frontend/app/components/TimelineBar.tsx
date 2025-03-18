import { RangeSlider, RangeSliderValue } from "@mantine/core";
import { Pause, Play } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import DraggableRangeSlider from "./DraggableRangeSlider";
import { useDataMethods } from "../data-processing/DataMethodsProvider";
import DataSourceType from "@/models/DataSourceType";
import { timeColumnName } from "../data-processing/datatypes";
import { useDebouncedCallback } from "@mantine/hooks";

export default function TimelineBar() {
    const [paused, setPaused] = useState(true);

    return (
        <>
            <div className="flex flex-row w-full items-center bg-background-2 p-3">
                <div
                    className="p-2 hover:cursor-pointer"
                    onClick={() => {
                        setPaused(!paused);
                    }}
                >
                    {paused ? <Play weight="fill" /> : <Pause weight="fill" />}
                </div>
                <div className="grow">
                    <MainSlider />
                </div>
            </div>
        </>
    );
}

function MainSlider() {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [minMax, setMinMax] = useState<RangeSliderValue>([0, 10]); // timestamp (seconds)
    const [value, setValue] = useState<RangeSliderValue>([0, 10]);
    const debouncedSetValue = useGreedyDebounce((value) => setValue(value), 10);
    const ref = useRef<HTMLDivElement>(null);
    // id is only used to differentiate between who set viewEdges (avoid infinite recursion)
    const id = useId();

    const {
        setViewEdges,
        subscribeFullArrays,
        subscribeDataSource,
        subscribeNumRows,
        subscribeViewEdges,
        // setCursorPosition, // eventually?
    } = useDataMethods();

    useEffect(() => {
        const unsub1 = subscribeFullArrays((fullArrays) => {
            const timeColumn = fullArrays[timeColumnName];
            if (timeColumn && timeColumn.length > 0) {
                setMinMax([timeColumn[0], timeColumn[timeColumn.length - 1]]);
            }
        });
        const unsub2 = subscribeDataSource((dataSource: DataSourceType) => {
            // setDisabled(dataSource == DataSourceType.NONE);
        });
        const unsub3 = subscribeViewEdges((range, setterID) => {
            if (setterID === id) return;
            console.log("hi!!", setterID, id);
            
            // TODO: this debouncing is a very acceptable compromise between
            // choppy-looking synchronization and performance penalties. But I
            // wonder if it's possible to hack in some native CSS animations
            // between values (using Mantine's Styles API) to smoothen out lower
            // update frequencies? (Future investigation maybe)
            debouncedSetValue(range);
        });
        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }, []);

    const updateViewEdges = useCallback(
        (range: RangeSliderValue) => setViewEdges(range, id),
        [],
    );

    const sliderStyles = useMemo(
        () => ({
            bar: {
                width: "calc(var(--slider-bar-width) + var(--slider-size))",
            },
        }),
        [],
    );

    return (
        <>
            <RangeSlider
                ref={ref}
                step={0.01} // 100Hz == 0.01s per point
                disabled={disabled}
                onChange={updateViewEdges}
                // it's right around the corner I can feel it...
                min={minMax[0]}
                max={minMax[1]}
                minRange={1}
                value={value}
                styles={sliderStyles}
            />
            {/* <DraggableRangeSlider */}
            {/*     value={sliderRange} */}
            {/*     onChange={setSliderRange} */}
            {/*     min={0} */}
            {/*     max={100} */}
            {/*     step={1} */}
            {/*     size={8} */}
            {/*     thumbSize={6} */}
            {/* /> */}
        </>
    );
}

function useGreedyDebounce<T extends (...args: any[]) => any>(func: T, delay: number) {
    const timeoutRef = useRef<number>();
    const isCooldownRef = useRef(false);

    const debouncedFunc = useCallback((...args: Parameters<T>) => {
        if (!isCooldownRef.current) {
            func(...args);
            isCooldownRef.current = true;
            timeoutRef.current = window.setTimeout(() => {
                isCooldownRef.current = false;
            }, delay);
        }
    }, [func, delay]);

    useEffect(() => {
        return () => {
            window.clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedFunc;
}
