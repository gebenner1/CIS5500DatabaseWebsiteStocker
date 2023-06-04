import { Alert, Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/user";

export const PasswordReset = ({ auth }: { auth: boolean }) => {

    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<{ username: string, password: string }>();
    const [error, setError] = useState<null | JSX.Element>(null);

    useEffect(() => {
        auth && navigate("/");
    });

    const onSubmit = ({ username, password }: { username: string, password: string }) => {
        if (username && password) {
            resetPassword(username, password)
                .then(() => navigate("/login"))
                .catch(() => setError(<Alert severity="error">New Password cannot be Old Password</Alert>));
        } else {
            setError(<Alert severity="error">Username and Password are Required</Alert>)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} border={1} borderRadius={4} padding={4}>
            <FormControl>
                <Typography variant="h5" alignSelf="center">Password Reset</Typography>
                {error}
                <TextField margin="normal" label="Username" fullWidth autoFocus {...register("username")} />
                <TextField margin="normal" label="New Password" type="password" fullWidth {...register("password")} />
                <Button variant="contained" type="submit" sx={{ mt: 3, mb: 2 }}>Submit</Button>
            </FormControl>
        </Box>
    );
}
