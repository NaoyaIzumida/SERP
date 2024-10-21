import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert  from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Switch from '@mui/material/Switch';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../api/api'; // API関数をインポート

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

// SideListのプロパティ型
interface SideListProps {
  mode: number;                                     // SideListのモード
  onDataFetch: (data: DataItem[]) => void;          // データ取得時に親へ通知する関数
  onRowSelect: (selectedData: DataItem[]) => void;  // 行選択時に親へ通知する関数
}

//mode:1 Upload
//mode:2 Compare  **不要のため破棄
//mode:3 Merge
const SideList: React.FC<SideListProps> = ({ mode, onDataFetch, onRowSelect }) => {

  const label = { inputProps: { 'aria-label': 'Switch demo' } };

  // スライダー無しの描画
  const noSwitchStack = (
    <Stack
      direction="row"
      justifyContent="left"
      alignItems="stretch"
      spacing={0.5}
    >
    </Stack>
  );

  // スライダー有りの描画
  const switchStack = (
    <Stack
      direction="row"
      justifyContent="left"
      alignItems="stretch"
      spacing={0.5}
    >
      <Switch {...label} defaultChecked />
    </Stack>
  );

  let listHeader;
  if (mode == 1) {
    // mode:1 Upload
    listHeader = noSwitchStack;
  } else {
    // mode:3 Merge
    listHeader = switchStack;
  }

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);                   // 選択された日付を管理
  const [data, setData] = useState<DataItem[]>([]);                                       // APIから取得したデータ
  const [openSnackbar, setOpenSnackbar] = useState(false);                                // Snackbarの開閉状態
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('error'); // Snackbarのタイプ
  const [errorMessage, setMessage] = useState('');                                        // メッセージ

  // API呼び出し関数
  const fetchData = async () => {
    if (selectedDate) {
      const yearMonth = dayjs(selectedDate).format('YYYYMM');  // 選択された日付をyyyyMM形式に変換
      try {
        const response = await apiClient.get<ApiResponse>(`/filelist/${yearMonth}`);
        // setData(response.data.result);  // 取得したデータのresult部分(json)をstateに保存

        // データが取得できない場合はメッセージを表示する
        if (response.data.status == 1) {
          // エラーメッセージを設定しSnackbarを表示
          setMessage('一致するデータがありません。');
          setSnackbarSeverity('warning');     // 警告タイプに設定
          setOpenSnackbar(true);
        } else {
          setMessage('データを取得しました。');
          setSnackbarSeverity('success');     // 成功タイプに設定
          setOpenSnackbar(true);
          setData(response.data.result);      // データをstateに保存
          onDataFetch(response.data.result);  // 親にデータ取得を通知
        }
      } catch (error) {
        // エラーメッセージを設定しSnackbarを表示
        setMessage('データの取得に失敗しました。');
        setSnackbarSeverity('error');  // 警告タイプに設定
        setOpenSnackbar(true);
      }
    }
  };

  // Snackbarを閉じる処理
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  // ボタン押下時のハンドラ
  const handleButtonClick = () => {
    fetchData();
  };

  // FixedSizeListに表示するアイテム
  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const item = data[index];  // data[index]の存在を確認
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText 
            primary={item ? item.file_nm : 'データがありません'}
            data-manage-id={item?.manage_id}
            onClick={() => {
              if (item) {
                onRowSelect([item]);  // 行が選択されたら親に通知
              }
            }}
          />
          <IconButton edge="end">
            {mode == 1 ? <DeleteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        width: '100%',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={0.5}
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
          padding: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'background.paper',
          }}
        >

          {/* 取得したデータを表示 */}
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

          {/* Snackbarでエラーメッセージを表示 */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={5000}  // 5秒後に自動で閉じる
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
              {errorMessage}
            </Alert>
          </Snackbar>

        </Box>
      </Toolbar>
    </Paper>
  );
}

//他のファイルでこのファイルをimportすることで、ここの関数を使えるようになる
export default SideList;