"use client";

import {
    createContext,
    Dispatch,
    MutableRefObject,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useRef,
} from "react";
import {
    ColumnName,
    columnNames,
    DataArrays,
    DataArraysTyped,
    DataValues,
    emptyDataArrays,
    nullDataArrays,
} from "./datatypes";
import { getRecording } from "./http";
import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { RecordBatch } from "apache-arrow";
import DataSourceType from "@/models/DataSourceType";

type SubscriptionReset = () => void; // possibly remove in favor of additional arg?
type SubscriptionViewEdges = (viewEdges: [left: number, right: number], setterID: string) => void;
type SubscriptionLatestArraysTyped = (latest: DataArraysTyped) => void;
type SubscriptionLatestArrays = (latest: DataArrays) => void;
type SubscriptionFullArrays = (fullArrays: DataArrays) => void;
type SubscriptionViewableArrays = (viewableArrays: DataArrays) => void;
type SubscriptionCursorTimestamp = (cursorTimestamp: number) => void;
type SubscriptionCursorRow = (cursorRow: DataValues) => void;
type SubscriptionNumRows = (numRows: number) => void;
type SubscriptionDataSource = (dataSourceType: DataSourceType) => void;

type Subscription =
    | SubscriptionReset
    | SubscriptionViewEdges
    | SubscriptionLatestArraysTyped
    | SubscriptionLatestArrays
    | SubscriptionFullArrays
    | SubscriptionViewableArrays
    | SubscriptionCursorTimestamp
    | SubscriptionCursorRow
    | SubscriptionNumRows
    | SubscriptionDataSource;

type DataSubscribers = {
    subscribeReset: (clbk: SubscriptionReset) => () => void;
    subscribeViewEdges: (clbk: SubscriptionViewEdges) => () => void;
    subscribeLatestArraysTyped: (clbk: SubscriptionLatestArraysTyped) => () => void;
    subscribeLatestArrays: (clbk: SubscriptionLatestArrays) => () => void;
    subscribeFullArrays: (clbk: SubscriptionFullArrays) => () => void; // will probably be used by GPS?
    subscribeViewableArrays: (clbk: SubscriptionViewableArrays) => () => void;
    subscribeCursorTimestamp: (clbk: SubscriptionCursorTimestamp) => () => void;
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
    subscribeDataSource: (clbk: SubscriptionDataSource) => () => void;
};
type DataControllers = {
    // timestamp should be an *decimal timestamp*
    setCursorTimestamp: (timestamp: number) => void;
    // *decimal timestamps* referring to *seconds* since car started
    // TODO: should setterID be removed and instead use Set<subscription + ID> below?
    setViewEdges: (viewEdges: [left: number, right: number], setterID: string) => void;
    reset: () => void;

    switchToLiveData: (setIsConnected?: Dispatch<SetStateAction<boolean>>) => void;
    switchToRecording: (filename: string) => void;
};
type DataGetters = {
    getFullArraysRef: () => MutableRefObject<DataArrays>;
    getViewableArraysRef: () => MutableRefObject<DataArrays>;
    getViewEdgesRef: () => MutableRefObject<[left: number, right: number] | null>;
    getNumRowsRef: () => MutableRefObject<number>;
};
type DataMethods = DataSubscribers & DataControllers & DataGetters;

const DataMethodsContext = createContext<DataMethods | null>(null);

