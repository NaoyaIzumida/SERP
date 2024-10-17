import React, { useState } from 'react';
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
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../api/api'; // API関数をインポート

//他のファイルでこのファイルをimportすることで、ここの関数を使えるようになる
export default SideList;

//mode:1 Upload
//mode:2 Compare  **不要のため破棄
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

  // APIから取得するjsonの型定義
  interface DataItem {
    manage_id: string;
    fiscal_date: string;
    version: string;
    file_div: string;
    file_nm: string;
  }

  // APIから取得するデータの型定義
  interface ApiResponse {
    status: number;
    result: DataItem[];
  }

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);  // 選択された日付を管理
  const [data, setData] = useState<DataItem[]>([]);                      // APIから取得したデータ

  // API呼び出し関数
  const fetchData = async () => {
    if (selectedDate) {
      const yearMonth = dayjs(selectedDate).format('YYYYMM');  // 選択された日付をyyyyMM形式に変換
      try {
        const response = await apiClient.get<ApiResponse>(`/filelist/${yearMonth}`);
        setData(response.data.result);  // 取得したデータのresult部分(json)をstateに保存
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  // ボタン押下時のハンドラ
  const handleButtonClick = () => {
    fetchData();
  };

  // FixedSizeListに表示するアイテム
  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const item = data[index];  // data[index]の存在を確認
    return (
      // <div style={style}>
      //   {item ? item.file_nm : 'データがありません'}  {/* file_nmプロパティを表示 */}
      // </div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={item ? item.file_nm : 'データがありません'} data-manage-id={item?.manage_id} />
          <IconButton edge="end" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>
    );
  };

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
              format="YYYYMM"
              defaultValue={dayjs()}
              views={['year', 'month']} // 年月のみ選択可能にする
              value={selectedDate}
              onChange={(newDate) => {
                if (newDate) {
                  setSelectedDate(newDate);
                }
              }}
            />
          </LocalizationProvider>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleButtonClick}
          >
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
          {data.length > 0 && (
            <FixedSizeList
              height={560}              // 表示リストの高さ
              width="100%"              // 表示リストの幅
              itemSize={40}             // 各アイテムの高さ
              itemCount={data.length}   // リストアイテムの数(jsonのデータ数により可変)
              overscanCount={5}
            >
              {renderRow}
            </FixedSizeList>
          )}
        </Box>
      </Toolbar>
    </Paper>
  );
}
