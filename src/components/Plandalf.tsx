import {FunctionComponent, PropsWithChildren} from "react";
import React from "react";
import {loadPlandalf, Plandalf} from "@plandalf/plandalf-js";
import { PlandalfProviderProps } from "..";

export const PlandalfContext = React.createContext<PlandalfContextValue>({
  plandalf: undefined,
  state: 'loading'
});
PlandalfContext.displayName = 'PlandalfContext';


interface Inclusion {
  feature: string;
  charges?: number;
  limits?: number;
  // ... other attributes
}

interface Plan {
  name: string;
  inclusions: Inclusion[];
}

interface User {
  id: number;
  name: string;
  plan: string;
  entitlements: string[];
}

interface FlowCondition {
  type: string;
  value: any;
}

interface FlowConfig {
  name: string;
  conditions: FlowCondition[];
}

interface GateConfig {
  name: string;
  flows: FlowConfig[];
}

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

export interface PlandalfContextValue {
  plandalf?: Plandalf
  state: 'loading' | 'loaded' | 'error'
}

export const PlandalfProvider: FunctionComponent<PropsWithChildren<PlandalfProviderProps>> = ({
  children,
  client,
  agent,
  plandalf,
  apiUrl,
  sdkUrl,
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
      loadPlandalf(agent, {clientId: client, apiUrl, sdkUrl})
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


const Gate = ({ children, name, onUnlock }: { children: Function | React.ReactNode, name: string, onUnlock: Function }) => {
  const { plandalf } = usePlandalf();
  
  const element = plandalf?.element(name);
  const hasAccess = !element?.active(); 

  const callElementUnlock = () => element?.call('unlock') || Promise.reject(new Error('Element not found'));

  const handleUnlock = () => {
    return new Promise<void>((resolve, reject) => {
      callElementUnlock()
        .then((res) => {
          if (res.success) {
            onUnlock && onUnlock(res);
            resolve(res);
          } 
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  };

  if (typeof children === 'function') {
    return children(hasAccess, handleUnlock);
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p className="font-bold">No access to this feature</p>
      <button onClick={handleUnlock}>Upgrade now</button>
    </div>
  );
}

export {Gate};