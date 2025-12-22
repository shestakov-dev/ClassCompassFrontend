import type { Session } from "@ory/client-fetch";
import { createContext } from "react-router";

export type RouterContextType = Session | null;

export const routerSessionContext = createContext<RouterContextType>(null);
