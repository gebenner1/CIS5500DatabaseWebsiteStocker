import axios from "axios"
import { rootUrl } from "../utils/utils"

export const login = (username: string, password: string) =>
    axios.post<{ token: string }>(`${rootUrl}/login`, { username: username, password: password })
        .then(res => res.data.token)
