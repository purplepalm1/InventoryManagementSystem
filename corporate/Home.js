import { CardContent, CardHeader, Typography, Grid, Card, Button, Container, Stack, TextField, Box } from "@mui/material";
import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import ShowStores from "./ShowStores";
import { Auth } from 'aws-amplify';
import { AlertError } from "../components/AlertError";
import { AlertSuccess } from "../components/AlertSuccess";


var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var show_stores = base_url + "storesGetter"


// create a nice stylized Item component for a list

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

//generate rowsid
function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

export default function CorporateHome() {

    const storeId = useParams().storeId;
    // console.log(storeId);
    const [stores, setStores] = useState([]);

    // success, error state for user feedback

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    // to show all the stores;
    const viewStoresClickHandler = (event) => {

        if (stores.length === 0) {
            //if the card is not showing any managerID, clicking the button will fetch data from server
            fetch(show_stores, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    setSuccess(true);
                    setSuccessText(data.result);

                    //set new rows as the rows of stores fetched from the server
                    setStores(data.stores);

                    //reset success state back to false to ready for the next invocation
                    setTimeout(() => {
                        setSuccess(false);
                    }, 2000)
                })
                .catch((error) => {
                    console.log('Error: ', error);
                    setError(true);
                    setErrorText(error.message);
                })
        } else {
            //if rows have been displayed, a second click will hide the rows.
            setStores([]);
        }

        console.log("Clicked on view button!!")
    }

    const rowIdGenerator = generateRowId();

    useEffect(() => {
        onLoad();
    }, []);

    async function onLoad() {
        try {
            const data = await Auth.currentAuthenticatedUser();
            console.log(data);
        } catch (e) {
            if (e !== "No current user") {
                alert(e);
            }
        }
    }


    return (
        <div>
            <CustomAppBar />
            {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
            {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}

            <Typography variant="h2" align="center">Corporate Homepage</Typography>

            <Container >
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Item sx={{ boxShadow: 0 }}>
                            <Link
                                to={{ pathname: `/corporate/createStoreAlternative` }}
                                style={{ textDecoration: "none" }}
                            >
                                <Button variant="contained">Create Store</Button>
                            </Link>
                        </Item>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Item sx={{ boxShadow: 0 }}>
                            <Link
                                to={{ pathname: `/corporate/createItem` }}
                                style={{ textDecoration: "none" }}
                            >
                                <Button variant="contained">Create Item</Button>
                            </Link>
                        </Item>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Item sx={{ boxShadow: 0 }}>
                            <Link
                                to={{ pathname: `/corporate/mostExpensive` }}
                                style={{ textDecoration: "none" }}
                            >
                                <Button variant="contained">Most Expensive Item</Button>
                            </Link>
                        </Item>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Item sx={{ boxShadow: 0 }}>
                            <Link
                                to={{ pathname: `/corporate/assignItemLocation` }}
                                style={{ textDecoration: "none" }}
                            >
                                <Button variant="contained">Assign Item Location</Button>
                            </Link>
                        </Item>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Item sx={{ boxShadow: 0 }}>
                            <Link
                                to={{ pathname: "/corporate/totalInventory" }}
                                style={{ textDecoration: "none" }}
                            >
                                <Button variant="contained">Generate Total Inventory</Button>
                            </Link>
                        </Item>
                    </Grid>
                </Grid>
                <Grid container spacing={6} >
                    <Grid item sx={12} md={12}>

                        <Card raised>
                            <CardHeader
                                title="Show Stores"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />

                            <CardContent style={{ height: 400, width: "100%" }}>
                                <Typography variant="body1"> Click on "Delete" if you want to delete a store</Typography>
                                <Button
                                    variant="contained"
                                    align='center'
                                    onClick={viewStoresClickHandler}
                                > View/ Hide </Button>

                                <ShowStores stores={stores} />

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Paper sx={{
                marginTop: 'calc(10% + 60px)',
                position: 'fixed',
                bottom: 0,
                width: '100%'
            }} square variant="outlined">
                <Footer />
            </Paper>
        </div >
    )
}