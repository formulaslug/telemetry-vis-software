import { ActionIcon, Box, RangeSlider, RangeSliderValue } from "@mantine/core";
import { ArrowFatLinesRight, Pause, Play } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDataMethods } from "../data-processing/DataMethodsProvider";
import DataSourceType from "@/models/DataSourceType";
import { timeColumnName } from "../data-processing/datatypes";

export default function TimelineBar() {
    const [paused, setPaused] = useState(true);

    return (
        <>
            <div className="flex flex-row w-full items-center bg-background-2 p-5 gap-x-3">
                <div
                    className="hover:cursor-pointer"
                    onClick={() => {
                        setPaused(!paused);
                    }}
                >
                    {paused ? <Play weight="fill" /> : <Pause weight="fill" />}
                </div>
                <div className="grow">
                    <MainSlider />
                </div>
                <SyncButton />
            </div>
        </>
    );
}

function SyncButton() {
    const [isTimelineSynced, setIsTimelineSynced] = useState(false);
    const { subscribeIsTimelineSynced } = useDataMethods();
    useEffect(() => {
        return subscribeIsTimelineSynced((isTimelineSynced: boolean) => {
            setIsTimelineSynced(isTimelineSynced);
        });
    }, []);
    const toggleIsTimelineSynced = useCallback(() => setIsTimelineSynced(!isTimelineSynced), []);

    return (
        <Box c={isTimelineSynced ? "neutral.8" : "neutral.5"}>
            <ArrowFatLinesRight color="currentColor" weight="fill" onClick={toggleIsTimelineSynced} />
        </Box>
    );
}

function MainSlider() {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [minMax, setMinMax] = useState<RangeSliderValue>([0, 10]); // timestamp (seconds)
    const [value, setValue] = useState<RangeSliderValue>([0, 10]);
    const debouncedSetValue = useGreedyDebounce((value) => setValue(value), 10);
    const ref = useRef<HTMLDivElement>(null);
    // id is only used to differentiate between who set viewEdges (avoid infinite recursion)
    const id = "timelineBar";

    const {
        setViewEdges,
        subscribeFullArrays,
        subscribeDataSource,
        subscribeNumRows,
        subscribeViewEdges,
        getViewEdgesRef,
        // setCursorPosition, // eventually?
    } = useDataMethods();

    // useEffect(() => {
    //     console.log("Updated minMax:", minMax);
    // }, [minMax]); // Runs whenever minMax updates

    useEffect(() => {
        const unsub1 = subscribeFullArrays((fullArrays) => {
            const timeCol = fullArrays[timeColumnName];
            // Need at least one point to set min/max!
            if (timeCol && timeCol.length > 0) {
                // Give 0.5s padding on either side
                setMinMax([timeCol[0] - 0.5, timeCol[timeCol.length - 1] + 0.5]);
                // console.log([timeCol[0] - 0.5, timeCol[timeCol.length - 1] + 0.5]);
            }
        });
        const unsub2 = subscribeDataSource((dataSource: DataSourceType) => {
            // setDisabled(dataSource == DataSourceType.NONE);
        });
        const unsub3 = subscribeViewEdges((range, setterID) => {
            // console.log(range, setterID, minMax);
            if (setterID === id) return;
            // New data shouldn't come in fast enough to warrant debouncing
            if (setterID === "dataProvider") setValue(range);
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

    const onChange = useCallback((range: RangeSliderValue) => {
        const viewEdgesRef = getViewEdgesRef();
        if (range[1] == viewEdgesRef.current[1]) {
            console.log("range[1] ==", range[1], "== value[1] ==", viewEdgesRef.current[1]);
        } else {
            console.log("range[1] ==", range[1], "=/= value[1] ==", viewEdgesRef.current[1]);
        }
        setValue(range);
        setViewEdges(range, id);
    }, []);

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
                onChange={onChange}
                // it's right around the corner I can feel it...
                min={55000} // min={minMax[0]}
                max={58000} // max={minMax[1]}
                minRange={10}
                // maxRange ??
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

    const debouncedFunc = useCallback(
        (...args: Parameters<T>) => {
            if (!isCooldownRef.current) {
                func(...args);
                isCooldownRef.current = true;
                timeoutRef.current = window.setTimeout(() => {
                    isCooldownRef.current = false;
                }, delay);
            }
        },
        [func, delay],
    );

    useEffect(() => {
        return () => {
            window.clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedFunc;
}
