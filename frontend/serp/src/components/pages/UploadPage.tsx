import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Link from '@mui/material/Link';
import apiClient from '../../api/api'; // API関数をインポート

// Parts(子Component)のImport
import UploadDataGrid from '../parts/UploadDataGrid';

// (ファイル情報)APIから取得するデータの型
interface FileListItem {
  manage_id: string;
  fiscal_date: string;
  version: string;
  file_div: string;
  file_nm: string;
}

// APIから取得するデータの型定義
interface ApiResponse {
  status: number;
  result: FileListItem[];
}

// 各データのフィールドが異なるため、動的な型にする
interface GridDataItem {
  [key: string]: any;
}

const UploadPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());    // DatePickerの選択状態
  const [dataItem, setDataItem] = useState<FileListItem[]>([]);               // 検索時APIから受け取るデータ
  const [loading, setLoading] = useState(false);                              // API呼び出し中かどうかのフラグ
  const [gridData, setGridData] = useState<GridDataItem[]>([]);               // GridDataItem に表示するデータ
  const [columns, setColumns] = useState<any[]>([]);                          // DataGrid の列
  const [openSnackbar, setOpenSnackbar] = useState(false);                    // Snackbarの開閉状態
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('error'); // Snackbarのタイプ
  const [errorMessage, setMessage] = useState('');                            // メッセージ

  // 検索ボタン押下時に呼び出す処理
  const handleSearchClick = () => {
    fetchData();
  };

  // 選択された日付を 'YYYYMM' フォーマットに変換
  const getFormattedDate = (): string => {
    return selectedDate ? selectedDate.format('YYYYMM') : dayjs().format('YYYYMM');
  };

  // API呼び出し関数(検索)
  const fetchData = async () => {
    setLoading(true);
    const formattedDate = getFormattedDate();
    try {
      const response = await apiClient.get<ApiResponse>(`/filelist/${formattedDate}`);
      if (response.data.status == 1) {
        setMessage('一致するデータがありません。');
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

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchData();
  }, useState(true));

  // Snackbarを閉じる処理
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // 行が選択されたときに呼ばれる関数
  const handleRowSelect = async (selectedData: FileListItem) => {

    const item = selectedData as FileListItem;  // 型アサーション

    // DataGrid を初期化
    setGridData([]);
    setColumns([]);

    // APIを呼び出し
    try {
      const response = await apiClient.get(`/filedetail/${item.manage_id}`);
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

  // 対象行のデータを削除
  const handleDelete = async (manage_id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.delete<ApiResponse>(`/filedelete/${manage_id}`);
      if (response.data.status == 1) {
        setMessage('データの削除に失敗しました。');
        setSnackbarSeverity('warning'); // 警告タイプに設定
        setOpenSnackbar(true);
      } else {
        setMessage('データを削除しました。');
        setSnackbarSeverity('success'); // 成功タイプに設定
        setOpenSnackbar(true);
        setDataItem(response.data.result);
      }

    } catch (error) {
      setMessage('データの削除に失敗しました。');
      setSnackbarSeverity('error'); // 警告タイプに設定
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((files: File[]) => {
    // ここでファイルの処理を行います
    <Alert severity="error">OK</Alert>;
    console.log('files:', files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <Box>
      <Grid container spacing={1} >
        {/* ActionArea */}
        <Grid item lg={12} >
          <Paper
            variant="outlined"
            square
            {...getRootProps()}
            style={{
              border: '2px dashed #0087F7',
              height: '100%',
              display: 'flex',
              alignItems: 'stretch',
              padding: 20,
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>ファイルをここにドロップしてください</Typography>
            ) : (
              <Typography>
                Excelファイルをここにドラッグ＆ドロップするか、クリックして選択してください。
              </Typography>
            )}
          </Paper>
          {isDragActive && (
            <Alert severity="info">
              ファイルをここにドロップしてください
            </Alert>
          )}
        </Grid>
        {/* HistoryArea */}
        <Grid item lg={2} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              width: '100%',
              height: '75vh',
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
                    (dataItem as (FileListItem)[]).map((item, index) => (
                      <ListItem key={index} onClick={() => handleRowSelect(item)}>
                        <ListItemButton>
                          <ListItemText
                            primary={
                              (item as FileListItem).file_nm
                            }
                          />
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete((item as FileListItem).manage_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
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
        <Grid item lg={10} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              height: '75vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ height: '100%', width: '100%' }}>
              {/* UpdateDataGridに選択されたデータを渡して表示 */}
              {gridData.length > 0 && (
                <UploadDataGrid gridData={gridData} columns={columns} />
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
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadPage;
