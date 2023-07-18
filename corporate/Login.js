import CustomAppBar from '../components/AppBar';
import SignIn from '../components/LoginAppBtn';
import Footer from '../components/Footer.js';
import { Paper, Typography } from '@mui/material';

export default function Corporate() {
    return (
        <div>
            <CustomAppBar />
            <SignIn userRole="Corporate" />
            <Paper sx={{
                marginTop: 'calc(10% + 60px)',
                position: 'fixed',
                bottom: 0,
                width: '100%'
            }} square variant="outlined">
                <Footer />
            </Paper>
        </div>
    )
}