import React, { useEffect, useState } from "react"
import { Alert, Collapse, Box, Typography, Button } from "@mui/material"
import { useAuth } from "../contexts/AuthContext"

interface ReleaseNote {
	version: string
	date: string
	changes: string[]
}

const ReleaseNoteAlert: React.FC = () => {
	const [show, setShow] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [latestNote, setLatestNote] = useState<ReleaseNote>({
		version: "",
		date: "",
		changes: [],
	})
	const [allNotes, setAllNotes] = useState<ReleaseNote[]>([])

	const { user, isAuthenticated } = useAuth()

	useEffect(() => {
		if (!isAuthenticated || !user) {
			setShow(false)
			return
		}

		fetch("/serp/README.md")
			.then((res) => res.text())
			.then((text) => {
				const lines = text.split("\n").map((l) => l.trim())
				const sections: ReleaseNote[] = []
				let current: ReleaseNote | null = null

				for (const line of lines) {
					const versionMatch = line.match(/^##\s+([\d.]+)\s+\(([\d-]+)\)/)
					if (versionMatch) {
						if (current) sections.push(current)
						current = {
							version: versionMatch[1],
							date: versionMatch[2],
							changes: [],
						}
					} else if (current && line.startsWith("- ")) {
						current.changes.push(line.replace(/^-\s*/, ""))
					}
				}

				if (current) sections.push(current)

				if (sections.length > 0) {
					const latest = sections[sections.length - 1] // 最新版
					setLatestNote(latest)
					// 最新含めて「直近6件（過去5件＋最新版）」だけ保持
					const recentNotes = sections.slice(-6)
					setAllNotes(recentNotes)

					const storageKey = `seenReleaseNoteVersion_${user.azure_ad_id}`
					const seenVersion = localStorage.getItem(storageKey)
					if (seenVersion !== latest.version) {
						setShow(true)
					}
				}
			})
			.catch((err) => console.error("README取得エラー:", err))
	}, [isAuthenticated, user])

	const handleClose = () => {
		if (!user) return
		setShow(false)
		localStorage.setItem(`seenReleaseNoteVersion_${user.azure_ad_id}`, latestNote.version)
	}

	return (
		<Box sx={{ width: "100%" }}>
			<Collapse in={show}>
				<Alert severity="info" onClose={handleClose} sx={{ borderRadius: 0 }}>
					{/* 最新版 */}
					<Typography variant="subtitle1" fontWeight="bold">
						v{latestNote.version} ({latestNote.date})
					</Typography>
					<ul style={{ margin: "4px 0 0 1.2em", paddingLeft: 16 }}>
						{latestNote.changes.map((c, i) => (
							<li key={i}>{c}</li>
						))}
					</ul>

					{/* 過去バージョン折りたたみ */}
					{allNotes.length > 1 && (
						<>
							<Button
								size="small"
								onClick={() => setShowHistory(!showHistory)}
								sx={{ mt: 1 }}
							>
								{showHistory ? "過去バージョンを閉じる" : "過去バージョンを表示"}
							</Button>
							<Collapse in={showHistory}>
								{/* 最新を除く過去5件だけを表示 */}
								{allNotes
									.slice(0, -1)
									.slice(-5)
									.reverse()
									.map((note) => (
										<Box
											key={note.version}
											sx={{ mt: 1, borderTop: "1px solid #ccc", pt: 1 }}
										>
											<Typography variant="subtitle2">
												{note.version} ({note.date})
											</Typography>
											<ul
												style={{ margin: "2px 0 0 1.2em", paddingLeft: 16 }}
											>
												{note.changes.map((c, i) => (
													<li key={i}>{c}</li>
												))}
											</ul>
										</Box>
									))}
							</Collapse>
						</>
					)}
				</Alert>
			</Collapse>
		</Box>
	)
}

export default ReleaseNoteAlert
