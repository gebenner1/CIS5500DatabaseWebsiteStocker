import axios from "axios";
import { rootUrl } from "../utils/utils";

type Company = {
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

export const getCompany = (ticker: string) =>
    axios.get<Company>(`${rootUrl}/security/${ticker}`)
        .then(res => res.data)

export const getHistory = (ticker: string) =>
    axios.get<History>(`${rootUrl}/history/${ticker}`)
        .then(res => res.data)

export const listCompanies = () =>
    axios.get<string[]>(`${rootUrl}/companies`)
        .then(res => res.data)
