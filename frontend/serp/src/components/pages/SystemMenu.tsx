import { Box, Button, Grid } from "@mui/material";
import { useSystem, eSystemType } from "../../contexts/AppUIContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const buttons = [
  { label: "月締め処理", system: eSystemType.GETSUJI },
];

const DashbordPage = () => {
  const navigate = useNavigate();
  const { setTitle, setSystem } = useSystem();

  useEffect(() => {
    setTitle("システムメニュー");
    setSystem(eSystemType.NONE)
    localStorage.setItem("systemType", eSystemType.NONE);
  }, []);

  const handleClick = (system: eSystemType) => {
    if (system === eSystemType.GETSUJI) {
      localStorage.setItem("systemType", eSystemType.GETSUJI);
      setSystem(eSystemType.GETSUJI)
      navigate("/UploadPage");
    }
  };

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid container spacing={2} sx={{ maxWidth: 800, height: 300 }}>
        {buttons.map(({ label, system }, index) => (
          <Grid item xs key={index} sx={{ height: "100%" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                height: "100%",
                textTransform: "none",
                fontSize: "1.5rem",
              }}
              onClick={() => handleClick(system as eSystemType)}
            >
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashbordPage