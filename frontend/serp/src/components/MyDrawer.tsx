import { Collapse, Drawer } from "@mui/material";
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
import { useContext, useState } from "react";
import { menuContext } from "../contexts/AppState.ts";
import { ExpandLess, ExpandMore, StarBorder } from "@mui/icons-material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

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
  const [isMstToggled, setMstToggle] = useState(true);
  const [isMonthlyToggled, setMonthlyToggle] = useState(true);
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

            {/* 月次メニュー */}
            <ListItemButton
              onClick={() => setMonthlyToggle(!isMonthlyToggled)}
            >
              <ListItemIcon>
                <ManageSearchIcon />
              </ListItemIcon>
              <ListItemText primary={"月次メニュー"} />
              {isMonthlyToggled ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* 月次メニュー - リスト */}
            <Collapse in={isMonthlyToggled} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

                {/* 月次メニュー > マスタ */}
                <ListItemButton
                  onClick={() => setMstToggle(!isMstToggled)}
                  sx={{ pl: 3, '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                >
                  <ListItemIcon>
                    <ManageAccountsIcon />
                  </ListItemIcon>
                  <ListItemText primary={"マスタ"} />
                  {isMstToggled ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                {/* 月次メニュー > マスタ - リスト */}
                <Collapse in={isMstToggled} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    
                    { /* 月次メニュー > マスタ > 案件情報 */}
                    <ListItemButton
                      component={NavLink}
                      to={"/TopicInfoMstPage"}
                      sx={{ pl: 4, '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                      onClick={() => setOpened(!isOpened)}
                      end
                    >
                      <ListItemIcon>
                        <TopicInfoIcon />
                      </ListItemIcon>
                      <ListItemText primary="案件情報" />
                    </ListItemButton>
                  </List>
                </Collapse>

                { /* 月次メニュー > UPLOAD */}
                <ListItemButton
                  component={NavLink}
                  to={"/UploadPage"}
                  sx={{ pl: 4, '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                  onClick={() => setOpened(!isOpened)}
                  end
                >
                  <ListItemIcon>
                    <FileUploadOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={"UPLOAD"} />
                </ListItemButton>

                { /* 月次メニュー > MERGE */}
                <ListItemButton
                  component={NavLink}
                  to={"/MergePage"}
                  sx={{ pl: 4, '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                  onClick={() => setOpened(!isOpened)}
                  end
                >
                  <ListItemIcon>
                    <MergeOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="MERGE" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>
    </>
  );
};
