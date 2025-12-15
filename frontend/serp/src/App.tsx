import React from "react"
import { ThemeProvider, CssBaseline } from "@mui/material"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { menuContext } from "./contexts/AppState"
import { MyAppBar } from "./components/MyAppBar"
import { MyDrawer } from "./components/MyDrawer"
import { Main } from "./components/Main"
import { AppProviders } from "./contexts/AppUIContext"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { MsalProvider } from "@azure/msal-react"
import { msalInstance } from "./msalInstance"
// import pages
import SignInPage from "./components/pages/SignInPage"
import UploadPage from "./components/pages/UploadPage"
import MergePage from "./components/pages/MergePage"
import TopicInfoMstPage from "./components/pages/TopicInfoMstPage"
import SystemMenu from "./components/pages/SystemMenu"
import Footer from "./components/parts/Footer"
import "./App.css"
import { theme } from "./theme/theme"

const AppContent: React.FC = () => {
	const { isAuthenticated } = useAuth()
	const [isOpened, setIsOpened] = React.useState(false)

	return (
		<>
			<menuContext.Provider value={{ isOpened, setOpened: setIsOpened }}>
				<Box sx={{ display: "flex" }}>
					<CssBaseline />
					<MyAppBar isAuthenticated={isAuthenticated} />
					{isAuthenticated && <MyDrawer open={isOpened} />}
					<Main open={isAuthenticated && isOpened}>
						<Toolbar />
					</Main>
				</Box>
			</menuContext.Provider>

			<Routes>
				<Route path="/" element={<SignInPage />} />
				<Route
					path="/SystemMenu"
					element={
						<ProtectedRoute>
							<SystemMenu />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/TopicInfoMstPage"
					element={
						<ProtectedRoute>
							<TopicInfoMstPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/UploadPage"
					element={
						<ProtectedRoute>
							<UploadPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/MergePage"
					element={
						<ProtectedRoute>
							<MergePage />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</>
	)
}

const App: React.FC = () => {
	return (
		<MsalProvider instance={msalInstance}>
			<BrowserRouter basename="/serp">
				<AuthProvider>
					<AppProviders>
						<ThemeProvider theme={theme}>
							<CssBaseline />
							<AppContent />
							<Footer />
						</ThemeProvider>
					</AppProviders>
				</AuthProvider>
			</BrowserRouter>
		</MsalProvider>
	)
}

export default App
