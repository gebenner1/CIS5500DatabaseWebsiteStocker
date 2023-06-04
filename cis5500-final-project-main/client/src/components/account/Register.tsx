import { Alert, Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../api/user";

export const Register = ({ auth }: { auth: boolean }) => {

    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<{ username: string, password: string, password2: string }>();
    const [error, setError] = useState<null | JSX.Element>(null);

    useEffect(() => {
        auth && navigate("/");
    });

    const onSubmit = ({ username, password, password2 }: { username: string, password: string, password2: string }) => {
        if (!username || !password) {
            setError(<Alert severity="error">Username and password required</Alert>);
        } else if (password !== password2) {
            setError(<Alert severity="error">Passwords don't match</Alert>);
        } else {
            addUser(username, password)
                .then(() => navigate("/login"))
                .catch(() => setError(<Alert severity="error">Username taken</Alert>));
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} border={1} borderRadius={4} padding={4}>
            <FormControl>
                <Typography variant="h5" alignSelf="center">Create an Account</Typography>
                {error}
                <TextField margin="normal" label="Username" fullWidth autoFocus {...register("username")} />
                <TextField margin="normal" label="Password" type="password" fullWidth {...register("password")} />
                <TextField margin="normal" label="Re-Enter Password" type="password" fullWidth {...register("password2")} />
                <Button variant="contained" type="submit" sx={{ mt: 3, mb: 2 }}>Submit</Button>
            </FormControl>
        </Box>
    );
}
