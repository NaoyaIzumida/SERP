import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import { useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { menuContext } from "../contexts/AppState";
import logo from "../images/logo.png";

export const MyAppBar = () => {
  // AppState.ts の menuContext を引数に与える
  const { isOpened, setOpened } = useContext(menuContext);

  // menuContext の isOpened プロパティを切り替える
  const toggleOpen = () => setOpened(!isOpened);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={toggleOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <img src={logo} alt="SCI" height="60" />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: "block" }}
            >
              月次締め確認処理 （v 1.0.0）
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};

