import { createContext } from "react-router";
import type { Session } from "@ory/client-fetch";

export type RouterContextType = Session | null;

export const sessionContext = createContext<RouterContextType>(null);
