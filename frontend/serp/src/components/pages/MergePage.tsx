import React from "react";
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import apiClient from '../../api/api'; // API関数をインポート

// Parts(子Component)のImport
import SideList from '../parts/SideList';

// (ファイル情報)APIから取得するデータの型
interface DataItem {
  manage_id: string;
  fiscal_date: string;
  version: string;
  file_div: string;
  file_nm: string;
}

const Upload: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);               // SideList から受け取るデータ
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

  return (
    <Box>
      <Grid container spacing={1} >
        <Grid item lg={3} alignItems="stretch">
          {/* SideListにデータ取得と選択された行の処理を委譲 */}
          <SideList
            mode={3}
            onDataFetch={handleDataFetch}
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

export default Upload;