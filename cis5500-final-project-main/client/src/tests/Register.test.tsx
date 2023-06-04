import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { Register } from '../components/account/Register';

describe("register component", () => {

    const mockAxios = new MockAdapter(axios);

    mockAxios.onPost().reply(config => {
        const data = JSON.parse(config.data);
        return data.username === 'inuse' ? [404, 'Username taken'] : [201, 'Created']
    });

    it("renders \"Username\", \"Password\" and \"Re-Enter Password\"", () => {
        render(
            <BrowserRouter>
                <Register auth={false} />
            </BrowserRouter>
        );
        expect(screen.getByLabelText(/^Username$/));
        expect(screen.getByLabelText(/^Password$/));
        expect(screen.getByLabelText(/^Re-Enter Password$/));
    });

    it("renders \"Username and Password are Required\" if no username is supplied", async () => {
        render(
            <BrowserRouter>
                <Register auth={false} />
            </BrowserRouter>
        );
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/Username and Password are Required/)));
    })

    it("renders \"Passwords don't match\" if passwords don't match", async () => {
        render(
            <BrowserRouter>
                <Register auth={false} />
            </BrowserRouter>
        );
        await userEvent.type(screen.getByLabelText("Username"), "rparks");
        await userEvent.type(screen.getByLabelText("Password"), "password");
        await userEvent.type(screen.getByLabelText("Re-Enter Password"), "wrong");
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/Passwords don't match/)));
    })

    it("renders login if registration is successful", async () => {
        render(
            <BrowserRouter>
                <Register auth={false} />
                <Routes>
                    <Route path="/login" element={<p>login</p>} />
                </Routes>
            </BrowserRouter>
        );
        await userEvent.type(screen.getByLabelText("Username"), "rparks");
        await userEvent.type(screen.getByLabelText("Password"), "password");
        await userEvent.type(screen.getByLabelText("Re-Enter Password"), "password");
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/login/)));
    })

    it("renders \"Passwords don't match\" if passwords don't match", async () => {
        render(
            <BrowserRouter>
                <Register auth={false} />
            </BrowserRouter>
        );
        await userEvent.type(screen.getByLabelText("Username"), "inuse");
        await userEvent.type(screen.getByLabelText("Password"), "password");
        await userEvent.type(screen.getByLabelText("Re-Enter Password"), "password");
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/Username taken/)));
    })

});
