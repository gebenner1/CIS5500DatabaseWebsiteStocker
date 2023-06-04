import axios from "axios";
import { rootUrl } from "../utils/utils";

export const addUser = (username: string, password: string) =>
    axios.post(`${rootUrl}/register`, { username: username, password: password });

export const resetPassword = (username: string, password: string) =>
    axios.put(`${rootUrl}/password-reset`, { username: username, password: password });