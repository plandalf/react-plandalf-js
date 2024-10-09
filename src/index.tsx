import { Plandalf } from "@plandalf/plandalf-js"
export  {PlandalfProvider, PlandalfContextValue, usePlandalf, PlandalfContext, Gate} from "./components/Plandalf";

// export interface PlandalfContextValue {
//     state: string
//     // offerings: any[]
//     // frequencies: any[]
//     // theme: any
//     // agent: Agent
//     plandalf?: Plandalf | null,
//     locale: string
//     theme: any
// }

// interface Gate {
//   name: string;
//   children: Function | React.ReactNode;
// }

interface PlandalfProps {
    client_id: string
    agent: string
    children: any
}

export interface PlandalfClient {
    state: string;
}

interface PlandalfClientConfig {
    agent: string;
    principal: string;
}

export type PlandalfProviderProps = {
    client?: string
    agent?: string
    children?: any
    listen?: Function;
    plandalf?: Plandalf
    apiUrl?: string
    sdkUrl?: string;
    plandalfClient?: Plandalf
}