export function DataMethodsProvider({ children }: PropsWithChildren) {
    // All data that we've recieved is stored here
    const fullArrays = useRef<DataArrays>(nullDataArrays());
    // Length of fullArrays
    const numRows = useRef<number>(0);
    // What's currently visible (rangeslider)
    const viewableArrays = useRef<DataArrays>(nullDataArrays());
    // These are *decimal timestamps* referring to *seconds* since car started
    const viewEdges = useRef<[left: number, right: number]>([0, 10]);
    // Timestamp value of current cursor position
    const cursorTimestamp = useRef<number>(0);
    // The nearest row of data to the current cursor timestamp
    const cursorRow = useRef<DataValues | null>(null);

    const dataSource = useRef<DataSourceType>(DataSourceType.NONE);

    // const [numRows, setNumRows] = useState<number>(0);
    // const [viewEdges, setViewEdges] = useState<{ left: number; right: number } | null>(null);
    // const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    // const [dataSourceType, setDataSourceType] = useState<DataSourceType>(DataSourceType.NONE);

    // Keep track of callbacks to call for each type of data when it arrives/changes
    const subscriptionsReset = useRef<Set<SubscriptionReset>>(new Set());
    const subscriptionsViewEdges = useRef<Set<SubscriptionViewEdges>>(new Set());
    const subscriptionsLatestArraysTyped = useRef<Set<SubscriptionLatestArraysTyped>>(new Set()); // prettier-ignore
    const subscriptionsLatestArrays = useRef<Set<SubscriptionLatestArrays>>(new Set());
    const subscriptionsFullArrays = useRef<Set<SubscriptionFullArrays>>(new Set());
    const subscriptionsViewableArrays = useRef<Set<SubscriptionViewableArrays>>(new Set());
    const subscriptionsCursorTimestamp = useRef<Set<SubscriptionCursorTimestamp>>(new Set());
    const subscriptionsCursorRow = useRef<Set<SubscriptionCursorRow>>(new Set());
    const subscriptionsNumRows = useRef<Set<SubscriptionNumRows>>(new Set());
    const subscriptionsDataSource = useRef<Set<SubscriptionDataSource>>(new Set());

    // TODO: try going back to the old useMemo arrangement
    const methods: DataMethods = useMemo(() => {
        function makeSubscriber<T extends Subscription>(
            setRef: MutableRefObject<Set<T>>,
            initialTriggerData?: MutableRefObject<Parameters<T>[0] | null>,
        ) {
            return (clbk: T) => {
                setRef.current.add(clbk);
                // If the subscriber specified this capability and the data is
                // already available, make an initial call to the subscription
                // callback with the already available data so that the
                // subscriber doesn't need to wait until the data changes again
                if (initialTriggerData && initialTriggerData.current != null) {
                    // @ts-ignore: the union of multiple functions doesn't
                    // accept calls with only one function's parameters :/
                    // We trust ourselves to set it up correctly below
                    clbk(initialTriggerData.current);
                    
                }
                return () => setRef.current.delete(clbk);
            };
        }

        const subscribeReset = makeSubscriber(subscriptionsReset);
        const subscribeViewEdges = makeSubscriber(subscriptionsViewEdges, viewEdges);
        const subscribeLatestArraysTyped = makeSubscriber(subscriptionsLatestArraysTyped);
        const subscribeLatestArrays = makeSubscriber(subscriptionsLatestArrays);
        const subscribeFullArrays = makeSubscriber(subscriptionsViewableArrays, fullArrays);
        const subscribeViewableArrays = makeSubscriber(subscriptionsViewableArrays, viewableArrays); // prettier-ignore
        const subscribeCursorTimestamp = makeSubscriber(subscriptionsCursorTimestamp, cursorTimestamp);
        const subscribeCursorRow = makeSubscriber(subscriptionsCursorRow, cursorRow);
        const subscribeNumRows = makeSubscriber(subscriptionsNumRows, numRows);
        const subscribeDataSource = makeSubscriber(subscriptionsDataSource, dataSource);

        // Only used when components are first being creating and need to
        // populate already-present data instead of waiting for new changes
        const getFullArraysRef = () => fullArrays;
        const getViewableArraysRef = () => viewableArrays;
        const getViewEdgesRef = () => viewEdges;
        const getNumRowsRef = () => numRows;

        const setCursorTimestamp = (pos: number) => {
            // TODO(urgent): Write an algorith to get the nearest row to the left and right timestamps!
            // let row = {} as DataValues;
            // for (let [k, v] of Object.entries(fullArrays.current)) {
            //     if (v) row[k as ColumnName] = v[pos];
            // }
            // subscriptionsCursorRow.current.forEach((s) => s(row));
            subscriptionsCursorTimestamp.current.forEach(s => s(pos));
        };
        const setViewEdges = (newViewEdges: [left: number, right: number], setterID: string) => {
            // Set viewableArrays to the correct subset of fullArrays
            // todo: this is unoptimized (every time view edges changes we re-copy from fullArrays)
            // TODO(urgent): Write an algorith to get the nearest row to the left and right timestamps!
            // viewableArrays.current = nullDataArrays();
            // let arrays = {} as DataArrays;
            // for (let [k, v] of Object.entries(fullArrays.current)) {
            //     if (v) arrays[k as ColumnName] = v.slice(newViewEdges[0], newViewEdges[1] + 1);
            // }
            // viewableArrays.current = arrays;

            viewEdges.current = newViewEdges;
            subscriptionsViewEdges.current.forEach((s) => s(newViewEdges, setterID));
        };
        const reset = () => {
            fullArrays.current = nullDataArrays();
            viewableArrays.current = nullDataArrays();
            // setDataSourceType(DataSourceType.NONE);
            // todo: close any websocket connections?
            closeWebSocketConnection();

            subscriptionsReset.current.forEach((s) => s());
        };
        const switchToLiveData = (setIsConnected?: Dispatch<SetStateAction<boolean>>) => {
            fullArrays.current = nullDataArrays();
            viewableArrays.current = nullDataArrays();
            // setDataSourceType(DataSourceType.LIVE);

            // TODO: MAKE THIS USE WEBSOCKET STREAM's SCHEMA!!
            fullArrays.current = emptyDataArrays();
            viewableArrays.current = emptyDataArrays();

            const processRecordBatch = (batch: RecordBatch) => {
                let arraysTyped = {} as DataArraysTyped;
                // TODO: Actually use the schema of the incoming websocket stream!!
                // This assumes all columns are present (non-present should be null)
                for (const key of columnNames) {
                    const vector = batch.getChild(key);
                    if (vector) {
                        const arr = vector.toArray();
                        arraysTyped[key] = arr;
                        fullArrays.current[key]!.push(arr);
                        viewableArrays.current[key]!.push(arr);
                    }
                }
                subscriptionsLatestArraysTyped.current.forEach((s) => s(arraysTyped));
                // subscriptionsLatestArrays.current.forEach((s) => s(arrays));
                subscriptionsFullArrays.current.forEach((s) => s(fullArrays.current));
                subscriptionsViewableArrays.current.forEach((s) => s(viewableArrays.current))

                numRows.current += batch.numRows;
                subscriptionsNumRows.current.forEach((s) => s(numRows.current));

                viewEdges.current[0] += batch.numRows;
                viewEdges.current[1] += batch.numRows;
            };

            initWebSocketConnection(processRecordBatch, setIsConnected);
            dataSource.current = DataSourceType.LIVE;
            subscriptionsDataSource.current.forEach(s => s(DataSourceType.LIVE));
        };
        const switchToRecording = async (filename: string) => {
            fullArrays.current = nullDataArrays();
            viewableArrays.current = nullDataArrays();
            const table = await getRecording(filename);


            dataSource.current = DataSourceType.RECORDED;
            subscriptionsDataSource.current.forEach(s => s(DataSourceType.RECORDED));
        };

        return {
            // Subscribers
            subscribeReset,
            subscribeViewEdges,
            subscribeLatestArraysTyped,
            subscribeLatestArrays,
            subscribeFullArrays,
            subscribeViewableArrays,
            subscribeCursorTimestamp,
            subscribeCursorRow,
            subscribeNumRows,
            subscribeDataSource,

            // Controllers
            setCursorTimestamp,
            setViewEdges,
            reset,
            switchToLiveData,
            switchToRecording,

            // Getters
            getFullArraysRef,
            getViewableArraysRef,
            getViewEdgesRef,
            getNumRowsRef,
        };
    }, []);

    // const methods: DataMethods = useMemo(
    //     () => (),
    //     [],
    // );

    return (
        <DataMethodsContext.Provider value={methods}>{children}</DataMethodsContext.Provider>
    );
}

export function useDataMethods() {
    const context = useContext(DataMethodsContext);
    if (!context) {
        throw new Error("useDataMethods must be used within a DataSubscriptionProvider!");
    }
    return context;
}
