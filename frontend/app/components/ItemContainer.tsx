import { ReactNode } from "react";

interface ItemContainerProps {
    children: ReactNode;
}

export default function ItemContainer({ children }: ItemContainerProps) {
    return (
        <div className="bg-background-2 rounded-xl p-4">
            {children}
        </div>
    )
};
