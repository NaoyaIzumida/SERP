
import { styled } from "@mui/material/styles";

export const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
    open?: boolean;
  }>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -250,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }));