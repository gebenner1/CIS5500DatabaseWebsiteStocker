import axios from "axios";
import { rootUrl, setAuthenticationHeader } from "../utils/utils";

type PortfolioItem = {
    ticker: string,
    quantity: number
}

type HistoryItem = {
    date: string,
    value: number
}

type PortfolioInformationItem = {
    ticker: string,
    quantity: number,
    allocation: number,
    recommended: number,
    original_price: number,
    current_price: number,
    percent_change: number,
}

export const getPortfolio = () => {
    setAuthenticationHeader();
    return axios.get<{ portfolio: PortfolioItem[] }>(`${rootUrl}/portfolio`)
        .then(res => res.data.portfolio)
}

export const updatePortfolio = (portfolio: PortfolioItem[]) => {
    setAuthenticationHeader();
    return axios.put(`${rootUrl}/portfolio`, portfolio);
}

export const getPortfolioHistory = () => {
    setAuthenticationHeader();
    return axios.get<HistoryItem[]>(`${rootUrl}/portfolio/history`)
        .then(res => res.data)
}

export const getPortfolioInformation = (date: string) => {
    setAuthenticationHeader();
    return axios.get<PortfolioInformationItem[]>(`${rootUrl}/portfolio/information?date=${date}`)
        .then(res => res.data)
}

export const getRecommendedStocks = (ticker: string) => {
    setAuthenticationHeader();
    return axios.get<string[]>(`${rootUrl}/recommended_stocks/${ticker}`)
        .then(res => res.data)
}

export const getMaxMovers = (date: string) => {
    setAuthenticationHeader();
    return axios.get<{ ticker: string, percent_change: number }[]>(`${rootUrl}/max_movers/${date}`)
        .then(res => res.data)
}
