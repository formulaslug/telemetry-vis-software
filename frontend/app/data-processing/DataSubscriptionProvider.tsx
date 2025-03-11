import { TypedArray } from "apache-arrow/interfaces";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { DataArrays, DataArraysTyped } from "./datatypes";

type SubscriptionLatestArrayTyped = (latest: DataArraysTyped, reset: boolean) => void;
type SubscriptionLatestArray = (latest: DataArrays, reset: boolean) => void;
type SubscriptionFullArray = (latest: TypedArray) => void;
type SubscriptionCursorRow = (latest: number) => void;
type SubscriptionNumRows = (latest: number) => void;

type Subscription =
    | SubscriptionLatestArrayTyped
    | SubscriptionLatestArray
    | SubscriptionFullArray
    | SubscriptionCursorRow
    | SubscriptionNumRows;

type DataSubscribers = {
    subscribeLatestArrayTyped: (clbk: SubscriptionLatestArrayTyped) => () => void;
    subscribeLatestArray: (clbk: SubscriptionLatestArray) => () => void;
    subscribeFullArray: (clbk: SubscriptionFullArray) => () => void;
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
};
const DataSubscriptionContext = createContext<DataSubscribers | null>(null);

export function DataSubscriptionProvider({ children }: PropsWithChildren) {
    const subscriptions = useRef<Set<Subscription>>();

    const genericSubscriber = (clbk: Subscription) => {
        subscriptions.current?.add(clbk);
        return () => {
            subscriptions.current?.delete(clbk);
        };
    };

    // TODO(jack): Instead of making a generic subscriber and switching on
    // subscription type during data processing, acknowledge that different
    // subscriptions change at different times and just start bringing in that
    // logic here. Create a different subscriber function for each type.
    // Also, in order to implement the mantine RangedSlider, expose a function
    // for seting cursor position and track that here? Maybe differentiate
    // between currently viewed numRows and fully available numRows?
    subscriptions.current?.forEach((s) => {
        switch (s) {
        }
    });

    return (
        <DataSubscriptionContext.Provider value={}>
            {children}
        </DataSubscriptionContext.Provider>
    );
}

export function useDataSubscriptionContext() {
    const context = useContext(DataSubscriptionContext);
    if (!context) {
        throw new Error(
            "useDataSubscriptionContext must be used within a DataSubscriptionProvider!",
        );
    }
    return context;
}
