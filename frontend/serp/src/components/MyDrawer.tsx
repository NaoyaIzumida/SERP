import { Drawer } from "@mui/material";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import TopicInfoIcon from '@mui/icons-material/Topic';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";
import { useContext } from "react";
import { menuContext } from "../contexts/AppState.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

type Props = {
  open: boolean;
};

export const MyDrawer = (props: Props) => {
  const context = useContext(menuContext);
  const authContext = useAuth();
  if (!context) {
    throw new Error("MenuComponent must be used within a MenuProvider");
  }

  const { isOpened, setOpened } = context;

  return (
    <Drawer
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
        },
      }}
      variant="persistent"
      anchor="left"
      open={props.open}
    >
      <Toolbar />
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* メニューリスト（上部） */}
        <List sx={{ flexGrow: 1, overflow: "auto" }}>
          <ListSubheader component="div" inset>
            Select Menu
          </ListSubheader>

          <ListItemButton
            component={NavLink}
            to={"/TopicInfoMstPage"}
            sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
            onClick={() => setOpened(!isOpened)}
            end
          >
            <ListItemIcon>
              <TopicInfoIcon />
            </ListItemIcon>
            <ListItemText primary="TopicInfoMst" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to={"/UploadPage"}
            sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
            onClick={() => setOpened(!isOpened)}
            end
          >
            <ListItemIcon>
              <FileUploadOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Upload" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to={"/MergePage"}
            sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
            onClick={() => setOpened(!isOpened)}
            end
          >
            <ListItemIcon>
              <MergeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Merge" />
          </ListItemButton>
        </List>

        {/* ログアウト（下部固定） */}
        <Box>
          <List>
            <ListItemButton
              component={NavLink}
              to={"/SignIn"}
              sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
              onClick={() => { setOpened(!isOpened); authContext.signOut(); }}
              end
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="SignOut" />
            </ListItemButton>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};
