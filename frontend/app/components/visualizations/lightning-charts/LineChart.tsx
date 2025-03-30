"use client";
import React, { useContext, useEffect, useId, useRef } from "react";
import {
    emptyFill,
    AxisScrollStrategies,
    synchronizeAxisIntervals,
    SolveResultSampleXY,
    CursorTargetChangedEvent,
    AxisXYUserInteractions,
    AxisTickStrategies,
    SolidFill,
    FontSettings,
    PointLineAreaSeries,
    LegendBoxBuilders,
    UIDraggingModes,
    UIOrigins,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import {
    ColumnName,
    DataArraysTyped,
    MAX_DATA_ROWS,
    timeColumnName,
} from "@/app/data-processing/datatypes";
import DataSourceType from "@/models/DataSourceType";

interface LineChartProps {
    yAxisColumns: ColumnName[];
    yAxisTitle?: string;
    yAxisUnits?: string; // todo: get this from some server http api that uses CAN dbc

    xAxisColumn?: ColumnName;
    xAxisTitle?: string;
    xAxisUnits?: string; // todo: get this from some server http api that uses CAN dbc

    title?: string;
}
export default function LineChart({
    yAxisColumns,
    yAxisTitle = yAxisColumns.join(", "),
    yAxisUnits,

    xAxisColumn = timeColumnName,
    xAxisTitle = xAxisColumn,
    xAxisUnits,

    title = yAxisTitle,
}: LineChartProps) {
    const id = useId();
    const {
        subscribeDataSource,
        subscribeIsTimelineSynced,
        subscribeViewInterval,
        subscribeReset,
        subscribeLatestArrays,
        setCursor,
        setViewInterval,
        viewIntervalRef,
        dataSourceRef,
        dataArraysRef,
        isTimelineSyncedRef,
        numRowsRef,
        setIsTimelineSynced,
    } = useDataMethods();
    const containerRef = useRef(null);
    const lc = useContext(LightningChartsContext);

    useEffect(() => {
        if (!containerRef.current || !lc) return;

        let chart = lc.ChartXY({ container: containerRef.current, theme: globalTheme });
        let lineSeriesMap = yAxisColumns.reduce(
            (acc, colName) => {
                acc[colName] = chart
                    .addPointLineAreaSeries({
                        dataPattern: "ProgressiveX",
                        dataStorage: Float32Array,
                        // allowInputModification: false
                    })
                    .setName(colName)
                    .setMaxSampleCount({ max: MAX_DATA_ROWS, mode: "auto" })
                    .setAreaFillStyle(emptyFill);
                // Populate with already available data if there is any
                if (numRowsRef.current > 0) {
                    acc[colName].setSamples({
                        xValues: dataArraysRef.current[xAxisColumn]!,
                        yValues: dataArraysRef.current[colName]!,
                    });
                }
                return acc;
            },
            {} as Record<ColumnName, PointLineAreaSeries>,
        );

        // Adds a legend that always stays in the top left corner but is also draggable
        let legend = chart
            .addLegendBox(LegendBoxBuilders.VerticalLegendBox, chart.coordsRelative)
            .setOrigin(UIOrigins.LeftTop)
            .setMargin(10)
            .setDraggingMode(UIDraggingModes.draggable)
            .add(chart);
        chart.addEventListener("layoutchange", (event) => {
            legend.setPosition({
                x: event.margins.left,
                y: event.chartHeight - event.margins.top,
            });
        });

        chart.setTitle(title);

        if (xAxisUnits) chart.getDefaultAxisX().setUnits(xAxisUnits);
        if (yAxisUnits) chart.getDefaultAxisY().setUnits(yAxisUnits);

        chart
            .getDefaultAxisX()
            .setTitle(xAxisTitle)
            .setScrollStrategy(
                isTimelineSyncedRef.current
                    ? AxisScrollStrategies.progressive
                    : AxisScrollStrategies.fitting,
            )
            .setDefaultInterval((state) => ({
                start: state.dataMin,
                end: state.dataMax,
                stopAxisAfter: dataSourceRef.current != DataSourceType.LIVE,
            }))
            .setIntervalRestrictions((state) => ({
                startMin: state.dataMin,
                endMax: state.dataMax,
            }));
        chart
            .getDefaultAxisY()
            .setTitle(yAxisTitle)
            .setScrollStrategy(AxisScrollStrategies.fitting);

        const defaultUserInteractions: Partial<AxisXYUserInteractions> = {
            // pan: {
            //     lmb: false,
            //     rmb: {},
            // },
            // zoom: {
            //     rmb: false,
            //     wheel: { mode: "toward-pointer" },
            // },
            // rectangleZoom: {
            //     lmb: {},
            //     rmb: false,
            //     stopScroll: true,
            // },
            // restoreDefault: { doubleClick: true },
        };

        // chart.setUserInteractions(defaultUserInteractions);

        // TODO: synchronizeAxisIntervals

        chart.getDefaultAxisX().addEventListener("intervalchange", ({ start, end }) => {
            // start/end are "axis coordinates" but chart.solveNearest() expects
            // "client coordinates". So first we translate between them.
            const xAxisCoordToClientCoord = (c: number) =>
                chart.translateCoordinate(
                    { x: c, y: 0 },
                    chart.coordsAxis,
                    chart.coordsClient,
                );
            const startClientCoords = xAxisCoordToClientCoord(start);
            const endClientCoords = xAxisCoordToClientCoord(end);

            // Ask the chart where the nearest points are to those client coords
            const startSample = lineSeriesMap[yAxisColumns[0]].solveNearest(startClientCoords);
            const endSample = lineSeriesMap[yAxisColumns[0]].solveNearest(endClientCoords);

            if (startSample && endSample) {
                const dataIndexes: [left: number, right: number] = [
                    startSample.iSample,
                    endSample.iSample,
                ];

                // TODO: maybe only set the main viewInterval if we have pointer
                // focus and the viewWidth itself changed?
                // also, maybe chart.seriesBackground.addEventListener("") ?
                const [oldStart, oldEnd] = viewIntervalRef.current;
                if (!isTimelineSyncedRef.current || start - end == oldStart - oldEnd) {
                }
                setViewInterval(dataIndexes, "lcjs");
            }
        });

        chart.getDefaultAxisX().addEventListener("stoppedchange", ({ isStopped }) => {
            chart.setUserInteractions({
                zoom: {
                    wheel: {
                        mode:
                            dataSourceRef.current == DataSourceType.LIVE && !isStopped
                                ? "keep-end"
                                : "toward-pointer",
                    },
                },
            });

            setIsTimelineSynced(!isStopped, "lcjs");
        });

        chart.addEventListener("cursortargetchange", (event) => {
            const { hit } = event as CursorTargetChangedEvent<SolveResultSampleXY>;

            // In live data mode, this will be replaced with the latest data row by dataProvider.
            // In recording mode, cursorRow should be valid only when there's a cursor hit, so we make it null here.
            setCursor(hit ? hit.iSample : null);
        });
        const unsub1 = subscribeViewInterval(([left, right], setterID) => {
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
            console.log(
                "lcjs setting interval:",
                dataArraysRef.current[timeColumnName]![left],
                dataArraysRef.current[timeColumnName]![right - 1],
                numRowsRef.current,
            );

            chart.getDefaultAxisX().setInterval({
                start: dataArraysRef.current[timeColumnName]![left],
                end: dataArraysRef.current[timeColumnName]![right - 1],
                stopAxisAfter: false,
                animate: false,
            });
        });
        const unsub2 = subscribeLatestArrays((latest: DataArraysTyped) => {
            Object.entries(lineSeriesMap).forEach(([colName, lineSeries]) => {
                lineSeries.appendSamples({
                    xValues: latest[xAxisColumn]!,
                    yValues: latest[colName as ColumnName]!,
                });
            });

            chart.getDefaultAxisX().setIntervalRestrictions((state) => ({
                startMin: state.dataMin,
                endMax: state.dataMax,
            }));
        });
        const unsub3 = subscribeReset(() => {
            Object.entries(lineSeriesMap).forEach(([_, lineSeries]) => lineSeries.clear());
        });
        const unsub4 = subscribeDataSource((dataSource: DataSourceType) => {
            if (dataSource == DataSourceType.NONE) {
                chart
                    .getAxes()
                    .forEach((a) =>
                        a.setTickStrategy(AxisTickStrategies.Numeric, (strategy) =>
                            strategy.setTickStyle((ticks) =>
                                ticks.setLabelFillStyle(emptyFill),
                            ),
                        ),
                    );
            } else {
                chart
                    .getAxes()
                    .forEach((a) =>
                        a.setTickStrategy(AxisTickStrategies.Numeric, (strategy) =>
                            strategy.setTickStyle((ticks) =>
                                ticks.setLabelFillStyle(new SolidFill()),
                            ),
                        ),
                    );

                if (dataSource == DataSourceType.LIVE) {
                    chart
                        .getDefaultAxisX()
                        .setScrollStrategy(AxisScrollStrategies.progressive);
                }
            }
            // chart.getAxes().forEach((a) => a.fit(false, false));
        });
        const unsub5 = subscribeIsTimelineSynced(
            (isTimelineSynced: boolean, setterID: string) => {
                if (setterID === "lcjs") return;
                console.log(isTimelineSynced, setterID);
                chart.getDefaultAxisX().setStopped(!isTimelineSynced);
                chart.setUserInteractions({
                    zoom: {
                        wheel: { mode: isTimelineSynced ? "keep-end" : "toward-pointer" },
                    },
                });
            },
        );

        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
            unsub5();
            chart.dispose();
            // @ts-ignore: for GC
            chart = undefined;
            Object.entries(lineSeriesMap).forEach(([_, lineSeries]) => {
                lineSeries.dispose();
                // @ts-ignore: for GC
                lineSeries = undefined;
            });
        };
    }, [lc, xAxisColumn, ...yAxisColumns, yAxisTitle]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
