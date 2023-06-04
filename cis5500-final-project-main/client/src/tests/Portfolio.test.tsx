import { render, screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { rootUrl } from "../utils/utils";
import Portfolio from "../components/portfolio/Portfolio";
import userEvent from "@testing-library/user-event";

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
    mockAxios.onGet(`${rootUrl}/portfolio`).reply(200, [{ ticker: "AMZN", quantity: 10 }]);
    mockAxios.onGet(`${rootUrl}/companies`).reply(200, ["AMZN"])
    const history = [{ date: "2010-01-01", value: 1 }, { date: "2010-01-02", value: 2 }];
    mockAxios.onGet(`${rootUrl}/portfolio/history`).reply(200, history);
    const information = [{ ticker: "AMZN", quantity: 10, allocation: 1, recommended: 1, original_price: 1, current_price: 1, percent_change: 0 }]
    mockAxios.onGet(`${rootUrl}/portfolio/information?date=`).reply(200, information);
    mockAxios.onGet(`${rootUrl}/portfolio/information?date=2010-01-01`).reply(200, information);


    it("renders \"My Portfolio\"", () => {
        render(
            <Portfolio />
        );
        expect(screen.getByText("My Portfolio"));
    });

    it("renders \"AMZN\"", () => {
        render(
            <Portfolio />
        );
        waitFor(() => expect(screen.getByText("AMZN")));
    });

    it("renders \"10\"", () => {
        render(
            <Portfolio />
        );
        waitFor(() => expect(screen.getByText("10")));
    });

    it("renders \"Add new Ticker\"", async () => {
        render(
            <Portfolio />
        );
        await userEvent.click(screen.getByText("Update Portfolio"));
        waitFor(() => expect(screen.getByLabelText("Add new Ticker")));
    });



});