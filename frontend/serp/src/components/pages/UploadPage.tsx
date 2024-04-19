import * as React from 'react';
import { useCallback } from "react";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import FilterListIcon from '@mui/icons-material/FilterList';
import GenericTemplate from "../templates/GenericTemplate";
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useDropzone } from "react-dropzone";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Demo用List作成
function renderRow(props: ListChildComponentProps) {
  const { index, style } = props;

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
        <IconButton edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}

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
  { id: 1, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 35330, subcontract: 26138, cost: 0 },
  { id: 2, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 221447, subcontract: 726315, cost: 0 },
  { id: 3, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 752743, subcontract: 0, cost: 0 },
  { id: 4, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 379322, subcontract: 0, cost: 26647 },
  { id: 5, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 41067, subcontract: 0, cost: 90622 },
  { id: 6, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 315730, subcontract: 0, cost: 0 },
  { id: 7, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 117034, subcontract: 600000, cost: 0 },
  { id: 8, costdivisionCd: '14000100', costdivisionNm: '技術部', acceptedDetails: 'ZAB202300020-1-14000100', customerName: '旭化成エンジニアリング株式会社', material: 0, labor: 2607, subcontract: 0, cost: 0 },
];

const UploadPage = () => {

  const onDrop = useCallback((files: File[]) => {
    // ここでファイルの処理を行います
    <Alert severity="error">OK</Alert>
    console.log('files:', files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
 });

  const label = { inputProps: { 'aria-label': 'Switch demo' } };

  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);

  return(
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
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: 5,
              }}
            >
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <Typography>ファイルをここにドロップしてください</Typography> :
                  <Typography>Excelファイルをここにドラッグ＆ドロップするか、クリックして選択してください。</Typography>
              }
            </Paper>
            {isDragActive && <Alert severity="info">ファイルをここにドロップしてください</Alert>}
          </Grid>
          <Grid item xs={12} md={3} lg={3} direction="row" alignItems="stretch">
            <Paper
              sx={{
                p: 2,
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Toolbar>
                <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Account Months"
                      format="YYYY/MM"
                      defaultValue={dayjs()}
                      views={['year', 'month']}
                    />
                  </LocalizationProvider>
                  <Button variant="outlined" startIcon={<SearchIcon />}>
                    Search
                  </Button>
                </Stack>
              </Toolbar>
              <Divider />
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
                  sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}
                >
                  <FixedSizeList
                    height={560}
                    width="100%"
                    itemSize={40}
                    itemCount={30}
                    overscanCount={5}
                  >
                    {renderRow}
                  </FixedSizeList>
                </Box>
              </Toolbar>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9} lg={9} alignItems="stretch">
            <Paper
              sx={{
                p: 2,
                height: "100%",
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
  )
};

export default UploadPage;