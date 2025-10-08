const redirectUri = import.meta.env.VITE_REDIRECT_URI;

export const msalConfig = {
  auth: {
    clientId: "b96bf6d0-b9b0-4888-a294-83018fd7786d",
    authority: "https://login.microsoftonline.com/7e80b39f-2bf1-4395-a356-64b74b4015bb",
    redirectUri: redirectUri,
  },
};

export const signInRequest = {
  scopes: ["openid", "profile", "email"],
};