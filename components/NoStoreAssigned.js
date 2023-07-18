import CustomAppBar from "./AppBar";
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Grid, Typography } from '@mui/material';

const NoStoreAssignedPage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <CustomAppBar />
            <Grid container>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" sx={{mb: 10, mt: 10}}>Hello Manager! Unfortunately, the Corporate hasn't assigned you to manage any store, please check back later!</Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        onClick={() => {
                            navigate('/', { replace: true });
                        }}
                        variant="contained">
                        View Product as Customer</Button>
                </Grid>
            </Grid>
        </div >
    )
}

export default NoStoreAssignedPage;