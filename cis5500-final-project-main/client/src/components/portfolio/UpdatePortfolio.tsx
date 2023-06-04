import { Autocomplete, IconButton, Modal, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getPortfolio, updatePortfolio } from "../../api/portfolio";
import { Delete } from "@mui/icons-material";
import { listCompanies } from "../../api/company";

type PortfolioItem = {
    ticker: string,
    quantity: number
}

export const UpdatePortfolio = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const companies = useRef<string[]>([]);

    useEffect(() => {
        const portfolioWrapper = () =>
            getPortfolio().then(res => setPortfolio(res));

        const companiesWrapper = () =>
            listCompanies().then(res => companies.current = res);

        portfolioWrapper();
        companiesWrapper();
    }, []);

    const handleChange = (ticker: string, value: number) => {
        const newPortfolio = portfolio.map(item =>
            item.ticker === ticker ? { ticker: ticker, quantity: value } : item
        );
        setPortfolio(newPortfolio)
        updatePortfolio(newPortfolio);
    }

    const addTicker = (ticker: string | null) => {
        if (ticker === null || portfolio.reduce((x, item) => x || item.ticker === ticker, false)) {
            return
        }
        const newPortfolio = portfolio.concat([{ ticker: ticker, quantity: 0 }]);
        setPortfolio(newPortfolio);
        updatePortfolio(newPortfolio);
    }

    const removeTicker = (ticker: string) => {
        const newPortfolio = portfolio.filter(item => item.ticker !== ticker);
        setPortfolio(newPortfolio);
        updatePortfolio(newPortfolio);
    }

    return (
        <Modal open={open}
            onClose={onClose}
            sx={{
                position: "fixed",
                zIndex: 1300,
                right: 0,
                bottom: 0,
                top: 0,
                left: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
            <Paper sx={{ padding: 2 }}>
                <Typography variant="h6" textAlign="center">Update Portfolio</Typography>
                <Table sx={{ minWidth: 200 }}>
                    <TableHead >
                        <TableCell> </TableCell>
                        <TableCell>Quantity</TableCell>
                    </TableHead>
                    <TableBody>
                        {portfolio.map(item =>
                            <TableRow
                                key={item.ticker}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>{item.ticker}</TableCell>
                                <TableCell>
                                    <TextField defaultValue={item.quantity} type="number" onChange={e => handleChange(item.ticker, parseInt(e.currentTarget.value))} />
                                    <IconButton onClick={() => removeTicker(item.ticker)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>)}
                    </TableBody>
                </Table>
                <Autocomplete renderInput={(params) => <TextField {...params} label="Add new Ticker" fullWidth />} options={companies.current} sx={{ alignSelf: "center" }} onChange={(e, v) => addTicker(v)} />
            </Paper>
        </Modal >
    );
}
