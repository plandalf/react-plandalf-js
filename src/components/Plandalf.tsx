import {FunctionComponent, PropsWithChildren} from "react";
import React from "react";
import {loadPlandalf, Plandalf} from "@plandalf/plandalf-js";

export const PlandalfContext = React.createContext<PlandalfContextValue>({
  plandalf: undefined,
  state: 'loading'
});
PlandalfContext.displayName = 'PlandalfContext';

class PlandalfError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PlandalfError';
    }
}

function isSdkError(error: Error) {
    return error instanceof PlandalfError;
}

function logErrorToService(error: Error, errorInfo: React.ErrorInfo) {

    console.log('logging an error!');
}

class SDKErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        // You can determine if the error is from your SDK
        if (isSdkError(error)) {
            return { hasError: true, error };
        }
        // If it's not an SDK error, we won't handle it here
        return null;
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
        return this.props.children as React.ReactNode;
    }
}

export const usePlandalf = (): PlandalfContextValue => {
    return React.useContext(PlandalfContext);
}

export type PlandalfEvent = {
    type: string
    payload: any
}

interface PlandalfProviderProps {
    client?: string
    agent?: string
    apiUrl?: string
    children?: any
    listen?: Function;
    plandalf?: Plandalf
}

export interface PlandalfContextValue {
  plandalf?: Plandalf
  state: 'loading' | 'loaded' | 'error'
}

export const PlandalfProvider: FunctionComponent<PropsWithChildren<PlandalfProviderProps>> = ({
  children,
  client,
  agent,
  listen,
  plandalf,
  apiUrl
}) => {
  const [ctx, setContext] = React.useState<PlandalfContextValue>({
    plandalf: undefined,
    state: 'loading'
  });

  React.useEffect(() => {
    if (plandalf) {
      // if plandalf already exists on window
      setContext({plandalf, state: 'loaded'});
    } else {
      // Load the script
      loadPlandalf(agent, {clientId: client, apiUrl})
        .then((p: Plandalf | null) => {
          if (p) {
            setContext({ plandalf: p, state: 'loaded' });
          } else {
            setContext({ plandalf: undefined, state: 'error' });
          }
        });
    }
  }, [agent]);

  return (
    <SDKErrorBoundary>
      <PlandalfContext.Provider value={ctx}>
        {children}
      </PlandalfContext.Provider>
    </SDKErrorBoundary>
  )
}