import * as React from 'react';
import { useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import GenericTemplate from '../templates/GenericTemplate';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';

// Parts化したリストのImport
import SideList from '../parts/SideList';

const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'costdivisionCd',
    headerName: 'Cost Division Code',
    width: 150,
    editable: false,
  },
  {
    field: 'costdivisionNm',
    headerName: 'Cost Division Name',
    width: 150,
    editable: false,
  },
  {
    field: 'acceptedDetails',
    headerName: 'Accepted Details',
    width: 300,
    editable: false,
  },
  {
    field: 'customerName',
    headerName: 'Customer Name',
    width: 300,
    editable: false,
  },
  {
    field: 'material',
    headerName: 'Material Cost',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'labor',
    headerName: 'Labor Cost',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'subcontract',
    headerName: 'Subcontract Cost',
    type: 'number',
    width: 150,
    editable: false,
  },
  {
    field: 'cost',
    headerName: 'Cost',
    type: 'number',
    width: 150,
    editable: false,
  },
];

const rows = [
  {
    id: 1,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 35330,
    subcontract: 26138,
    cost: 0,
  },
  {
    id: 2,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 221447,
    subcontract: 726315,
    cost: 0,
  },
  {
    id: 3,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 752743,
    subcontract: 0,
    cost: 0,
  },
  {
    id: 4,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 379322,
    subcontract: 0,
    cost: 26647,
  },
  {
    id: 5,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 41067,
    subcontract: 0,
    cost: 90622,
  },
  {
    id: 6,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 315730,
    subcontract: 0,
    cost: 0,
  },
  {
    id: 7,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 117034,
    subcontract: 600000,
    cost: 0,
  },
  {
    id: 8,
    costdivisionCd: '14000100',
    costdivisionNm: '技術部',
    acceptedDetails: 'ZAB202300020-1-14000100',
    customerName: '旭化成エンジニアリング株式会社',
    material: 0,
    labor: 2607,
    subcontract: 0,
    cost: 0,
  },
];

const UploadPage = () => {
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
    <GenericTemplate title="Upload">
      <Box>
        <Grid container spacing={0.5}>
          <Grid item xs={12}>
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
          <Grid item xs={12} md={3} lg={3} direction="row" alignItems="stretch">
            <SideList mode={1} />
          </Grid>
          <Grid item xs={12} md={9} lg={9} alignItems="stretch">
            <Paper
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </GenericTemplate>
  );
};

export default UploadPage;
