const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const tenantId = import.meta.env.VITE_TENANT_ID;
const clientId = import.meta.env.VITE_CLIENT_ID;

export const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
  },
};

export const signInRequest = {
  scopes: ["openid", "profile", "email"],
};