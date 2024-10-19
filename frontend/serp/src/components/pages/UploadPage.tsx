import { useState } from 'react';
import { useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';

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

const UploadPage = () => {
  const [data, setData] = useState<DataItem[]>([]);           // SideList から受け取るデータ
  const [gridData, setGridData] = useState<DataItem[]>([]);   // DataGrid に表示するデータ

  // SideListでデータが取得されたときに呼ばれる関数
  const handleDataFetch = (fetchedData: DataItem[]) => {
    setData(fetchedData);  // SideListからデータを受け取って保存
  };

  // SideListで行が選択されたときに呼ばれる関数
  const handleRowSelect = (selectedGridData: DataItem[]) => {
    setGridData(selectedGridData);  // SideListから選択されたデータを受け取って保存
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
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ height: '100%', width: '100%' }}>
              {/* UpdateDataGridに選択されたデータを渡して表示 */}
              {gridData.length > 0 && (
                <UploadDataGrid gridData={gridData} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UploadPage;
