import React, {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";

import { loadPlandalf, Plandalf } from "@plandalf/plandalf-js"

export interface PlandalfContextValue {
    state: string
    // offerings: any[]
    // frequencies: any[]
    // theme: any
    // agent: Agent
    plandalf?: Plandalf | null,
    locale: string
    theme: any
}
interface PlandalfProps {
    client_id: string
    agent: string
    children: any
}

export const PlandalfContext = createContext<PlandalfContextValue | null>(null);

export interface PlandalfClient {
    //
    // createCheckout(options: {
    //   redirect: 'test'
    // }): Promise<CheckoutResult>
    state: string;
}

interface PlandalfClientConfig {
    agent: string;
    principal: string;
}

export type PlandalfProviderProps = {
    clientId: string
    agent: string
    children: any
    theme: any
    locale: string
    plandalfClient?: Plandalf
}

export const PlandalfProvider: React.FC<PropsWithChildren<PlandalfProviderProps>> = ({
                                                                                         children,
                                                                                         clientId,
                                                                                         agent,
                                                                                         //apiKey,
                                                                                         //   baseUri,
                                                                                         //   baseEdgeUri,
                                                                                         //   enableEdge,
                                                                                         //   customerId,
                                                                                         //   customerToken,
                                                                                         //   resourceId,
                                                                                         //   themes,
                                                                                         locale,
                                                                                         //   useEntitlementPolling,
                                                                                         //   entitlementPollingInterval,
                                                                                         //   entitlementsFallback,
                                                                                         plandalfClient,
                                                                                     }) => {

    const [plandalf, setPlandalf] = useState<PlandalfClient | null>(null);

    // console.log({agent})

    useEffect(() => {
        if (!agent) return;
        if (plandalfClient) {
            setPlandalf(plandalfClient);
        } else {
            loadPlandalf(agent, {clientId})
                .then(p => {
                    p.on('load', setPlandalf);
                    setPlandalf(p);
                });
        }
    }, [
        agent,
    ]);

    // useEffect(() => {
    //     window.plandalf = plandalf;
    // }, [plandalf])

    return (
        <PlandalfContext.Provider value={plandalf}>
        {children}
        </PlandalfContext.Provider>
    )
}

export function usePlandalf(): PlandalfContextValue {
    return useContext(PlandalfContext);
}


export default PlandalfProvider;

