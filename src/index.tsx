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



