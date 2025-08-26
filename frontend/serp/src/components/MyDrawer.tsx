import { Drawer} from "@mui/material";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import { NavLink } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";
import {useContext} from "react";
import {menuContext} from "../contexts/AppState.ts";

type Props = {
  open: boolean;
};

export const MyDrawer = (props: Props) => {
    // AppState.ts の menuContext を引数に与える
    const context = useContext(menuContext);
    if (!context) {
        throw new Error("MenuComponent must be used within a MenuProvider");
    }

    const { isOpened, setOpened } = context;

    return (
    <>
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
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListSubheader component="div" inset>
              Select Menu
            </ListSubheader>
            <ListItemButton
                component={NavLink}
                to={"/UploadPage"}
                sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                onClick={() => setOpened(!isOpened)}
                end
            >
              <ListItemIcon>
                {/* アップロード */}
                <FileUploadOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={"Upload"} />
            </ListItemButton>
            <ListItemButton
                component={NavLink}
                to={"/MergePage"}
                sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                onClick={() => setOpened(!isOpened)}
                end
            >
              <ListItemIcon>
                {/* マージ */}
                <MergeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Merge" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};
