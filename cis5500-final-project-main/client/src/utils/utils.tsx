import axios from "axios";

export const rootUrl = "http://localhost:5000"

export const setAuthenticationHeader = () => {
    axios.defaults.headers.common["X-Api-Key"] = sessionStorage.getItem("token");
}