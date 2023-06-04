import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompany, getHistory } from "../../api/company";
import { CompanyInformation } from "./CompanyInformation";
import { HistoricalChart } from "./HistoricalChart";
import { getHeadlines, getNewHeadlines, getTopHeadlines } from "../../api/news";
import { SecuritySidebar } from "./SecuritySidebar";

export type Company = {
    ticker: string,
    security: string,
    headquarters: string,
    industry: string,
    date_added: string,
    avg_volume: number,
    competitors: string[],
}

type History = {
    date: string,
    adj_close: number
}[]

export type News = {
    date: string,
    headline: string
}

export const Security = () => {
    const ticker = useParams().ticker ?? "";

    const [company, setCompany] = useState<Company>();
    const [history, setHistory] = useState<History>([]);
    const [competitors, setCompetitors] = useState<(Company | string)[]>();
    const [news1, setNews1] = useState<News[]>();
    const [news2, setNews2] = useState<News[]>();
    const [news3, setNews3] = useState<News[]>();


    useEffect(() => {
        const populateCompany = async () => {
            const company = await getCompany(ticker);
            setCompany(company);
            setHistory(await getHistory(ticker));
            setCompetitors(await Promise.all(company.competitors.map(async competitor => (await getCompany(competitor)) ?? competitor)))
        };

        const populateNews = async () => {
            setNews1(await getHeadlines(ticker));
            setNews2(await getTopHeadlines(ticker));
            setNews3(await getNewHeadlines(ticker));
        }

        populateCompany();
        populateNews();
    }, [ticker])


    return (
        <Grid container alignSelf="center" width="60%">
            <Grid item xs={8}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="h5">{company?.security}</Typography>
                        <Typography variant="body2">{company?.ticker}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <HistoricalChart history={history} />
                    </Grid>
                    <Grid item xs={12} alignItems="flex-start" flexDirection="row">
                        <Typography variant="h6" marginTop={2} marginBottom={1}>Company Information</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <CompanyInformation
                            headquarters={company?.headquarters ?? ""}
                            industry={company?.industry ?? ""}
                            avg_volume={company?.avg_volume ?? 0}
                        />
                    </Grid>
                </Grid >
            </Grid>
            <Grid item xs={4}>
                {SecuritySidebar(competitors, news1, news2, news3)}
            </Grid>
        </Grid>
    );
}


