import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import { useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { menuContext } from "../contexts/AppState";
import logo from "../images/logo.png";
import { useAuth } from "../contexts/AuthContext";
import { eSystemType, useSystem } from "../contexts/AppUIContext";
import ReleaseNoteAlert from "./ReleaseNoteAlert";
import { useLocation } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  isAuthenticated?: boolean;
}

export const MyAppBar = ({ isAuthenticated = false }: Props) => {
  const context = useContext(menuContext);
  const authContext = useAuth();
  const systemContext = useSystem();
  const location = useLocation();

  if (!context) {
    throw new Error("MenuComponent must be used within a MenuProvider");
  }

  const { isOpened, setOpened } = context;

  // SystemMenu ページだけで表示
  const showOnlyOnPaths = ["/SystemMenu"];
  const shouldShowAlert = showOnlyOnPaths.some(path =>
    location.pathname.startsWith(path)
  );

  // サイドメニューを表示しないページを設定
  const hiddenSideMenuPagePaths = ["/SystemMenu"];
  const isHiddenSideMenuPage = !hiddenSideMenuPagePaths.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {/* サインイン済かつサイドメニュー非表示ページ以外 */}
          {isAuthenticated && isHiddenSideMenuPage && (
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
          {isAuthenticated && (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: "block" }}
            >
              {systemContext.system === eSystemType.GETSUJI
                ? "月次処理システム："
                : ""}
              {systemContext.title} （v {import.meta.env.VITE_APP_VERSION}）
            </Typography>
          )}
          {isAuthenticated && authContext.user?.display_name && (
            <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" component="div">
                {authContext.user.display_name}
              </Typography>
              <IconButton
                color="inherit"
                size="small"
                onClick={async () => {
                  await authContext.signOut();
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>

        {/* ReleaseNoteAlert: SystemMenu ページ限定で表示 */}
        {isAuthenticated && shouldShowAlert && <ReleaseNoteAlert />}
      </AppBar>
    </Box>
  );
};
