import { useState, useEffect } from "react"
import { useCallback } from "react"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"
import Paper from "@mui/material/Paper"
import Toolbar from "@mui/material/Toolbar"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { useDropzone } from "react-dropzone"
import Stack from "@mui/material/Stack"
import Divider from "@mui/material/Divider"
import SearchIcon from "@mui/icons-material/Search"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import dayjs, { Dayjs } from "dayjs"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import apiClient from "../../api/api" // API関数をインポート

// Parts(子Component)のImport
import UploadDataGrid from "../parts/UploadDataGrid"
import { SnackbarSeverity, useSnackbar, useSystem } from "../../contexts/AppUIContext"
import { useAuth } from "../../contexts/AuthContext"

// (ファイル情報)APIから取得するデータの型
interface FileListItem {
	manage_id: string
	fiscal_date: string
	version: string
	file_div: string
	file_nm: string
}

// APIから取得するデータの型定義
interface ApiResponse {
	status: number
	result: FileListItem[]
	error: string
}

// 各データのフィールドが異なるため、動的な型にする
interface GridDataItem {
	[key: string]: any
}

const UploadPage: React.FC = () => {
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs().subtract(1, "month")) // DatePickerの選択状態
	const [dataItem, setDataItem] = useState<FileListItem[]>([]) // 検索時APIから受け取るデータ
	const [loading, setLoading] = useState(false) // API呼び出し中かどうかのフラグ
	const [gridData, setGridData] = useState<GridDataItem[]>([]) // GridDataItem に表示するデータ
	const [columns, setColumns] = useState<any[]>([]) // DataGrid の列
	const { showSnackbar } = useSnackbar()
	const { setTitle } = useSystem()
	const { user } = useAuth()

	// 検索ボタン押下時に呼び出す処理
	const handleSearchClick = () => {
		fetchData()
	}

	// 選択された日付を 'YYYYMM' フォーマットに変換
	const getFormattedDate = (): string => {
		return selectedDate
			? selectedDate.format("YYYYMM")
			: dayjs().subtract(1, "month").format("YYYYMM")
	}

	// API呼び出し関数(検索)
	const fetchData = async () => {
		setLoading(true)
		const formattedDate = getFormattedDate()
		try {
			const response = await apiClient.get<ApiResponse>(`/filelist/${formattedDate}`)
			if (response.data.status == 0) {
				showSnackbar("データを取得しました。", SnackbarSeverity.SUCCESS)
				setDataItem(response.data.result)
			} else if (response.data.status == 1) {
				showSnackbar("一致するデータがありません。", SnackbarSeverity.WARNING)
				setDataItem([]) // 削除成功後にデータグリッドをクリアする
				setGridData([]) // DataGrid を初期化
				setColumns([])
			} else if (response.data.status == -1) {
				console.error("データ取得失敗：", response.data.error)
				showSnackbar("データの取得に失敗しました。", SnackbarSeverity.ERROR)
			} else {
				throw new Error(`不正なステータス [status=${response.data.status}]`)
			}
		} catch (error) {
			console.error("例外発生：", error)
			showSnackbar("データの取得に失敗しました。", SnackbarSeverity.ERROR)
		} finally {
			setLoading(false)
		}
	}

	// 初回ロード時にデータを取得
	useEffect(() => {
		setTitle("アップロード")
		fetchData()
	}, [])

	// 行が選択されたときに呼ばれる関数
	const handleRowSelect = async (selectedData: FileListItem) => {
		const item = selectedData as FileListItem // 型アサーション

		// DataGrid を初期化
		setGridData([])
		setColumns([])

		// APIを呼び出し
		try {
			const response = await apiClient.get(`/filedetail/${item.manage_id}`)

			if (response.data.status == 0) {
				const gridData = response.data.result // 取得したデータを保存
				if (gridData.length > 0) {
					// 取得したデータのキーに応じて列を動的に生成
					const firstItem = gridData[0]
					const generatedColumns = Object.keys(firstItem).map((key) => ({
						field: key,
						headerName: key.replace(/_/g, " ").toUpperCase(), // カラム名を加工
						width: 180,
					}))

					setColumns(generatedColumns) // 列定義を更新
					setGridData(gridData) // DataGridに表示するためのデータを更新
				}
				showSnackbar("データを取得しました。", SnackbarSeverity.SUCCESS)
			} else if (response.data.status == 1) {
				showSnackbar("データが存在しません。", SnackbarSeverity.WARNING)
			} else if (response.data.status == -1) {
				console.error("データ取得失敗：", response.data.error)
				showSnackbar("データの取得に失敗しました。", SnackbarSeverity.ERROR)
			}
		} catch (error) {
			console.error("例外発生：", error)
			showSnackbar("データの取得に失敗しました。", SnackbarSeverity.ERROR)
		}
	}

	// 対象行のデータを削除
	const handleDelete = async (manage_id: string) => {
		setLoading(true)
		try {
			const response = await apiClient.delete<ApiResponse>(`/filedelete/${manage_id}`)

			if (response.data.status == 0) {
				showSnackbar("データを削除しました。", SnackbarSeverity.SUCCESS)
				setDataItem([]) // 削除成功後にデータグリッドをクリアする
				setGridData([]) // DataGrid を初期化
				setColumns([])
				fetchData() // ここでデータを再取得してリフレッシュ
			} else if (response.data.status == 1) {
				throw new Error(`不正なステータス [status=${response.data.status}]`)
			} else if (response.data.status == -1) {
				console.error("データ取得失敗：", response.data.error)
				showSnackbar("データの削除に失敗しました。", SnackbarSeverity.WARNING)
			} else {
				throw new Error(`不正なステータス [status=${response.data.status}]`)
			}
		} catch (error) {
			console.error("例外発生：", error)
			showSnackbar("データの削除に失敗しました。", SnackbarSeverity.ERROR)
		} finally {
			setLoading(false)
		}
	}

	// API呼び出し関数（ファイルアップロード）
	const uploadFile = async (file: File, fiscalDate: string, fileNm: string, fileDiv: string) => {
		const formData = new FormData()
		formData.append("uploadFile", file)
		formData.append("fiscal_date", fiscalDate)
		formData.append("file_nm", fileNm)
		formData.append("file_div", fileDiv)
		formData.append("modified_user", user!.azure_ad_id)

		try {
			const response = await apiClient.post("/fileupload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})

			// レスポンスをチェックして必要に応じてエラーメッセージや成功メッセージを表示
			if (response.data.status == 0) {
				showSnackbar("アップロードに成功しました。", SnackbarSeverity.SUCCESS)
				fetchData()
			} else if (response.data.status == 1) {
				throw new Error(`不正なステータス [status=${response.data.status}]`)
			} else if (response.data.status == -1) {
				console.log("アップロード失敗：", response.data.error)
				showSnackbar("アップロードに失敗しました。", SnackbarSeverity.WARNING)
			} else {
				throw new Error(`不正なステータス [status=${response.data.status}]`)
			}
		} catch (error) {
			console.log("例外発生：", error)
			showSnackbar("アップロードError", SnackbarSeverity.ERROR)
		}
	}

	// ファイルから勘定年月・ファイル名・ファイル区分を決定
	const parseFileName = (fileName: string) => {
		// fiscalDateを抽出 (YYYYMMフォーマット) - 和暦対応
		let fiscalDate = ""

		// 西暦が含まれている場合
		const dateMatch = fileName.match(/\d{4}(年)(\d{1,2})月/)
		if (dateMatch) {
			const year = dateMatch[0].substring(0, 4) // 2024年の場合、2024を取得
			const month = dateMatch[2].padStart(2, "0") // 9月 -> 09 に変換
			fiscalDate = `${year}${month}`
		} else {
			// 他の形式で6桁の年月がある場合に対応
			const defaultMatch = fileName.match(/\d{6}/)
			if (defaultMatch) {
				fiscalDate = defaultMatch[0] // 202409など
			}
		}

		// fileNmは拡張子を除いた部分を使用
		const fileNm = fileName.replace(/\.[^/.]+$/, "") // 拡張子を削除

		// fileDivの判定
		let fileDiv = ""
		if (fileNm.includes("仕掛PJ台帳")) {
			fileDiv = "W"
		} else if (fileNm.includes("完成PJ台帳")) {
			fileDiv = "F"
		}

		return { fiscalDate, fileNm, fileDiv }
	}

	// Dropzoneのコールバック
	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		for (const file of acceptedFiles) {
			const { fiscalDate, fileNm, fileDiv } = parseFileName(file.name)
			await uploadFile(file, fiscalDate, fileNm, fileDiv)
		}
	}, [])

	// Dropzoneの設定
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: 3,
	})

	return (
		<Box>
			<Grid container spacing={1}>
				{/* ActionArea */}
				<Grid item lg={12}>
					<Paper
						variant="outlined"
						square
						{...getRootProps()}
						style={{
							border: "2px dashed #000",
							height: "100%",
							display: "flex",
							alignItems: "stretch",
							padding: 20,
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
						<Alert severity="info">ファイルをここにドロップしてください</Alert>
					)}
				</Grid>
				{/* HistoryArea */}
				<Grid item lg={3} alignItems="stretch">
					<Paper
						sx={{
							p: 2,
							width: "100%",
							height: "73vh",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Toolbar>
							<Stack
								direction="row"
								justifyContent="flex-start"
								alignItems="center"
								spacing={0.5}
							>
								{/* 検索条件.年月 */}
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DatePicker
										label="Account Months"
										format="YYYYMM"
										defaultValue={dayjs().subtract(1, "month")} // 1ヶ月前の日付を設定
										views={["year", "month"]} // 年月のみ選択可能にする
										value={selectedDate}
										onChange={(newDate) => {
											if (newDate) {
												setSelectedDate(newDate)
											}
										}}
									/>
								</LocalizationProvider>
								{/* 検索ボタン */}
								<Button
									variant="outlined"
									startIcon={<SearchIcon />}
									onClick={handleSearchClick}
								>
									Search
								</Button>
							</Stack>
						</Toolbar>
						<Divider />
						<Toolbar
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "flex-Start",
								px: [1],
								padding: 0,
							}}
						>
							{loading ? (
								<p>Loading...</p>
							) : (
								<Box
									sx={{
										width: "100%",
										height: "100%",
										bgcolor: "background.paper",
									}}
								>
									{/* Dataが取得できた場合、Listを作成 */}
									{dataItem.length > 0 ? (
										(dataItem as FileListItem[]).map((item, index) => (
											<ListItem
												key={index}
												onClick={() => handleRowSelect(item)}
											>
												<ListItemButton>
													<ListItemText
														primary={(item as FileListItem).file_nm}
													/>
													<IconButton
														edge="end"
														onClick={() =>
															handleDelete(
																(item as FileListItem).manage_id,
															)
														}
													>
														<DeleteIcon />
													</IconButton>
												</ListItemButton>
											</ListItem>
										))
									) : (
										<p>No data available</p>
									)}
								</Box>
							)}
						</Toolbar>
					</Paper>
				</Grid>
				{/* DataArea */}
				<Grid item lg={9} alignItems="stretch">
					<Paper
						sx={{
							p: 2,
							height: "73vh",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box sx={{ height: "100%", width: "100%" }}>
							{/* UpdateDataGridに選択されたデータを渡して表示 */}
							{gridData.length > 0 && (
								<UploadDataGrid gridData={gridData} columns={columns} />
							)}
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	)
}

export default UploadPage
