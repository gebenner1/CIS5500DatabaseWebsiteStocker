import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { PasswordReset } from '../components/account/PasswordReset';

describe("password reset component", () => {

    const mockAxios = new MockAdapter(axios);

    mockAxios.onPost().reply(config => {
        const data = JSON.parse(config.data);
        return data.password === 'old' ? [404, ''] : [201, 'Created']
    });

    it("renders \"Username\" and \"Password\"", () => {
        render(
            <BrowserRouter>
                <PasswordReset auth={false} />
            </BrowserRouter>
        );
        expect(screen.getByLabelText(/^Username$/));
        expect(screen.getByLabelText(/^New Password$/));
    });

    it("renders \"Username and Password are Required\" if no username is supplied", async () => {
        render(
            <BrowserRouter>
                <PasswordReset auth={false} />
            </BrowserRouter>
        );
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/Username and Password are Required/)));
    })


    it("renders login if reset is successful", async () => {
        render(
            <BrowserRouter>
                <PasswordReset auth={false} />
                <Routes>
                    <Route path="/login" element={<p>login</p>} />
                </Routes>
            </BrowserRouter>
        );
        await userEvent.type(screen.getByLabelText("Username"), "rparks");
        await userEvent.type(screen.getByLabelText("New Password"), "password");
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/login/)));
    })

    it("renders \"New Password cannot be Old Password\" if new password is old password", async () => {
        render(
            <BrowserRouter>
                <PasswordReset auth={false} />
            </BrowserRouter>
        );
        await userEvent.type(screen.getByLabelText("Username"), "rparks");
        await userEvent.type(screen.getByLabelText("New Password"), "old");
        await userEvent.click(screen.getByRole("button"));
        waitFor(() => expect(screen.getByLabelText(/New Password cannot be Old Password/)));
    })

});
