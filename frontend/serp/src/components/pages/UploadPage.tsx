import { useState } from 'react';
import { useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import Snackbar from '@mui/material/Snackbar';
import apiClient from '../../api/api'; // API関数をインポート

// Parts(子Component)のImport
import SideList from '../parts/SideList';
import UploadDataGrid from '../parts/UploadDataGrid';

// (ファイル情報)APIから取得するデータの型
interface DataItem {
  manage_id: string;
  fiscal_date: string;
  version: string;
  file_div: string;
  file_nm: string;
}

// 各データのフィールドが異なるため、動的な型にする
interface GridDataItem {
  [key: string]: any;
}

const UploadPage = () => {
  const [data, setData] = useState<DataItem[]>([]);               // SideList から受け取るデータ
  const [gridData, setGridData] = useState<GridDataItem[]>([]);   // GridDataItem に表示するデータ
  const [columns, setColumns] = useState<any[]>([]);              // DataGrid の列
  const [openSnackbar, setOpenSnackbar] = useState(false);        // Snackbarの開閉状態
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('error'); // Snackbarのタイプ
  const [errorMessage, setMessage] = useState('');                // メッセージ

  // Snackbarを閉じる処理
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // SideListでデータが取得されたときに呼ばれる関数
  const handleDataFetch = (fetchedData: DataItem[]) => {
    setData(fetchedData);  // SideListからデータを受け取って保存
  };

  // SideListで行が選択されたときに呼ばれる関数
  const handleRowSelect = async (selectedData: DataItem[]) => {
    if (selectedData.length > 0) {
      // 選択されたmanage_idを取得
      const manageId = selectedData[0].manage_id;

      // DataGrid を初期化
      setGridData([]);
      setColumns([]);

      // manage_idを使ってAPIを呼び出し
      try {
        const response = await apiClient.get(`/filedetail/${manageId}`);
        const gridData = response.data.result;  // 取得したデータを保存

        if (gridData.length > 0) {
          // 取得したデータのキーに応じて列を動的に生成
          const firstItem = gridData[0];
          const generatedColumns = Object.keys(firstItem).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, ' ').toUpperCase(),  // カラム名を加工
            width: 180,
          }));

          setColumns(generatedColumns);  // 列定義を更新
          setGridData(gridData);  // DataGridに表示するためのデータを更新
        }
        setMessage('データを取得しました。');
        setSnackbarSeverity('success');  // 成功タイプに設定
        setOpenSnackbar(true);
      } catch (error) {
        setMessage('データの取得に失敗しました。');
        setSnackbarSeverity('error');  // 警告タイプに設定
        setOpenSnackbar(true);
      }
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
        <Grid item lg={12} >
          <Paper
            variant="outlined"
            square
            {...getRootProps()}
            style={{
              border: '2px dashed #0087F7',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: 5,
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
        <Grid item lg={3} alignItems="stretch">
          {/* SideListにデータ取得と選択された行の処理を委譲 */}
          <SideList
            mode={1}
            onDataFetch={handleDataFetch}
            onRowSelect={handleRowSelect}
          />
        </Grid>
        <Grid item lg={9} alignItems="stretch">
          <Paper
            sx={{
              p: 2,
              height: '80vh',
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
