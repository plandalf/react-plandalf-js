import {FunctionComponent, PropsWithChildren} from "react";
import React from "react";

import {loadPlandalf, Plandalf} from "@plandalf/plandalf-js";

export interface PlandalfContextValue {
    plandalf: Plandalf
}

export const PlandalfContext = React.createContext<PlandalfContextValue | null>(
    null
);
PlandalfContext.displayName = 'PlandalfContext';

function isSdkError(error) {
    return false;
}

function logErrorToService(error: Error, errorInfo: React.ErrorInfo) {

    console.log('logging an error!');
}

class SDKErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        // You can determine if the error is from your SDK
        if (isSdkError(error)) {
            return { hasError: true, error };
        }
        // If it's not an SDK error, we won't handle it here
        return null;
    }

    componentDidCatch(error, errorInfo) {
        if (isSdkError(error)) {
            // Log SDK errors or handle them as needed
            logErrorToService(error, errorInfo);
        } else {
            // If it's not an SDK error, rethrow it
            throw error;
        }
    }

    render() {
        // Always render children, ignore SDK issues
        return this.props.children;
    }
}

export const usePlandalf = (): PlandalfContextValue | null => {
    return React.useContext(PlandalfContext);
}

export type PlandalfEvent = {
    type: string
    payload: any
}

interface PlandalfProviderProps {
    client: string
    agent: string
    children: any
    listen: Function;
    plandalfClient?: Plandalf
}

export const PlandalfProvider: FunctionComponent<PropsWithChildren<PlandalfProviderProps>> = ({
    children, client,
    agent,
    listen,
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
            loadPlandalf(agent, {clientId: client})
                .then((p: Plandalf) => {
                    p.on('load', (pd: Plandalf) => setContext({ plandalf: pd }));
                    setContext({ plandalf: p })
                });
        }
    }, [
        agent,
    ]);

    return (
        <SDKErrorBoundary>
            <PlandalfContext.Provider value={ctx}>
                {children}
            </PlandalfContext.Provider>
        </SDKErrorBoundary>
    )
}