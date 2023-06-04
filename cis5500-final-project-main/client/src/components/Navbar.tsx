import { AccountCircle, Search as SearchIcon } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, InputBase, Menu, MenuItem, Toolbar, Typography, alpha, styled } from "@mui/material"
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = ({ auth, setAuth }: { auth: boolean, setAuth: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const search = useRef("");
    const navigate = useNavigate();

    const NavMenu = () => {
        const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

        const openMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchor(e.currentTarget);
        const closeMenu = () => setMenuAnchor(null);

        const handleLogout = () => {
            sessionStorage.removeItem("token");
            closeMenu();
            setAuth(false);
            navigate("/login");
        }

        return (
            auth ?
                <div>
                    <IconButton color="inherit" onClick={openMenu}>
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu"
                        open={Boolean(menuAnchor)}
                        anchorEl={menuAnchor}
                        onClose={closeMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right', }}
                    >
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </div>
                :
                <Button component={Link} to="/login" color="inherit">Login</Button>
        );
    }

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: '12ch',
                '&:focus': {
                    width: '20ch',
                },
            },
        },
    }));

    return (
        <AppBar>
            <Toolbar>
                <Typography variant="h5" component={Link} to="/portfolio" color="inherit" sx={{ textDecoration: "none" }}>Stocker</Typography>
                <Box flexGrow={1} />
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <form onSubmit={() => navigate(`/security/${search.current}`)}>
                        <StyledInputBase
                            onChange={e => search.current = e.target.value}
                        />
                    </form>
                </Search>
                <NavMenu />
            </Toolbar>
        </AppBar>
    )
}
