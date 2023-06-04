import { render, screen, waitFor } from "@testing-library/react";
import { Security } from "../components/security/Security";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { rootUrl } from "../utils/utils";

describe("Security Component", () => {

    beforeEach(() => {
        //@ts-ignore
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn(),
        }));
    });

    afterEach(() => {
        window.ResizeObserver = ResizeObserver;
        jest.restoreAllMocks();
    });

    const mockAxios = new MockAdapter(axios);
    const security = {
        ticker: "AMZN", security: "Amazon", headquarters: "", industry: "", date_added: "", avg_volume: 101, competitors: [],
    }
    mockAxios.onGet(`${rootUrl}/security/AMZN`).reply(200, security);
    const history = [{ date: "2010-01-01", adj_close: 1 }, { date: "2010-01-01", adj_close: 2 }]
    mockAxios.onGet(`${rootUrl}/history/AMZN`).reply(200, history);
    const news = [{ date: "2010-01-01", headline: "Hello, World!" }]
    mockAxios.onGet(`${rootUrl}/headlines/AMZN`).reply(200, news);


    it("renders \"AMZN\"", () => {
        render(
            <MemoryRouter initialEntries={["/security/AMZN"]}>
                <Routes>
                    <Route path="security/:ticker" element={<Security />} />
                </Routes>
            </MemoryRouter>
        );
        waitFor(() => expect(screen.getAllByText("AMZN")));
    });


    it("Renders \"Hello, World!\"", () => {
        render(
            <MemoryRouter initialEntries={["/security/AMZN"]}>
                <Routes>
                    <Route path="security/:ticker" element={<Security />} />
                </Routes>
            </MemoryRouter>
        );
        waitFor(() => expect(screen.getByText("Hello, World!")));
    });

    it("Renders \"101\"", () => {
        render(
            <MemoryRouter initialEntries={["/security/AMZN"]}>
                <Routes>
                    <Route path="security/:ticker" element={<Security />} />
                </Routes>
            </MemoryRouter>
        );
        waitFor(() => expect(screen.getByText(101)));
    });

});