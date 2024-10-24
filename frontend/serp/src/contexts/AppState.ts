import { createContext } from "react";

export const menuContext = createContext({
  isOpened: false,
  setOpened: (isOpen: boolean) => {}
});
