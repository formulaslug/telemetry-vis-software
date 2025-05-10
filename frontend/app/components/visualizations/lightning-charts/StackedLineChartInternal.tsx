"use client";
import React, { useContext, useEffect, useId, useRef } from "react";
import {
    emptyFill,
    AxisScrollStrategies,
    SolveResultSampleXY,
    CursorTargetChangedEvent,
    AxisTickStrategies,
    SolidFill,
    PointLineAreaSeries,
    LegendBoxBuilders,
    UIDraggingModes,
    UIOrigins,
    Axis,
    emptyLine,
    LegendBox,
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
import { StackedLineChartConfig } from "./StackedLineChart";

export default function StackedLineChartInternal({
    yAxesInfo,
    xAxisInfo,
    title,
    showLegend,
}: StackedLineChartConfig) {
    const id = useId();
    const {
        subscribeDataSource,
        subscribeIsTimelineSynced,
        subscribeViewInterval,
        subscribeReset,
        subscribeLatestArrays,
        setCursor,
        setViewInterval,
        dataSourceRef,
        dataArraysRef,
        isTimelineSyncedRef,
        numRowsRef,
        setIsTimelineSynced,
    } = useDataMethods();
    const containerRef = useRef(null);
    const lc = useContext(LightningChartsContext);

    const legendRef = useRef<LegendBox>(null);

    useEffect(() => {
        if (!containerRef.current || !lc) return;

        // based on https://lightningchart.com/js-charts/docs/features/axis/#stacked-axes

        let chart = lc.ChartXY({
            container: containerRef.current,
            theme: globalTheme,
            // highPrecision is necessary for high zoom at large timestamps
            defaultAxisX: { type: "linear-highPrecision" },
        });
        // Remove the default y axis (we add ours below)
        chart.yAxis.dispose();

        // List of objects containing Y Axes and their respective
        // columns-to-lineseries mappings (there can be multiple stacked yAxes,
        // and each one can have multiple series attached).
        let yAxisSeriesMapList: {
            axis: Axis;
            seriesMap: Record<ColumnName, PointLineAreaSeries>;
        }[] = [];
        for (const [i, axisInfo] of yAxesInfo.entries()) {
            const axisY = chart
                .addAxisY({ iStack: i })
                .setMargins(i > 0 ? 15 : 0, i < yAxesInfo.length - 1 ? 15 : 0);

            let lineSeriesMap = axisInfo.columnNames.reduce(
                (acc, colName) => {
                    acc[colName] = chart
                        .addPointLineAreaSeries({
                            dataPattern: "ProgressiveX",
                            dataStorage: Float32Array,
                            // allowInputModification: false
                            axisY,
                        })
                        .setName(colName)
                        .setMaxSampleCount({ max: MAX_DATA_ROWS, mode: "auto" })
                        .setAreaFillStyle(emptyFill);
                    // Populate with already available data if there is any
                    if (numRowsRef.current > 0) {
                        acc[colName].setSamples({
                            xValues: dataArraysRef.current[xAxisInfo.columnName]!,
                            yValues: dataArraysRef.current[colName]!,
                        });
                    }
                    return acc;
                },
                {} as Record<ColumnName, PointLineAreaSeries>,
            );
            yAxisSeriesMapList.push({ axis: axisY, seriesMap: lineSeriesMap });
        }

        // Adds a legend that always stays in the top left corner but is also draggable
        let legend = chart
            .addLegendBox(LegendBoxBuilders.VerticalLegendBox, chart.coordsRelative)
            .setOrigin(UIOrigins.LeftTop)
            .setMargin(10)
            .setDraggingMode(UIDraggingModes.draggable)
            .setVisible(showLegend ?? false)
            // adds everything from the chart that supports it to the legend
            .add(chart);
        legendRef.current = legend;
        chart.addEventListener("layoutchange", (event) => {
            legend.setPosition({
                x: event.margins.left,
                y: event.chartHeight - event.margins.top,
            });
        });

        chart.setTitle(title ?? "");
        chart.setCursor((cursor) =>
            cursor.setTickMarkerYVisible(false).setGridStrokeYStyle(emptyLine),
        );

        chart
            .getDefaultAxisX()
            .setUnits(xAxisInfo.units)
            .setTitle(xAxisInfo.label ?? xAxisInfo.columnName[0]);
        yAxesInfo.forEach((aInfo, i) =>
            yAxisSeriesMapList[i].axis
                .setUnits(aInfo.units)
                .setTitle(aInfo.label ?? aInfo.columnNames.join(", "))
                .setScrollStrategy(AxisScrollStrategies.fitting),
        );

        chart
            .getDefaultAxisX()
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

        // Do we need to customize user interactions at all? Or are the defaults
        // good enough?
        // const defaultUserInteractions: Partial<AxisXYUserInteractions> = {
        //     pan: {
        //         lmb: false,
        //         rmb: {},
        //     },
        //     zoom: {
        //         rmb: false,
        //         wheel: { mode: "toward-pointer" },
        //     },
        //     rectangleZoom: {
        //         lmb: {},
        //         rmb: false,
        //         stopScroll: true,
        //     },
        //     restoreDefault: { doubleClick: true },
        // };
        // chart.setUserInteractions(defaultUserInteractions);
        // chart.setAnimationsEnabled(false); // do we like animations?

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

            // Ask the chart where the nearest points are to the client coords.
            // We simply get the first series of the first Y-axis and ask that.
            const series = Object.values(yAxisSeriesMapList[0].seriesMap)[0];
            const startSample = series.solveNearest(startClientCoords);
            const endSample = series.solveNearest(endClientCoords);

            if (startSample && endSample) {
                const dataIndexes: [left: number, right: number] = [
                    startSample.iSample,
                    endSample.iSample,
                ];

                // TODO: maybe only set the main viewInterval if we have pointer
                // focus and the viewWidth itself changed?
                // also, maybe chart.seriesBackground.addEventListener("") ?
                // const [oldStart, oldEnd] = viewIntervalRef.current;
                // if (!isTimelineSyncedRef.current || start - end == oldStart - oldEnd) {
                // }

                // console.log("lcjs setting: ", idRef.current);
                setViewInterval(dataIndexes, `lcjs-${id}`);
            }
        });

        // This event triggers every time the chart detects that its interval
        // should start/stop "scrolling" (for live data). We update our internal
        // isTimelineSynced state when that changes.
        chart.getDefaultAxisX().addEventListener("stoppedchange", ({ isStopped }) => {
            // If scrolling, we want to zoom to the right, otherwise zoom
            // towards the pointer
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
            // ATM we simply ignore updates to viewEdges from dataProvider
            // because lcjs automatically updates its interval on data changes

            // console.log(`${idRef.current} receiving update: from ${setterID}, updating self? ${!(setterID === `lcjs-${idRef.current}` || setterID === "dataProvider")}`);
            if (setterID === `lcjs-${id}` || setterID === "dataProvider") return;

            chart.getDefaultAxisX().setInterval({
                start: dataArraysRef.current[timeColumnName]![left],
                end: dataArraysRef.current[timeColumnName]![right - 1],
                stopAxisAfter: false,
                animate: false,
            });
        });
        const unsub2 = subscribeLatestArrays((latest: DataArraysTyped) => {
            for (const { seriesMap } of yAxisSeriesMapList) {
                for (const [colName, series] of Object.entries(seriesMap)) {
                    series.appendSamples({
                        xValues: latest[xAxisInfo.columnName]!,
                        yValues: latest[colName as ColumnName]!,
                    });
                }
            }
        });
        const unsub3 = subscribeReset(() => {
            yAxisSeriesMapList.forEach(({ seriesMap }) => {
                Object.values(seriesMap).forEach((s) => s.clear());
            });
        });
        const unsub4 = subscribeDataSource((dataSource: DataSourceType) => {
            // If no data is loaded, don't show (incorrect) tick labels
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
        });
        const unsub5 = subscribeIsTimelineSynced(
            (isTimelineSynced: boolean, setterID: string) => {
                if (setterID === `lcjs-${id}`) return;
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
            yAxisSeriesMapList.forEach(({ seriesMap }) => {
                Object.values(seriesMap).forEach((series) => {
                    series.dispose();
                    // @ts-ignore: for GC
                    series = undefined;
                });
            });
        };
    }, [lc, xAxisInfo, yAxesInfo]);

    useEffect(() => {
        legendRef.current?.setVisible(showLegend ?? false);
    }, [showLegend]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
