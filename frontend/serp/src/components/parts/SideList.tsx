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

// APIから取得するjsonの型定義（Switch Offの場合）
interface FileListItem {
  manage_id: string;
  fiscal_date: string;
  version: string;
  file_div: string;
  file_nm: string;
}

// APIから取得するjsonの型定義（Switch Onの場合）
interface FileMergeListItem {
  fiscal_date: string;
  version: string;
  order_detail: string;
  fg_id: string;
  wip_id: string;
  cost_labor: number;
  cost_subcontract: number;
  cost: number;
  change_value: string;
  product_div: string;
}

// SideListのプロパティ型
interface SideListProps {
  mode: number;                                       // SideListのモード
  DataItem: FileListItem[] | FileMergeListItem[];
  onSearch: (selectedDate: string) => Promise<void>;  // 検索ボタンの動作を親から渡す
  onRowSelect: (selectedData: FileListItem[] | FileMergeListItem[]) => void;    // 行選択時に親へ通知する関数
  onDelete: (id: string) => void;                     // 削除ボタン押下時のコールバック関数
}

//mode:1 Upload
//mode:2 Compare  **不要のため破棄
//mode:3 Merge
const SideList: React.FC<SideListProps> = ({ mode, DataItem, onSearch, onRowSelect, onDelete }) => {

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);                   // 選択された日付を管理
  const [dataItem, setDataItem] = useState<FileListItem[] | FileMergeListItem[]>([]);     // データの状態
  const [isSwitchOn, setIsSwitchOn] = useState(false);                                    // Switchの状態管理
  const [favorites, setFavorites] = useState<string[]>([]);                               // お気に入り管理用
  const [openSnackbar, setOpenSnackbar] = useState(false);                                // Snackbarの開閉状態
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('error'); // Snackbarのタイプ
  const [errorMessage, setMessage] = useState('');                                        // メッセージ

  // Switchの状態が変更されたときの処理
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSwitchOn(event.target.checked); // Switchの状態を更新
  };

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
      <Switch checked={isSwitchOn} onChange={handleSwitchChange} />
      <Divider />
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

  // Snackbarを閉じる処理
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  // 検索ボタン押下時の処理
  const handleSearchClick = async () => {
    if (selectedDate) {
      const formattedDate = selectedDate.format('YYYYMM');  // YYYYMM形式に変換
      await onSearch(formattedDate);                        // 日付を引数に渡して検索
    }
  };

  // お気に入りアイコンの切り替え
  const handleToggleFavorite = (manageId: string) => {
    if (favorites.includes(manageId)) {
      // 既にお気に入りの場合はリストから削除
      setFavorites(favorites.filter((id) => id !== manageId));
    } else {
      // お気に入りに追加
      setFavorites([...favorites, manageId]);
    }
  };

  // 削除（ゴミ箱）押下時のハンドラ
  const handleDelete = async (manage_id: string) => {
    // 削除のためのAPI呼び出しを行う
    try {
      console.log('call delete');
      const response = await apiClient.delete(`/filedelete/${manage_id}`);
      console.log('response.data.status:', response.data.status);
      // データが取得できない場合はメッセージを表示する
      if (response.data.status == 1) {
        // エラーメッセージを設定しSnackbarを表示
        setMessage('一致するデータがありません。');
        setSnackbarSeverity('warning');     // 警告タイプに設定
        setOpenSnackbar(true);
      } else {
        setMessage('データを削除しました。');
        setSnackbarSeverity('success');     // 成功タイプに設定
        setOpenSnackbar(true);
        onDelete(manage_id);  // 削除後にコールバックを呼び出す
      }
    } catch (error) {
      // エラーメッセージを設定しSnackbarを表示
      setMessage('データの削除に失敗しました。');
      setSnackbarSeverity('error');  // 警告タイプに設定
      setOpenSnackbar(true);
    }
  };

  // FixedSizeListに表示するアイテム
  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const item = DataItem[index];  // data[index]の存在を確認
    // Switchの状態に応じたListItemTextの内容を決定
    const primaryText = isSwitchOn
      ? `${item?.fiscal_date} / ${item?.version}` // SwitchがOnの場合
      : item?.file_nm;                            // SwitchがOffの場合
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={() => item && onRowSelect([item])}>
          {/* <ListItemText 
            primary={item ? item.file_nm : 'データがありません'}
            data-manage-id={item?.manage_id}
            onClick={() => {
              if (item) {
                onRowSelect([item]);  // 行が選択されたら親に通知
              }
            }}
          /> */}
           {/* Modeが1の場合 */}
          {mode === 1 && (
            <ListItemText 
              primary={item ? item.file_nm : 'データがありません'}
              data-manage-id={item?.manage_id}
            /> 
          )}
          {/* Modeが1以外の場合 */}
          {mode !== 1 && (
            <ListItemText 
              primary={primaryText} // Switchの状態に応じて表示内容を切り替え
            />
          )}
          {/* Modeが1の場合は削除ボタンを表示 */}
          {mode === 1 ? (
            <IconButton edge="end" onClick={() => handleDelete(item.manage_id)}>
              <DeleteIcon />
            </IconButton>
          ) : (
            // Modeが1以外の場合はお気に入りアイコンを表示
            <IconButton edge="end" onClick={() => handleToggleFavorite(item.manage_id)}>
              {favorites.includes(item.manage_id) ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          )}
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
            onClick={handleSearchClick}
          >
            Search
          </Button>
        </Stack>
      </Toolbar>
      <Divider />
      {listHeader}
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
          {DataItem.length > 0 && (
            <FixedSizeList
              height={560}                  // 表示リストの高さ
              width="100%"                  // 表示リストの幅
              itemSize={40}                 // 各アイテムの高さ
              itemCount={DataItem.length}   // リストアイテムの数(jsonのデータ数により可変)
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