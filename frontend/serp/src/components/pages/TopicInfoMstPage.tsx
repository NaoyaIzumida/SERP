import * as React from 'react';
import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';

// 案件情報マスタデータ
interface TopicInfo {
	order_detail: string;
	order_rowno: string;
	project_nm: string;
	group_id: string;
	disp_seq: number;
	modified_date: Date;
}

const columns: GridColDef<(typeof rows)[number]>[] = [
	{
		field: 'order_detail',
		headerName: '受注明細',
		type : 'number', 
		width: 150, 
		editable: false,
	},
	{
		field: 'order_rowno',
		headerName: '受注行番号',
		type : 'string',
		width: 120,
		editable: false,
	},
	{
		field: 'project_num',
		headerName: '契約工事略名',
		type : 'string',
		width: 500,
		editable: false,
	},
	{
		field: 'group_id',
		headerName: 'グループID',
		type: 'string',
		width: 110,
		editable: true,
	},
	{
		field: 'disp_seq',
		headerName: '表示順',
		type: 'number',
		width: 160,
		editable: true,
	},
];
  
const rows = [
	{ id: 1, order_detail: "ABCDE0000001", order_rowno: '01', project_num: 'テスト契約ABCDEFGHIJKLMNOPQRSTU', group_id: '01' , disp_seq: 1},
	{ id: 2, order_detail: "ABCDE0000002", order_rowno: '02', project_num: 'テスト契約B', group_id: '01' , disp_seq: 2},
	{ id: 3, order_detail: "ABCDE0000003", order_rowno: '03', project_num: 'テスト契約C', group_id: '01' , disp_seq: 3},
	{ id: 4, order_detail: "ABCDE0000004", order_rowno: '04', project_num: 'テスト契約D', group_id: '02' , disp_seq: 4},
	{ id: 5, order_detail: "ABCDE0000005", order_rowno: '05', project_num: 'テスト契約E', group_id: null , disp_seq: 5},
	{ id: 6, order_detail: "ABCDE0000006", order_rowno: '06', project_num: null,          group_id: '02' , disp_seq: 6},
	{ id: 7, order_detail: "ABCDE0000007", order_rowno: '07', project_num: 'テスト契約G', group_id: '03' , disp_seq: 7},
	{ id: 8, order_detail: "ABCDE0000008", order_rowno: '08', project_num: 'テスト契約H', group_id: '04' , disp_seq: 8},
	{ id: 9, order_detail: "ABCDE0000009", order_rowno: '09', project_num: 'テスト契約I', group_id: '05' , disp_seq: 9},
];

const TopicInfoMstPage: React.FC = () => {
	return (
    <Box sx={{ height: 800, width: '100%' }}>
      <FormControlLabel control={<Checkbox defaultChecked />} label="グループID未設定のみ表示" />
			<Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  // onClick={}
                >
                  Search
                </Button>
			<DataGrid
					rows={rows}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: 30,
							},
						},
					}}
					pageSizeOptions={[5]}
					checkboxSelection
					disableRowSelectionOnClick
				/>
    </Box>
	);
};

export default TopicInfoMstPage;