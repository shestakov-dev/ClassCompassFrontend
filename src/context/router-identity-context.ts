import { createContext } from "react-router";

export type RouterContextType = string | null;

export const identityIdContext = createContext<RouterContextType>(null);
