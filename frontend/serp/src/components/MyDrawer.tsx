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
import TopicInfoIcon from '@mui/icons-material/Topic';
import { NavLink } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";

type Props = {
  open: boolean;
};

export const MyDrawer = (props: Props) => {
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
                to={"/TopicInfoMstPage"}
                sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                end
            >
              <ListItemIcon>
                {/* 案件情報マスタメンテナンス */}
                <TopicInfoIcon />
              </ListItemIcon>
              <ListItemText primary={"TopicInfoMst"} />
            </ListItemButton>
            <ListItemButton
                component={NavLink}
                to={"/UploadPage"}
                sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
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
