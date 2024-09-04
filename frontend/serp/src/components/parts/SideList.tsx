import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Switch from '@mui/material/Switch';
import FilterListIcon from '@mui/icons-material/FilterList';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

//他のファイルでこのファイルをimportすることで、ここの関数を使えるようになる
export default SideList;

function renderRow(props: ListChildComponentProps) {
  const { index, style } = props;

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
        <IconButton edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}

//mode:1 Upload
//mode:2 Compare
//mode:3 Merge
function SideList({ mode }: { mode: number }) {
  const label = { inputProps: { 'aria-label': 'Switch demo' } };

  // スライダー無しの描画
  const noSwitchStack = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={'flex-end'}
      spacing={0.5}
    >
      <IconButton color="primary" aria-label="Filter">
        <FilterListIcon />
      </IconButton>
    </Stack>
  );
  // スライダー有りの描画
  const switchStack = (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={0.5}
    >
      <Switch {...label} defaultChecked />
      <IconButton color="primary" aria-label="Filter">
        <FilterListIcon />
      </IconButton>
    </Stack>
  );

  let listHeader;
  if (mode == 1) {
    listHeader = noSwitchStack;
  } else {
    listHeader = switchStack;
  }

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Account Months"
              format="YYYY/MM"
              defaultValue={dayjs()}
              views={['year', 'month']}
            />
          </LocalizationProvider>
          <Button variant="outlined" startIcon={<SearchIcon />}>
            Search
          </Button>
        </Stack>
      </Toolbar>
      <Divider />
      {listHeader}
      <Divider />
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-Start',
          px: [1],
          padding: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'background.paper',
          }}
        >
          <FixedSizeList
            height={560}
            width="100%"
            itemSize={40}
            itemCount={30}
            overscanCount={5}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
      </Toolbar>
    </Paper>
  );
}
