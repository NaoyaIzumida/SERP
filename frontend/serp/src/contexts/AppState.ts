import { createContext, Dispatch, SetStateAction } from "react";

type MenuContextType = {
  isOpened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
} | undefined;

export const menuContext = createContext<MenuContextType>(undefined);