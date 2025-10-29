import React, { useEffect, useState } from "react";
import { Alert, Collapse, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const ReleaseNoteAlert: React.FC = () => {
  const [show, setShow] = useState(false);
  const [note, setNote] = useState<{
    version: string;
    date: string;
    changes: string[];
  }>({ version: "", date: "", changes: [] });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetch("../../public/README.md")
        .then((res) => res.text())
        .then((text) => {
          // --- README.mdを行ごとに処理 ---
          const lines = text.split("\n").map((l) => l.trim());
          const sections: { version: string; date: string; changes: string[] }[] = [];

          let current: { version: string; date: string; changes: string[] } | null = null;

          for (const line of lines) {
            const versionMatch = line.match(/^##\s+([\d.]+)\s+\(([\d-]+)\)/);
            if (versionMatch) {
              // 新しいセクションを開始
              if (current) sections.push(current);
              current = {
                version: versionMatch[1],
                date: versionMatch[2],
                changes: [],
              };
            } else if (current && line.startsWith("- ")) {
              current.changes.push(line.replace(/^-\s*/, ""));
            }
          }

          if (current) sections.push(current); // 最後のセクションも追加

          if (sections.length > 0) {
            const latest = sections[sections.length - 1]; // 最新版は最後
            const seenVersion = localStorage.getItem(`seenReleaseNoteVersion_${user!.azure_ad_id}`);
            if (seenVersion !== latest.version) {
              setNote(latest);
              setShow(true);
            }
          }
        })
        .catch((err) => console.error("README取得エラー:", err));
    } else {
      setShow(false);
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(`seenReleaseNoteVersion_${user!.azure_ad_id}`, note.version);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={show}>
        <Alert
          severity="info"
          onClose={() => { handleClose() }}
          sx={{ borderRadius: 0 }}
        >
          v{note.version}（{note.date}）
          {note.changes.map((change, i) => (
            <li key={i}>{change}</li>
          ))}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default ReleaseNoteAlert;