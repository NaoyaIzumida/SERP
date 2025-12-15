import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
	palette: {
		mode: "light", // ← 全体は白ベースに
		primary: {
			main: "#000000", // ボタンなどに使う黒
			contrastText: "#ffffff", // ボタン文字を白に
		},
		background: {
			default: "#ffffff", // ページ背景を白に
			paper: "#ffffff",
		},
		text: {
			primary: "#000000",
			secondary: "#555555",
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: "#212121", // ← AppBarだけ黒
					color: "#ffffff", // ← タイトル・アイコンを白に
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 6,
				},
				containedPrimary: {
					backgroundColor: "#000000",
					color: "#ffffff",
					"&:hover": {
						backgroundColor: "#333333",
					},
				},
				outlinedPrimary: {
					borderColor: "#000000",
					color: "#000000",
					"&:hover": {
						backgroundColor: "#f5f5f5",
					},
				},
			},
		},
	},
})
