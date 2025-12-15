import React from "react"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

// MergeDataGridのプロパティ型
interface MergeDataGridProps {
	gridData: any[] // 動的なデータを受け取る
	columns: GridColDef[] // 動的な列定義を受け取る
}

// DataGridコンポーネントの定義
const MergeDataGrid: React.FC<MergeDataGridProps> = ({ gridData, columns }) => {
	// 数値をカンマ区切りにフォーマットする関数
	const formatNumberWithCommas = (value: number) => {
		return value.toLocaleString("en-US") // カンマ区切り形式で数値をフォーマット
	}

	// 各列に対して flex を割り当てる
	const columnsWithAutoWidth: GridColDef[] = columns.map((col) => ({
		...col,
		flex: 1, // 全ての列が自動的に同じ割合で幅を調整する
		align: typeof gridData[0]?.[col.field] === "number" ? "right" : "left", // 数値列の場合は右詰め
		valueFormatter: (params: any) => {
			const value = params.value
			return typeof value === "number" ? formatNumberWithCommas(value) : value // 数値ならカンマ区切り
		},
	}))

	// ユニークなIDを生成する場合、例えばデータに連番を付与する
	const rowsWithUniqueId = gridData.map((row, index) => ({
		id: index, // データがユニークでない場合にインデックスを使ってユニークIDを生成
		...row,
	}))

	return (
		<div style={{ height: 640, width: "100%" }}>
			<DataGrid
				rows={rowsWithUniqueId}
				columns={columnsWithAutoWidth}
				initialState={{
					pagination: {
						paginationModel: { pageSize: 10 },
					},
				}}
				pagination // 追加: Paginationを有効化
				getRowId={(row) => row.id || row.manage_id || row[Object.keys(row)[0]]} // 任意の一意なキーを指定
				autoHeight={false} // DataGridの高さをPaperに依存させる
			/>
		</div>
	)
}

export default MergeDataGrid
