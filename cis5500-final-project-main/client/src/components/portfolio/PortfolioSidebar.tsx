import { Grid, Typography, List, ListItem } from "@mui/material";
import { useEffect, useState } from "react";
import { getMaxMovers, getPortfolio, getRecommendedStocks } from "../../api/portfolio";
import { Link } from "react-router-dom";
import { getPortfolioNews } from "../../api/news";

const percentageFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PortfolioSidebar({ date }: { date: string }) {

    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [movers, setMovers] = useState<{ ticker: string, percent_change: number }[]>([]);
    const [news, setNews] = useState<{ date: string, headline: string }[]>([]);

    useEffect(() => {
        const recommendedWrapper = async () => {
            const portfolio = await getPortfolio();
            let y = await Promise.all(portfolio.map(item => getRecommendedStocks(item.ticker)));
            let z = y.flatMap(x => x[0]);
            z = z.filter((v, i, arr) => arr.indexOf(v) === i);
            z.sort();
            console.log(z);
            setRecommendations(z);
        }

        const newsWrapper = () =>
            getPortfolioNews().then(res => setNews(res));

        recommendedWrapper();
        newsWrapper();

    }, []);

    useEffect(() => {
        const moversWrapper = () => getMaxMovers(date).then(res => setMovers(res));
        moversWrapper();
    }, [date]);


    return <Grid container>
        <Grid item xs={12}>
            <Typography variant="h6">Recommended Stocks</Typography>
            <List sx={{ border: 1 }}>
                {recommendations?.map(ticker =>
                    <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography component={Link} to={`/security/${ticker}`} sx={{ textDecoration: "none", color: "inherit" }}>{ticker}</Typography>
                    </ListItem>
                )}
            </List>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h6">Top Movers</Typography>
            <List sx={{ border: 1 }} >
                {movers?.map(mover =>
                    <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography component={Link} to={`/security/${mover.ticker}`} sx={{ textDecoration: "none", color: "inherit" }}>{mover.ticker}</Typography>
                        <Typography textAlign="right">+{percentageFormatter.format(mover.percent_change)}</Typography>
                    </ListItem>)}
            </List>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h6">Recent Headlines</Typography>
            <List sx={{ border: 1 }}>
                {news?.map(item => <ListItem>
                    <Typography>
                        {item.headline}
                        <Typography variant="body2" textAlign="right">{item.date}</Typography>
                    </Typography>
                </ListItem>)}
            </List>
        </Grid>
    </Grid>;
}
