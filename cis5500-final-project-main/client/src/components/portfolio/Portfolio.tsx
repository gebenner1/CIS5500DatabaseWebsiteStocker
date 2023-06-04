import { useEffect, useState } from "react";
import { getPortfolioHistory } from "../../api/portfolio";
import { Grid, Typography, Button, Box } from "@mui/material";
import { PortfolioInformation } from "./PortfolioInformation";
import { PortfolioChart } from "./PortfolioChart";
import { UpdatePortfolio } from "./UpdatePortfolio";
import { PortfolioSidebar } from "./PortfolioSidebar";


type HistoryItem = {
    date: string,
    value: number
}

const Portfolio = () => {

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [date, setDate] = useState(0);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false); window.location.reload(); };

    const updateDate = (n: 1 | -1 | 30 | -30) => {
        setDate(Math.min(Math.max(0, date + n), history.length - 1));
    }

    useEffect(() => {
        const portfolioWrapper = async () => {
            const history = await getPortfolioHistory();
            setHistory(history);
        }

        portfolioWrapper();
    }, [open]);

    return (
        <Grid container alignSelf="center" width="80%" spacing={2}>
            <Grid item xs={8}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box display="flex" flexDirection="row" justifyContent="space-between">
                            <Typography variant="h5">My Portfolio</Typography>
                            <Button variant="contained" onClick={handleOpen}>Update Portfolio</Button>
                            <UpdatePortfolio open={open} onClose={handleClose} />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <PortfolioChart history={history} />
                    </Grid>
                    <Grid item xs={12}>
                        <PortfolioInformation date={history[date]?.date ?? ""} presentValue={history[date]?.value} updateDate={updateDate} />
                    </Grid>
                </Grid >
            </Grid>
            <Grid item xs={4}>
                <PortfolioSidebar date={history[date]?.date ?? ""} />
            </Grid>
        </Grid>
    );
}

export default Portfolio;


