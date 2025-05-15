import { Box, RangeSlider, RangeSliderValue } from "@mantine/core";
import { CaretDoubleRight, Pause, Play } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDataMethods } from "../data-processing/DataMethodsProvider";
import DataSourceType from "@/models/DataSourceType";
import useDebounceCallbackGreedy from "../utils/useGreedyDebounce";
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
    const [enabled, setEnabled] = useState(false);
    const [visible, setVisible] = useState(false);
    const { subscribeIsTimelineSynced, setIsTimelineSynced, subscribeDataSource } =
        useDataMethods();
    useEffect(() => {
        const unsub1 = subscribeIsTimelineSynced((isTimelineSynced: boolean) => {
            setEnabled(isTimelineSynced);
        });
        const unsub2 = subscribeDataSource((dataSourceType) => {
            setVisible(dataSourceType == DataSourceType.LIVE);
        });
        return () => {
            unsub1();
            unsub2();
        };
    }, []);
    const setTimelineSynced = () => {
        setEnabled(true);
        setIsTimelineSynced(true, "timelineBar");
    };

    return visible ? (
        <Box c={enabled ? "neutral.9" : "neutral.4"}>
            <CaretDoubleRight
                color="currentColor"
                weight="fill"
                size={24}
                onClick={enabled ? undefined : setTimelineSynced}
            />
        </Box>
    ) : null;
}

function MainSlider() {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [minMax, setMinMax] = useState<RangeSliderValue>([0, 10]);
    const [value, setValue] = useState<RangeSliderValue>([0, 10]);
    const debouncedSetValue = useDebounceCallbackGreedy((value) => {
        setValue(value);
        // console.log(performance.now(), value);
    }, 10);
    const ref = useRef<HTMLDivElement>(null);
    // id is only used to differentiate between who set viewInterval (avoid infinite recursion)
    const id = "timelineBar";

    const {
        setViewInterval,
        subscribeDataSource,
        subscribeNumRows,
        subscribeViewInterval,
        subscribeDataInterval,
        viewIntervalRef,
        dataArraysRef,
        // setCursorPosition, // eventually?
    } = useDataMethods();

    useEffect(() => {
        const unsub1 = subscribeDataInterval(([left, right]) => {
            setMinMax([left, right]);
        });
        const unsub2 = subscribeDataSource((dataSource: DataSourceType) => {
            setDisabled(dataSource == DataSourceType.NONE);
        });
        const unsub3 = subscribeViewInterval((range, setterID) => {
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

    const onChange = (range: RangeSliderValue) => {
        if (range[1] == viewIntervalRef.current[1]) {
            // console.log("range[1] ==", range[1], "== value[1] ==", viewIntervalRef.current[1]);
        } else {
            // console.log(
            //     "range[1] ==",
            //     range[1],
            //     "=/= value[1] ==",
            //     viewIntervalRef.current[1],
            // );
        }

        setValue(range);
        setViewInterval(range, id);

        // const val = dataArraysRef.current[timeColumnName]![range[0]];
        // console.log("idx:", range[0], val, dataArraysRef.current[":Time"]);
        // console.log("timeline setting range:", range);
    };

    const sliderStyles = useMemo(
        () => ({
            bar: {
                width: "calc(var(--slider-bar-width) + var(--slider-size))",
            },
        }),
        [],
    );

    const formatLabel = (idx: number) => {
        const val = dataArraysRef.current[timeColumnName]![idx];

        // console.log("idx:", idx, val, dataArraysRef.current[":Time"]);
        return val !== undefined ? val.toFixed(2) : "???";
    };

    return (
        <>
            <RangeSlider
                ref={ref}
                step={1} // timeline _only_ refers to indexes into data arrays, so must be integers only
                disabled={disabled}
                onChange={onChange}
                // it's right around the corner I can feel it...
                min={minMax[0]}
                max={minMax[1]}
                minRange={1}
                maxRange={minMax[1] - minMax[0]}
                value={value}
                styles={sliderStyles}
                label={formatLabel}
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
