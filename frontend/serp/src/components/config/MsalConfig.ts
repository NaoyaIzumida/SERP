export const msalConfig = {
  auth: {
    clientId: "2796dabc-8d3f-4dbe-970c-3a01037879cd",
    authority: "https://login.microsoftonline.com/7e80b39f-2bf1-4395-a356-64b74b4015bb",
    redirectUri: "http://localhost:3000",
  },
};

export const signInRequest = {
  scopes: ["openid", "profile", "email"],
};