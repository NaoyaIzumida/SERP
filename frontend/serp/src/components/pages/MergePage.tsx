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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Switch from '@mui/material/Switch';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../api/api'; // API関数をインポート


// Parts(子Component)のImport
import MergeDataGrid from '../parts/MergeDataGrid';
import { SnackbarSeverity, useSnackbar, useSystem } from '../../contexts/AppUIContext';
import { useAuth } from "../../contexts/AuthContext";

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
  error: string;
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
  const { showSnackbar } = useSnackbar();
  const { setTitle } = useSystem();
  const { user } = useAuth();

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
    setFavorites([]);
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
      if (response.data.status == 0) {
        showSnackbar('データを取得しました。', SnackbarSeverity.SUCCESS);
        setDataItem(response.data.result);
      }
      if (response.data.status == 1) {
        showSnackbar('一致するファイル一覧がありません。', SnackbarSeverity.WARNING);
        setDataItem([]);                // 削除成功後にデータグリッドをクリアする
        setGridData([]);                // DataGrid を初期化
        setColumns([]);
      } else if (response.data.status == -1) {
        console.error("データ取得失敗：", response.data.error);
      }
      else {
        throw new Error(`不正なステータス [status=${response.data.status}]`);
      }
    } catch (error) {
      console.error("例外発生：", error);
      showSnackbar('データの取得に失敗しました。', SnackbarSeverity.ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitle("マージ");
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

      showSnackbar('ファイルをダウンロードしました。', SnackbarSeverity.SUCCESS);
    } catch (error) {
      console.log('error:', error);
      showSnackbar('ダウンロードに失敗しました。', SnackbarSeverity.ERROR);
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
      if (response.data.status == 0) {
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
        showSnackbar('データを取得しました。', SnackbarSeverity.SUCCESS);
      }
      else if (response.data.status == 1) {
        showSnackbar('データがありません。', SnackbarSeverity.WARNING);
      }
      else if (response.data.status == -1) {
        console.error("データ取得失敗：", response.data.error);
        showSnackbar('データの取得に失敗しました。', SnackbarSeverity.ERROR);
      }
      else {
        throw new Error(`不正なステータス [status=${response.data.status}]`);
      }
    } catch (error) {
      console.error('例外発生:', error);
      showSnackbar('データの取得に失敗しました。', SnackbarSeverity.ERROR);
    }
  };

  // APIに選択中のお気に入りデータを送信する処理
  const handleMerge = async () => {
    try {
      const response = await apiClient.put('/filemerge', {
        manage_ids: favorites, // 選択された manage_id を送信
        modified_user: user?.azure_ad_id
      });
      if (response.data.status == 0) {
        showSnackbar('マージ処理を実行しました。', SnackbarSeverity.SUCCESS);
        fetchData();
      } else if (response.data.status == 1) {
        throw new Error(`不正なステータス [status=${response.data.status}]`);
      } else if (response.data.status == -1) {
        console.error('マージ処理失敗：', response.data.error);
        showSnackbar('マージ処理に失敗しました。', SnackbarSeverity.ERROR);
      }
      else {
        throw new Error(`不正なステータス [status=${response.data.status}]`);
      }
    } catch (error) {
      console.error('例外発生：', error);
      showSnackbar('マージ処理に失敗しました。', SnackbarSeverity.ERROR);
    }
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
      </Grid>
    </Box>
  );
};

export default MergePage;