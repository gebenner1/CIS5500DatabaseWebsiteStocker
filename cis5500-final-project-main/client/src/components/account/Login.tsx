import { Alert, Box, Button, FormControl, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/login";

export const Login = ({ auth, setAuth }: { auth: boolean, setAuth: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<{ username: string, password: string }>();
    const [error, setError] = useState<null | JSX.Element>(null);

    useEffect(() => {
        auth && navigate("/");
    });

    const onSubmit = ({ username, password }: { username: string, password: string }) => {
        if (username && password) {
            login(username, password)
                .then(token => { sessionStorage.setItem("token", token); setAuth(true); navigate("/portfolio") })
                .catch(() => setError(<Alert severity="error">Incorrect Username or Password</Alert>))
        } else {
            setError(<Alert severity="error">Username and Password are Required</Alert>)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} border={1} borderRadius={4} padding={4}>
            <FormControl>
                <Typography variant="h5" alignSelf="center">Login</Typography>
                {error}
                <TextField margin="normal" label="Username" fullWidth autoFocus {...register("username")} />
                <TextField margin="normal" label="Password" type="password" fullWidth {...register("password")} />
                <Button variant="contained" type="submit" sx={{ mt: 3, mb: 2 }}>Login</Button>
                <Grid container xs>
                    <Grid item xs>
                        <Typography component={Link} to="/password-reset" variant="body2">Forgot Password</Typography>
                    </Grid>
                    <Grid item >
                        <Typography component={Link} to="/register" variant="body2">Create Account</Typography>
                    </Grid>
                </Grid>
            </FormControl>
        </Box>
    );
}
