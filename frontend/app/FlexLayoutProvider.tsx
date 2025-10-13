"use client";

import { layouts } from "@/constants/layouts";
import { IJsonModel, Model } from "flexlayout-react";
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useState,
} from "react";

export const FlexLayoutContext = createContext<
    null | [Model, Dispatch<SetStateAction<Model>>]
>(null);

const defaultLayoutModel = layouts[0].config.model;

export function FlexLayoutProvider({ children }: PropsWithChildren) {
    const state = useState(defaultLayoutModel);
    return <FlexLayoutContext.Provider value={state}>{children}</FlexLayoutContext.Provider>;
}

export function useFlexLayout() {
    const context = useContext(FlexLayoutContext);
    if (!context) {
        throw new Error("No context for flexlayout");
    }
    return context;
}
