import React, { SyntheticEvent, useState, useEffect } from "react";
import apiClient from '../../api/api'; // API関数をインポート
import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';

// Parts(子Component)のImport
import TopicInfoMstDataGrid from '../parts/TopicInfoMstDataGrid';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import FullWidthInputDisabledCell from "../parts/FullWidthInputDisabledCell";
import MaxNumberEditCell from "../parts/MaxNumberEditCell";
import { useSnackbar, SnackbarSeverity } from '../parts/SnackbarProvider';

// 案件情報マスタデータ
interface TopicInfoMstList {
	id: number;
	order_detail: string;
	order_rowno: string;
	project_nm: string;
	group_id: string;
	disp_seq: string;
}

// APIから取得するデータの型定義
interface ApiResponse {
	status: number;
	result: TopicInfoMstList[];
}

const TopicInfoMstPage: React.FC = () => {
	const [isGroupIdFlg, setIsGroupIdFlg] = useState(true);
	const [isRequesting, setIsRequesting] = useState(false);
	const { showSnackbar } = useSnackbar();
	const [dataItem, setDataItem] = useState<TopicInfoMstList[]>([]);
	const [selectedRowIds, setSelectedRowIds] = useState<(number | string)[]>([]);

	// カラム設定
	const columns = [
		{
			field: 'order_detail',
			headerName: '受注明細',
			type: 'string',
			width: 200,
			editable: false,
		},
		{
			field: 'order_rowno',
			headerName: '受注行番号',
			type: 'string',
			width: 100,
			editable: false,
		},
		{
			field: 'project_nm',
			headerName: '契約工事略名',
			type: 'string',
			width: 800,
			editable: false,
		},
		{
			field: 'group_id',
			headerName: 'グループID',
			type: 'string',
			editable: true,
			width: 150,
			renderEditCell: (params: GridRenderEditCellParams) => <FullWidthInputDisabledCell {...params} maxLength={2} />,
		},
		{
			field: 'disp_seq',
			headerName: '表示順',
			type: 'string',
			editable: true,
			width: 150,
			renderEditCell: (params: GridRenderEditCellParams) => <MaxNumberEditCell {...params} maxNumber={2147483647} />, // 入力の最大値をpostgreDBinteger型に設定
		},
	];

	// グループID未設定のみチェックボックスの状態が変更されたときの処理
	const handleCheckBoxChange = (_event: SyntheticEvent<Element, Event>, checked: boolean) => {
		setIsGroupIdFlg(checked);
	};

	// 検索ボタン押下時処理
	const handleSearchClick = () => {
		fetchData();
	};

	// API呼び出し関数(検索)
	const fetchData = async () => {

		// DataGridのチェックボックスをクリア
		setSelectedRowIds([])

		try {
			// API呼び出し中の場合は処理を抜ける
			if (isRequesting) {
				return;
			} else {
				setIsRequesting(true);
			}

			// 案件情報マスタ取得
			let response = await apiClient.get<ApiResponse>(`/topicinfolist/${isGroupIdFlg}`);

			if (response.data.status == 1) {
				showSnackbar('案件情報がありません。', SnackbarSeverity.WARNING);
				setDataItem([]);
			} else {
				showSnackbar('データを取得しました。', SnackbarSeverity.SUCCESS);
				setDataItem(response.data.result);
			}
		} catch (error) {
			setDataItem([]);
			showSnackbar('案件情報の取得に失敗しました。', SnackbarSeverity.ERROR);
		} finally {
			setIsRequesting(false);
		}
	};

	// DataGrid編集時処理
	const handleRowEdit = (newRow: TopicInfoMstList, oldRow: TopicInfoMstList): TopicInfoMstList => {
		const updatedRows = dataItem.map((row) =>
			row.order_detail === oldRow.order_detail && row.order_rowno === oldRow.order_rowno
				? newRow
				: row
		);
		setDataItem(updatedRows);

		// 編集された行の id を選択状態に追加（重複は避ける）
		if (!selectedRowIds.includes(newRow.id)) {
			setSelectedRowIds((prev) => [...prev, newRow.id]);
		}

		return newRow;
	};

	// 案件情報マスタ更新処理
	const handleUpdate = async () => {
		// 編集されている行だけを抽出
		const selectedData = dataItem.filter(item => selectedRowIds.includes(item.id));

		// 編集済の行が無ければ処理を抜ける
		if (selectedData.length <= 0) {
			setSelectedRowIds([])
			return;
		}

		try {
			// API呼び出し中の場合は処理を抜ける
			if (isRequesting) {
				return;
			} else {
				setIsRequesting(true);
			}

			const response = await apiClient.put('/topicinfoupdate', {
				topics: selectedData.map(item => ({
					order_detail: item.order_detail,
					order_rowno: item.order_rowno,
					group_id: item.group_id,
					disp_seq: item.disp_seq === '' ? null : item.disp_seq,
				})
				)
			});
			console.log('response.data.status:', response.data.status);
			if (response.data.status == 0) {
				showSnackbar('更新処理を実行しました。', SnackbarSeverity.SUCCESS);
				fetchData();
			} else {
				showSnackbar('更新処理に失敗しました。', SnackbarSeverity.ERROR);
			}
		} catch (error) {
			showSnackbar('更新処理に失敗しました。', SnackbarSeverity.ERROR);
		}
		finally {
			setIsRequesting(false);
		}
	};

	// Initialize
	useEffect(() => {
		fetchData();
	}, []);

	return (
		<Box sx={{ height: 800, width: '100%' }}>

			{/* 検索条件 */}
			<FormControlLabel control={<Checkbox defaultChecked />} label="グループID未設定のみ表示" onChange={handleCheckBoxChange} />

			{ /* アクションボタン */}
			<Button
				variant="outlined"
				startIcon={<SearchIcon />}
				onClick={handleSearchClick}
			>
				Search
			</Button>

			<Button style={{ marginLeft: '5px' }}
				variant="outlined"
				startIcon={<UpdateRoundedIcon />}

				onClick={handleUpdate}
			>
				Update
			</Button>

			{/* TopicInfoMstDataGridに取得したデータを渡して表示 */}
			<Box sx={{ height: '100%', width: '100%' }}>
				{dataItem.length > 0 && (
					<TopicInfoMstDataGrid
						rows={dataItem}
						columns={columns}
						processRowUpdate={handleRowEdit}
						selectedRowIds={selectedRowIds}
						onSelectionModelChange={setSelectedRowIds}
					/>
				)}
			</Box>
		</Box>
	);
};

export default TopicInfoMstPage;