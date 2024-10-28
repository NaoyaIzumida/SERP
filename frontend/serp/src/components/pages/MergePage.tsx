import React from "react";
import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver'; // ファイルを保存するためのライブラリ
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MergeIcon from '@mui/icons-material/Merge';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert  from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Switch from '@mui/material/Switch';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Link from '@mui/material/Link';
import apiClient from '../../api/api'; // API関数をインポート

// Parts(子Component)のImport
import MergeDataGrid from '../parts/MergeDataGrid';

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

// APIから取得するデータの型定義
interface ApiResponse {
  status: number;
  result: FileListItem[] | FileMergeListItem[];
}

// 各データのフィールドが異なるため、動的な型にする
interface GridDataItem {
  [key: string]: any;
}

const MergePage: React.FC = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);                                // Switchの状態管理
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));            // DatePickerの選択状態
  const [dataItem, setDataItem] = useState<FileListItem[] | FileMergeListItem[]>([]); // データの状態
  const [loading, setLoading] = useState(false);                                      // API呼び出し中かどうかのフラグ
  const [favorites, setFavorites] = useState<string[]>([]);                           // お気に入りの manage_id を保持
  const [gridData, setGridData] = useState<GridDataItem[]>([]);                       // GridDataItem に表示するデータ
  const [columns, setColumns] = useState<any[]>([]);                                  // DataGrid の列
  const [openSnackbar, setOpenSnackbar] = useState(false);                            // Snackbarの開閉状態
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('error'); // Snackbarのタイプ
  const [errorMessage, setMessage] = useState('');                                    // メッセージ

  // Switchの状態が変更されたときの処理
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSwitchOn(event.target.checked);
  };

  // 検索ボタン押下時に呼び出す処理
  const handleSearchClick = () => {
    fetchData();
  };

  // 選択された日付を 'YYYYMM' フォーマットに変換
  const getFormattedDate = (): string => {
    return selectedDate ? selectedDate.format('YYYYMM') : dayjs().subtract(1, 'month').format('YYYYMM');
  };

  // API呼び出し関数(検索)
  const fetchData = async () => {
    setLoading(true);
    const formattedDate = getFormattedDate();
    try {
      let response;
      if (isSwitchOn) {
        // SwitchがOnのとき
        response = await apiClient.get<ApiResponse>(`/filemergelist/${formattedDate}`);
      } else {
        // SwitchがOffのとき
        response = await apiClient.get<ApiResponse>(`/filelist/${formattedDate}`);
      }

      if (response.data.status == 1) {
        setMessage('一致するファイル一覧がありません。');
        setSnackbarSeverity('warning'); // 警告タイプに設定
        setOpenSnackbar(true);
      } else {
        setMessage('データを取得しました。');
        setSnackbarSeverity('success'); // 成功タイプに設定
        setOpenSnackbar(true);
        setDataItem(response.data.result);
      }

    } catch (error) {
      setMessage('データの取得に失敗しました。');
      setSnackbarSeverity('error'); // 警告タイプに設定
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初回ロード時にデータを取得
    fetchData();
  }, [isSwitchOn]); // Switchが変更されたときにデータを再取得

  // お気に入りアイコンのトグル処理
  const handleToggleFavorite = (manageId: string) => {
    if (favorites.includes(manageId)) {
      // 既にお気に入りの場合はリストから削除
      setFavorites(favorites.filter((id) => id !== manageId));
    } else {
      // お気に入りに追加
      setFavorites([...favorites, manageId]);
    }
  };

  // ダウンロードボタン押下時に呼び出す処理
  const handleFileDownload = async (fiscalDate: string, version: string) => {
    try {
      const response = await apiClient.get(`/filedownload/${fiscalDate},${version}`, {
        responseType: 'blob', // バイナリデータを受け取るために blob 形式に設定
      });

      const fileName = `${fiscalDate}_${version}.xlsx`; // ダウンロードファイル名
      saveAs(response.data, fileName); // ファイルを保存

      setMessage('ファイルをダウンロードしました。');
      setSnackbarSeverity('success'); // 警告タイプに設定
      setOpenSnackbar(true);
    } catch (error) {
      console.log('error:', error);
      setMessage('ダウンロードに失敗しました。');
      setSnackbarSeverity('error'); // 警告タイプに設定
      setOpenSnackbar(true);
    }
  };

  // 行が選択されたときに呼ばれる関数
  const handleRowSelect = async (selectedData: FileListItem | FileMergeListItem) => {

    // Switchの状態に応じて表示する文字列を決定
    let displayString: string;

    if (isSwitchOn) {
      // SwitchがOnの場合
      const item = selectedData as FileMergeListItem;         // 型アサーション
      displayString = `${item.fiscal_date},${item.version}`;  // fiscal_dateとversionをカンマでつなげる
    } else {
      // SwitchがOffの場合
      const item = selectedData as FileListItem;              // 型アサーション
      displayString = item.manage_id;                         // manage_idを設定
    }

    // Switchの状態に応じてAPIを呼び出す
    let response;
    // DataGrid を初期化
    setGridData([]);
    setColumns([]);

    // APIを呼び出し
    try {
      if (isSwitchOn) {
        response = await apiClient.get(`/filemergedetail/${displayString}`); // マージ結果のデータ取得
      } else {
        response = await apiClient.get(`/filedetail/${displayString}`);      // データ取得
      }
      const gridData = response.data.result;  // 取得したデータを保存
      if (gridData.length > 0) {
        // 取得したデータのキーに応じて列を動的に生成
        const firstItem = gridData[0];
        const generatedColumns = Object.keys(firstItem).map((key) => ({
          field: key,
          headerName: key.replace(/_/g, ' ').toUpperCase(),  // カラム名を加工
          width: 180,
        }));

        setColumns(generatedColumns);   // 列定義を更新
        setGridData(gridData);          // DataGridに表示するためのデータを更新
      }
      setMessage('データを取得しました。');
      setSnackbarSeverity('success');   // 成功タイプに設定
      setOpenSnackbar(true);
    } catch (error) {
      setMessage('データの取得に失敗しました。');
      setSnackbarSeverity('error');     // 警告タイプに設定
      setOpenSnackbar(true);
    }
  };

  // APIに選択中のお気に入りデータを送信する処理
  const handleMerge = async () => {
    try {
      const response = await apiClient.put('/filemerge', {
        manage_id: favorites, // 選択された manage_id を送信
      });
      console.log('esponse.data.status:', response.data.status);
      if (response.data.status == 0) {
        setMessage('マージ処理を実行しました。');
        setSnackbarSeverity('success'); // 成功タイプに設定
        setOpenSnackbar(true);
      } else {
        setMessage('マージ処理に失敗しました。');
        setSnackbarSeverity('error'); // 警告タイプに設定
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage('マージ処理に失敗しました。');
      setSnackbarSeverity('error'); // 警告タイプに設定
      setOpenSnackbar(true);
    }
  };

  // Snackbarを閉じる処理
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Grid container spacing={1} >
        {/* ActionArea */}
        <Grid item lg={12} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box justifyContent="flex-end" display="flex">
              <Button variant="contained" onClick={handleMerge}>
                <MergeIcon />
                Merge
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* HistoryArea */}
        <Grid item lg={3} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              width: '100%',
              height: '73vh',
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
                {/* 検索条件.年月 */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Account Months"
                    format="YYYYMM"
                    defaultValue={dayjs().subtract(1, 'month')}  // 1ヶ月前の日付を設定
                    views={['year', 'month']} // 年月のみ選択可能にする
                    value={selectedDate}
                    onChange={(newDate) => {
                      if (newDate) {
                        setSelectedDate(newDate);
                      }
                    }}
                  />
                </LocalizationProvider>
                {/* 検索ボタン */}
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
            <Stack
              direction="row"
              justifyContent="left"
              alignItems="stretch"
              spacing={0.5}
            >
              {/* Switch */}
              <Switch
                checked={isSwitchOn}
                onChange={handleSwitchChange}
                inputProps={{ 'aria-label': 'Switch between filelist and filemergelist' }}
              />
            </Stack>
            <Divider />
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-Start',
                px: [1],
                padding: 0,
              }}
            >
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Dataが取得できた場合、Listを作成 */}
                  {dataItem.length > 0 ? (
                    (dataItem as (FileListItem | FileMergeListItem)[]).map((item, index) => (
                      <ListItem key={index}>
                        <ListItemButton>
                          <ListItemText
                            primary={
                              isSwitchOn
                                ? `${(item as FileMergeListItem).fiscal_date} - ${(item as FileMergeListItem).version}`
                                : (item as FileListItem).file_nm
                            }
                            onClick={() => handleRowSelect(item)}
                          />
                          {isSwitchOn && (
                            <IconButton
                              edge="end"
                              onClick={() => handleFileDownload(item.fiscal_date, item.version)}
                            >
                              <FileDownloadIcon />
                            </IconButton>
                          )}
                          {!isSwitchOn && (
                            <IconButton
                              edge="end"
                              onClick={() => handleToggleFavorite((item as FileListItem).manage_id)}
                            >
                              {favorites.includes((item as FileListItem).manage_id) ? (
                                <FavoriteIcon color="error" />
                              ) : (
                                <FavoriteBorderIcon />
                              )}
                            </IconButton>
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))
                  ) : (
                    <p>No data available</p>
                  )}
                </Box>
              )}
            </Toolbar>
          </Paper>
        </Grid>
        {/* DataArea */}
        <Grid item lg={9} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              height: '73vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ height: '100%', width: '100%' }}>
              {/* MergeDataGridに選択されたデータを渡して表示 */}
              {gridData.length > 0 && (
                <MergeDataGrid gridData={gridData} columns={columns} />
              )}
            </Box>
          </Paper>
        </Grid>
        {/* CopyrightArea */}
        <Grid item lg={12} >
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="http://www.sci-it.co.jp/">
              SCI
            </Link>
            {' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Grid>
      </Grid>

      {/* Snackbarでエラーメッセージを表示 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}  // 5秒後に自動で閉じる
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}  // 右下に配置
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MergePage;