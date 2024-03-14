import {FunctionComponent, PropsWithChildren} from "react";
import React from "react";

// import {PlandalfContextValue} from "../index";
import {loadPlandalf, Plandalf} from "@plandalf/plandalf-js";

export interface PlandalfContextValue {
    plandalf: Plandalf
}

export const PlandalfContext = React.createContext<PlandalfContextValue | null>(
    null
);
PlandalfContext.displayName = 'PlandalfContext';


export const usePlandalf = (): PlandalfContextValue | null => {
    return React.useContext(PlandalfContext);
}

interface PlandalfProviderProps {
    clientId: string
    agent: string
    children: any
    theme: any
    locale: string
    plandalfClient?: Plandalf
}

export const PlandalfProvider: FunctionComponent<PropsWithChildren<PlandalfProviderProps>> = ({
    children,
    clientId,
    agent,
    // locale,
    plandalfClient,
}) => {
    const [ctx, setContext] = React.useState<PlandalfContextValue | null>(null);

    React.useEffect(() => {
        if (!agent) return;
        if (plandalfClient) {
            setContext({
                plandalf: plandalfClient
            });
        } else {
            loadPlandalf(agent, {clientId})
            .then((p: Plandalf) => {
                p.on('load', (pd: Plandalf) => setContext({ plandalf: pd }));
                setContext({ plandalf: p })
            });
        }
    }, [
        agent,
    ]);

    return (
    <PlandalfContext.Provider value={ctx}>
        {children}
    </PlandalfContext.Provider>
    )
}