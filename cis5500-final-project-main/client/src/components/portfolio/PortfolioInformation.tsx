import { ArrowLeft, ArrowRight, FastForward, FastRewind } from "@mui/icons-material";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getPortfolioInformation } from "../../api/portfolio";
import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const percentageFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })


type PortfolioItem = {
    ticker: string,
    quantity: number,
    allocation: number,
    recommended: number,
    original_price: number,
    current_price: number,
    percent_change: number,
}

export const PortfolioInformation = ({ date, presentValue, updateDate }: { date: string, presentValue: number, updateDate: (n: 1 | -1 | 30 | -30) => void }) => {

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

    useEffect(() => {
        const portfolioWrapper = async () => {
            setPortfolio(await getPortfolioInformation(date));
        }

        portfolioWrapper();
    }, [date]);

    return (
        <Box>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Typography variant="h5">Present Value: {currencyFormatter.format(presentValue)}</Typography>
                <Box display="flex" flexDirection="row" alignItems="center">
                    <IconButton onClick={() => updateDate(-30)}>
                        <FastRewind />
                    </IconButton>
                    <IconButton onClick={() => updateDate(-1)}>
                        <ArrowLeft />
                    </IconButton>
                    <Typography variant="body2">{date}</Typography>
                    <IconButton onClick={() => updateDate(1)}>
                        <ArrowRight />
                    </IconButton>
                    <IconButton onClick={() => updateDate(30)}>
                        <FastForward />
                    </IconButton>
                </Box>
            </Box>
            <Table sx={{ minWidth: 800, border: 1 }}>
                <TableHead>
                    <TableCell> </TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Allocation</TableCell>
                    <TableCell>Recommended</TableCell>
                    <TableCell>Original Price</TableCell>
                    <TableCell>Current Price</TableCell>
                    <TableCell>Percent Change</TableCell>
                </TableHead>
                <TableBody>
                    {portfolio.map(item =>
                        <TableRow
                            key={item.ticker}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell><Typography component={Link} to={`/security/${item.ticker}`} sx={{ textDecoration: "none", color: "black" }}>{item.ticker}</Typography></TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{percentageFormatter.format(item.allocation)}</TableCell>
                            <TableCell>{percentageFormatter.format(item.recommended)}</TableCell>
                            <TableCell>{currencyFormatter.format(item.original_price)}</TableCell>
                            <TableCell>{currencyFormatter.format(item.current_price)}</TableCell>
                            <TableCell>{percentageFormatter.format(item.percent_change)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}