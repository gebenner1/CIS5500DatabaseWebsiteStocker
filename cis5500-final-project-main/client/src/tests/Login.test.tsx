import { render, screen, waitFor } from '@testing-library/react';
import { Login } from '../components/account/Login';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe("login component", () => {

  const mockAxios = new MockAdapter(axios);

  mockAxios.onPost()
    .reply(config => {
      const data = JSON.parse(config.data);
      return data["username"] === "rparks" && data["password"] === "password" ? [201, { token: 'token' }] : [401, { error: 'invalid username or password' }];
    });

  it("renders \"Username\" and \"Password\"", () => {
    render(
      <BrowserRouter>
        <Login auth={false} setAuth={jest.fn()} />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/Username/));
    expect(screen.getByLabelText(/Password/));
  });

  it("renders \"Username and Password are Required\" if no username is supplied", async () => {
    render(
      <BrowserRouter>
        <Login auth={false} setAuth={jest.fn()} />
      </BrowserRouter>
    );
    await userEvent.click(screen.getByRole("button"));
    waitFor(() => expect(screen.getByLabelText(/Username and Password are Required/)));
  })

  it("renders \"Username and Password are Required\" if no password is supplied", async () => {
    render(
      <BrowserRouter>
        <Login auth={false} setAuth={jest.fn()} />
      </BrowserRouter>
    );
    await userEvent.type(screen.getByLabelText("Username"), "rparks");
    await userEvent.click(screen.getByRole("button"));
    waitFor(() => expect(screen.getByLabelText(/Username and Password are Required/)));
  })

  it("calls setAuth with correct username and password", async () => {
    const f = jest.fn();
    render(
      <BrowserRouter>
        <Login auth={false} setAuth={f} />
      </BrowserRouter>
    );
    await userEvent.type(screen.getByLabelText("Username"), "rparks");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button"));
    waitFor(() => expect(f).toBeCalled());
  })

  it("does not call setAuth with incorrect username and password", async () => {
    const f = jest.fn();
    render(
      <BrowserRouter>
        <Login auth={false} setAuth={f} />
      </BrowserRouter>
    );
    await userEvent.type(screen.getByLabelText("Username"), "jbezos");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button"));
    waitFor(() => expect(f).not.toBeCalled());
  })

});
