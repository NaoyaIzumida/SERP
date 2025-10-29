import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import { useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { menuContext } from "../contexts/AppState";
import logo from "../images/logo.png";
import { useAuth } from "../contexts/AuthContext";
import { eSystemType, useSystem } from "../contexts/AppUIContext";
import ReleaseNoteAlert from "./ReleaseNoteAlert";

interface Props {
  isAuthenticated?: boolean;
}

export const MyAppBar = ({ isAuthenticated = false }: Props) => {
  const context = useContext(menuContext);
  const authContext = useAuth();
  const systemContext = useSystem();

  if (!context) {
    throw new Error("MenuComponent must be used within a MenuProvider");
  }

  const { isOpened, setOpened } = context;

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            {isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={() => setOpened(!isOpened)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <img src={logo} alt="SCI" height="60" />
            {isAuthenticated && (<Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: "block" }}
            >
              {systemContext.system === eSystemType.GETSUJI
                ? "月次処理システム："
                : ""}
              {systemContext.title} （v {import.meta.env.VITE_APP_VERSION}）</Typography>)}
            {isAuthenticated && authContext.user?.display_name && (
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ marginLeft: 'auto' }}
              >
                {authContext.user.display_name}
              </Typography>
            )}
          </Toolbar>
          <ReleaseNoteAlert />
        </AppBar>
      </Box>
    </>
  );
};

