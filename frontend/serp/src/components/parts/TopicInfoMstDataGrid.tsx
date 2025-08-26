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
	const columnsWithAutoWidth: GridColDef[] = columns.map((col) => ({
		...col,
		flex: 1,
		align: typeof rows[0]?.[col.field] === 'number' ? 'right' : 'left',
	}));

	const rowsWithUniqueId = rows.map((row, index) => ({
		id: row.id ?? index,
		...row,
	}));

	return (
		<div style={{ height: 640, width: '100%' }}>
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
					pagination: { paginationModel: { pageSize: 10 } },
				}}
				autoHeight={false}
				getRowId={(row) => row.id}
			/>
		</div>
	);
};

export default TopicInfoMstDataGrid;
