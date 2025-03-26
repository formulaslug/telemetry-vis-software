"use client";
import React, { useContext, useEffect, useId, useRef, useState } from "react";
import {
    emptyFill,
    PointLineAreaSeries,
    ChartXY,
    AxisScrollStrategies,
    synchronizeAxisIntervals,
    SolveResultSampleXY,
    CursorTargetChangedEvent,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { ColumnName } from "@/app/data-processing/datatypes";

interface LineChartLightningProps {
    keyName: ColumnName;
}
export default function LineChartLightning({ keyName }: LineChartLightningProps) {
    const id = useId();
    const lc = useContext(LightningChartsContext);
    const {
        subscribeViewInterval,
        setCursor,
        setViewInterval,
        dataSetsRef,
        viewIntervalRef,
        setIsTimelineSynced,
        isTimelineSyncedRef,
    } = useDataMethods();
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container || !lc) return;

        let chart = lc.ChartXY({ container, theme: globalTheme });
        let lineSeries = chart
            .addPointLineAreaSeries({
                dataPattern: "ProgressiveX",
            })
            .setDataSet(dataSetsRef.current[keyName])
            .setAreaFillStyle(emptyFill);

        chart
            .getDefaultAxisX()
            .setScrollStrategy(AxisScrollStrategies.progressive)
            .setUserInteractions({
                pan: {
                    lmb: { drag: {} },
                    rmb: {},
                },
                zoom: {
                    lmb: {},
                    rmb: { drag: {} },
                    wheel: {},
                },
                restoreDefault: { doubleClick: true },
            });

        // TODO: synchronizeAxisIntervals

        chart.getDefaultAxisX().addEventListener("intervalchange", ({ start, end }) => {
            // TODO: maybe only set the main viewEdges interval if we have
            // pointer focus and the viewWidth itself changed?
            const [oldStart, oldEnd] = viewIntervalRef.current;
            if (!isTimelineSyncedRef.current || (start-end == oldStart-oldEnd)) {
                
            }
            setViewInterval([start, end], "lcjs");
        });
        chart.getSeries().forEach((s) => s.addEventListener("dblclick", (e) => {
            setIsTimelineSynced(true);
        }));
        chart.addEventListener("cursortargetchange", (event) => {
            const { hit, hits, mouseLocation } =
                event as CursorTargetChangedEvent<SolveResultSampleXY>;
            // const axisCoordinates = chart.translateCoordinate(mouseLocation, chart.coordsAxis);
            // chart.getSeries()[0].solveNearest(mouseLocation, );

            // In live data mode, this will be replaced with the latest data row by dataProvider.
            // In recording mode, cursorRow should be valid only when there's a cursor hit, so we make it null here.
            setCursor(hit ? hit.iSample : null);
        });
        const unsub = subscribeViewInterval(([left, right], setterID) => {
            // console.log( // intervals
            //     "ours:",
            //     left,
            //     right,
            //     "lcs:",
            //     lineSeries.axisX.getInterval().start,
            //     lineSeries.axisX.getInterval().end,
            // );
            // ATM we simply ignore updates to viewEdges from dataProvider
            // because lcjs automatically updates its interval on data changes
            if (setterID === "lcjs" || setterID === "dataProvider") return;
            lineSeries.axisX.setInterval({
                start: left,
                end: right,
                stopAxisAfter: false,
            });
            // lineSeries.axisX.setIntervalRestrictions({ startMin: left, endMax: right + 1 });
        });

        return () => {
            unsub();
            chart.dispose();
            lineSeries.dispose();
            // @ts-ignore: for GC
            chart = undefined;
            // @ts-ignore: for GC
            lineSeries = undefined;
        };
    }, [id, lc, keyName]); // todo: is having `id` here necessary?

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
