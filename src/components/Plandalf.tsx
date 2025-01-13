import {FunctionComponent, PropsWithChildren} from "react";
import React from "react";
import {loadPlandalf, Plandalf} from "@plandalf/plandalf-js";
import { PlandalfProviderProps } from "..";


interface Intelligence {
  view: (params: any) => void;
  action: (type: string, context?: object, metadata?: object) => void;
  _queue?: QueuedAction[];
  _clearQueue?: () => void;
}

interface Customer {
  name: string;
  value: any;
}

// Create a singleton queue manager outside of React
const PlandalfQueue = {
  actions: [] as QueuedAction[],
  add(action: QueuedAction) {
    this.actions.push(action);
  },
  process(plandalf: Plandalf) {
    this.actions.forEach(action => {
      if (action.type === 'view') {
        plandalf.intel.view(action.params);
      } else if (action.type === 'action') {
        plandalf.intel.action(action.actionType!, action.context, action.metadata);
      }
    });
    this.clear();
  },
  clear() {
    this.actions = [];
  }
};

// Update the context to use the queue
export const PlandalfContext = React.createContext<PlandalfContextValue>({
  plandalf: undefined,
  state: 'loading',
  gate: () => {},
  intel: {
    view: (params: any) => {
      PlandalfQueue.add({ type: 'view', params });
    },
    action: (type: string, context = {}, metadata = {}) => {
      PlandalfQueue.add({ 
        type: 'action', 
        actionType: type,
        context,
        metadata,
        params: null 
      });
    }
  } as Intelligence,
  customer: {} as Customer,
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

interface QueuedAction {
  type: 'view' | 'action';
  params: any;
  actionType?: string;
  context?: object;
  metadata?: object;
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
  gate: (name: string, onUnlock: Function) => void
  intel: Intelligence
  customer: Customer
}

export const PlandalfProvider: FunctionComponent<PropsWithChildren<PlandalfProviderProps>> = ({
  children,
  client,
  agent,
  plandalf,
  listen,
  apiUrl,
  sdkUrl,
}) => {
  const [ctx, setContext] = React.useState<PlandalfContextValue>({
    plandalf: undefined,
    state: 'loading',
    gate: () => {},
    intel: {
      view: (params: any) => {
        PlandalfQueue.add({ type: 'view', params });
      },
      action: (type: string, context = {}, metadata = {}) => {
        PlandalfQueue.add({ 
          type: 'action', 
          actionType: type,
          context,
          metadata,
          params: null 
        });
      }
    } as Intelligence,
    customer: {} as Customer
  });

  React.useEffect(() => {
    const handlePlandalfUpdate = (p: Plandalf) => {
      // Process any queued actions first
      PlandalfQueue.process(p);
      
      // Create wrapped intel object that directly uses Plandalf
      const wrappedIntel = {
        ...p.intel,
        view: (params: any) => {
          p.intel.view(params);
        },
        action: (type: string, context = {}, metadata = {}) => {
          p.intel.action(type, context, metadata);
        }
      };

      setContext({
        plandalf: p,
        state: 'loaded',
        gate: p.gate || (() => {}),
        intel: wrappedIntel,
        customer: p.customer || {}
      });
    };

    if (plandalf) {
      // if plandalf already exists on window
      handlePlandalfUpdate(plandalf);
    } else {
      // Load the script
      loadPlandalf(agent, {clientId: client, apiUrl, sdkUrl, listen})
        .then((p: Plandalf | null) => {
          if (p) {
            handlePlandalfUpdate(p);
            
            // Set up event listeners for plandalf updates
            p.on?.('update', (event: string, args: [Plandalf]) => {
              handlePlandalfUpdate(args[0]);
            });
          } else {
            setContext(prev => ({
              ...prev,
              plandalf: undefined,
              state: 'error'
            }));
          }
        })
        .catch(() => {
          setContext(prev => ({
            ...prev,
            plandalf: undefined,
            state: 'error'
          }));
        });
    }

    // Cleanup function to remove event listeners
    return () => {
      if (plandalf?.off) {
        plandalf.off('update');
      }
    };
  }, [agent, client, apiUrl, sdkUrl, listen]);

  return (
    <SDKErrorBoundary>
      <PlandalfContext.Provider value={ctx}>
        {children}
      </PlandalfContext.Provider>
    </SDKErrorBoundary>
  )
}


const Gate = ({ children, name, onUnlock }: { children: Function | React.ReactNode, name: string, onUnlock?: Function }) => {
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
          reject(err?.message || err);
        });
    });
  };

  if (typeof children === 'function') {
    return children(hasAccess, handleUnlock);
  }

  if (hasAccess) {
    return children;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p className="font-bold">No access to this feature</p>
      <button onClick={handleUnlock}>Upgrade now</button>
    </div>
  );
}

export {Gate};