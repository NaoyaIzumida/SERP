import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// APIから取得するデータの型（汎用的に定義）
interface DataItem {
  [key: string]: any; // フィールドが動的になるため、任意のキーと値を受け取れるようにする
}

// UploadDataGridのプロパティ型
interface UploadDataGridProps {
  gridData: DataItem[]; // 親から渡されるデータ
}

// DataGridコンポーネントの定義
const UploadDataGrid: React.FC<UploadDataGridProps> = ({ gridData }) => {
  // データに応じて列定義を動的に生成
  const generateColumns = (data: DataItem[]): GridColDef[] => {
    // データが空の場合は列を生成しない
    if (data.length === 0) return [];

    // データの最初のアイテムのキーを列のヘッダー名として利用する
    const columns: GridColDef[] = Object.keys(data[0]).map((key) => ({
      field: key,      // フィールド名
      headerName: key, // ヘッダー名としてフィールド名をそのまま使用
      width: 150,      // 列幅は固定、もしくは調整可能
    }));

    return columns;
  };
  
  const columns = generateColumns(gridData);
  
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={gridData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5]}
        getRowId={(row) => row.id || row.manage_id || row[Object.keys(row)[0]]}  // 任意の一意なキーを指定
      />
    </div>
  );
};
  
export default UploadDataGrid;