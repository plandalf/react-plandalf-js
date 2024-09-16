import { Plandalf } from "@plandalf/plandalf-js"
export  {PlandalfProvider, PlandalfContextValue, usePlandalf, PlandalfContext} from "./components/Plandalf";

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
    clientId: string
    agent: string | undefined
    children: any
    theme: any
    locale: string
    sdkUrl: string;
    plandalfClient?: Plandalf
}



