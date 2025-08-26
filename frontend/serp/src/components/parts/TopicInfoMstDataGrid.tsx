import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TopicInfoMstDataGridProps {
	rows: any[];
	columns: GridColDef[];
	processRowUpdate?: (newRow: any, oldRow: any) => any;
}

const TopicInfoMstDataGrid: React.FC<TopicInfoMstDataGridProps> = ({ rows, columns, processRowUpdate }) => {
	const [sortModel, setSortModel] = useState([]);

	const columnsWithAutoWidth: GridColDef[] = columns.map((col) => ({
		...col,
		flex: 1,
		align: typeof rows[0]?.[col.field] === 'number' ? 'right' : 'left',
	}));

	const rowsWithUniqueId = rows.map((row, index) => ({
		id: index,
		...row,
	}));

	return (
		<div style={{ height: 640, width: '100%' }}>
			<DataGrid
				rows={rowsWithUniqueId}
				columns={columnsWithAutoWidth}
				processRowUpdate={processRowUpdate}
				initialState={{
					pagination: {
						paginationModel: { pageSize: 10 },
					},
				}}
				pagination
				getRowId={(row) => row.id || row.manage_id || row[Object.keys(row)[0]]}
				autoHeight={false}
				sortModel={sortModel}
				onSortModelChange={() => setSortModel([])}
			/>
		</div>
	);
};

export default TopicInfoMstDataGrid;