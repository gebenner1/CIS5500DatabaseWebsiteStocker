import axios from "axios"
import { rootUrl, setAuthenticationHeader } from "../utils/utils"


type News = {
    date: string,
    headline: string
}

export const getHeadlines = (ticker: string) =>
    axios.get<News[]>(`${rootUrl}/headlines/${ticker}`)
        .then(res => res.data);

export const getNewHeadlines = (ticker: string) =>
    axios.get<News[]>(`${rootUrl}/headlines/new/${ticker}`)
        .then(res => res.data);

export const getTopHeadlines = (ticker: string) =>
    axios.get<News[]>(`${rootUrl}/headlines/close/high/${ticker}`)
        .then(res => res.data);

export const getPortfolioNews = () => {
    setAuthenticationHeader();
    return axios.get<News[]>(`${rootUrl}/portfolio/headlines`)
        .then(res => res.data);
}


