import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import Link from '@mui/material/Link';
import { NavLink } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";
import logo from "../../images/logo.png";
import serp from "../../images/serp.png";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme();

type GenericTemplateProps = {
  title: string;
  children: React.ReactNode;
};

const GenericTemplate: React.FC<GenericTemplateProps> = ({title, children}) => {
  // サイドメニュー開閉状態
  const [open, setOpen] = React.useState(true);
  // サイドメニュー開閉処理
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* ヘッダー部分の実装 */}
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              {/* サイドメニュー開閉ボタン */}
              <MenuIcon />
            </IconButton>
            <img src={logo} alt="SCI" height="60" />
            <img src={serp} alt="SERP" height="60" />
            <Typography
              component="h1"
              variant="h5"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              月次締め処理 v 1.0.0
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              {/* サイドメニュー開閉ボタン */}
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListSubheader component="div" inset>
              Select mode
            </ListSubheader>
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
                to={"/ComparePage"}
                sx={{ '&[aria-current="page"]': { bgcolor: lightBlue["50"] } }}
                end
            >
              <ListItemIcon>
                {/* 照合 */}
                <CompareArrowsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Compare" />
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
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth={false} sx={{ mt: 2, mb: 2 }}>
            {children}
            <Box mt={4}>
              <Typography variant="body2" color="text.secondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href="http://www.sci-it.co.jp/">
                  SCI
                </Link>
                {' '}
                {new Date().getFullYear()}
                {'.'}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default GenericTemplate;