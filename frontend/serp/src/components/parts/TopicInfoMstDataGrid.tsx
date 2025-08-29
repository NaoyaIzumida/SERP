import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TopicInfoMstDataGridProps {
	rows: any[];
	columns: GridColDef[];
	processRowUpdate?: (newRow: any, oldRow: any) => any;
	selectedRowIds: (number | string)[];
	onSelectionModelChange: (ids: (number | string)[]) => void;
}

const TopicInfoMstDataGrid: React.FC<TopicInfoMstDataGridProps> = ({
	rows,
	columns,
	processRowUpdate,
	selectedRowIds,
	onSelectionModelChange,
}) => {

	const columnsWithAutoWidth: GridColDef[] = columns.map((col) => {
		const hasFixedWidth = col.width != null;
	
		return {
			...col,
			flex: hasFixedWidth ? undefined : 1,
			align: typeof rows[0]?.[col.field] === 'number' ? 'right' : 'left',       // 数値列の場合は右詰め
    	valueFormatter: (params: any) => {
      	const value = params.value;
      	return value;
    	},
		};
	});

	const rowsWithUniqueId = rows.map((row, index) => ({
		id: row.id ?? index,
		...row,
	}));

	return (
		<div style={{ height: 700, width: '100%' }}>
			<DataGrid
				rows={rowsWithUniqueId}
				columns={columnsWithAutoWidth}
				processRowUpdate={processRowUpdate}
				checkboxSelection
				disableRowSelectionOnClick
				rowSelectionModel={selectedRowIds}
				onRowSelectionModelChange={(ids) => onSelectionModelChange(ids)}
				pagination
				initialState={{
					pagination: { paginationModel: { pageSize: 30 } },
				}}
				autoHeight={false}
				getRowId={(row) => row.id}
			/>
		</div>
	);
};

export default TopicInfoMstDataGrid;
