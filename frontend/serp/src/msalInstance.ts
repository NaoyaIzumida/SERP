// global
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./components/config/MsalConfig";

export const msalInstance = new PublicClientApplication(msalConfig);