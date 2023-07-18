import { useContext, useState, useEffect, useRef } from 'react';
import { Button, Grow, Paper, Popper, MenuItem, MenuList, Stack, Typography, ClickAwayListener } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../authentication/auth-context';
import { Auth } from 'aws-amplify';

export default function MenuListComposition() {

    const { setIsAuthenticated, setIsManager, setIsCorporate } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const navigate = useNavigate();

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
        //this ensures that when we switch user role, we will automatically log out of the current role as well
    };

    const handleSelectCorporate = async (event) => {
        await Auth.signOut();
        setIsAuthenticated(false);
        setIsCorporate(false);
        setIsManager(false);
        navigate('/corporate/login', { replace: true });
    }

    const handleSelectManager = async (event) => {
        await Auth.signOut();
        setIsAuthenticated(false);
        setIsCorporate(false);
        setIsManager(false);
        navigate('/manager/login', { replace: true });
    }

    const handleSelectCustomer = async (event) => {
        await Auth.signOut();
        setIsAuthenticated(false);
        setIsCorporate(false);
        setIsManager(false);
        navigate('/', { replace: true });
    }

    useEffect(() => {
        onLoad();
    }, []);

    async function onLoad() {
        try {
            await Auth.currentSession();
            // once Auth.currentSession() runs successfully, we call userHasAuthenticated(true)
            setIsAuthenticated(true);
            //logic to set role here; is custom:role is manager then set isManager to true otherwise isCorporate to true.
        } catch (e) {
            if (e !== "No current user") {
                alert(e);
            }
        }
    }

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    return (
        <Stack direction="row" spacing={2}>
            <div>
                <Button
                    variant="contained"
                    ref={anchorRef}
                    id="composition-button"
                    aria-controls={open ? 'composition-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
                >
                    <MenuIcon />
                </Button>
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="bottom-start"
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList
                                        autoFocusItem={open}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        onKeyDown={handleListKeyDown}
                                    >
                                        <MenuItem onClick={handleSelectCorporate} style={{ zIndex: 10000 }}>
                                            <Typography textAlign="center">
                                                Corporate
                                            </Typography>
                                        </MenuItem>
                                        <MenuItem onClick={handleSelectManager} style={{ zIndex: 10000 }}>
                                            <Typography textAlign="center">
                                                Manager
                                            </Typography>
                                        </MenuItem>
                                        <MenuItem onClick={handleSelectCustomer} style={{ position: 'relative', zIndex: 10000 }}>
                                            <Typography textAlign="center">
                                                Customer
                                            </Typography>
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </Stack>
    );
}