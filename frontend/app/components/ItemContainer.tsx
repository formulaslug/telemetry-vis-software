import { ReactNode } from "react";

interface ItemContainerProps {
    children: ReactNode | null; // null shows "Data not available"
    title: string; // Do we want a standardized title display?
}

// Generic wrapper that can contain any visualization. Spares some boilerplate
export default function ItemContainer({ children, title }: ItemContainerProps) {
    return (
        <div className="bg-background-2 rounded-xl p-3 min-h-40 h-full w-full">
            <div className="w-full h-full flex flex-col">
                {title && <h6 className="text-lg pl-2 font-semibold">{title}</h6>}
                {children ? (
                    children
                ) : (
                    <>
                        <br />
                        <p className="text-center text-foreground-2">
                            {title} is not currently available.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
