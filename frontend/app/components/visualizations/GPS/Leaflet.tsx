import { ChartXY } from "@lightningchart/lcjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LeafletDark.css";
import { RefObject, useCallback, useEffect, useId, useRef } from "react";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";

interface Props {
    chartRef: RefObject<ChartXY | null>;
}
export default function Leaflet({ chartRef }: Props) {
    const { subscribeDataSource, numRowsRef } = useDataMethods();
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useId();

    const setLCJSInterval = useCallback(() => {
        if (mapRef.current) {
            const bounds = mapRef.current.getBounds();
            const sw = bounds.getSouthWest(); // bottom-left
            const ne = bounds.getNorthEast(); // top-right
            if (chartRef.current) {
                chartRef.current.getDefaultAxisX().setInterval({ start: sw.lng, end: ne.lng });
                chartRef.current.getDefaultAxisY().setInterval({ start: sw.lat, end: ne.lat });
            }
        }
    }, []);

    useEffect(() => {
        if (mapRef.current || !containerRef.current) return;

        const map = L.map(containerRef.current, {
            zoomDelta: 0.2,
            zoomSnap: 0.1,
        }).setView([36.9905, -122.0584], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 22,
            maxNativeZoom: 18,
        }).addTo(map);

        mapRef.current = map;

        // When the parent container changes size, recalculate bounds
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(containerRef.current);

        const unsub = subscribeDataSource(() => {
            const series = chartRef.current?.getSeries()[0];
            const latMin = series?.getYMin();
            const latMax = series?.getYMax();
            const lngMin = series?.getXMin();
            const lngMax = series?.getXMax();
            if (lngMin && lngMax && latMin && latMax && numRowsRef.current > 0) {
                map.fitBounds([
                    [latMin, lngMin],
                    [latMax, lngMax],
                ]);
            }
        });

        map.on("move", () => setLCJSInterval());
        // map.on("zoomanim", () => {setLCJSInterval(map.getBounds()); console.log("zoomanim")}); // doesn't seem to do much
        map.on("resize", () => setLCJSInterval());

        return () => {
            unsub();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
            resizeObserver.disconnect();
        };
    }, []);

    return <div ref={containerRef} id={id} style={{ height: "100%", width: "100%" }}></div>;
}
