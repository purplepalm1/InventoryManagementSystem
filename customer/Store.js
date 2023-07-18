/** Note: To show a specific store, we extract the storeId parameter from the route using the 'useParams' hook from 'react-router-dom'. Params is awesome, it can give you
 * multiple segments
 */

//TODO: Add AppBar and footer components for this page to look nice.

import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box, Paper } from "@mui/material";
import { AlertError } from "../components/AlertError";
import { AlertSuccess } from "../components/AlertSuccess";

var base_url = "https://gw41edkp6h.execute-api.us-east-1.amazonaws.com/Prod/";
var customer_view_store_url = base_url + "customerViewStore";
var buy_item_url = base_url + "buyItem";

const columns = [
  // { field: "id", headerName: "ID", width: 70 },
  {
    field: "SKU",
    headerName: "SKU",
    type: "number",
    width: 200
  },
  {
    field: "name",
    headerName: "Name",
    width: 200
  },
  {
    field: "description",
    headerName: "Description",
    width: 200
  },
  {
    field: "price",
    headerName: "Price",
    type: "number",
    width: 110
  },
  {
    field: "quantity",
    headerName: "Available Quantity",
    type: "number",
    width: 140
  },
  {
    field: "aisle",
    headerName: "Aisle",
    width: 110
  },
  {
    field: "shelf",
    headerName: "Shelf",
    width: 110
  },
  {
    field: "purchaseQty",
    headerName: "Purchase Quantity",
    renderCell: (rowValues) => {
      return (
        <form>
          <input type="text" id={`qty_${rowValues.row.SKU}_${rowValues.row.aisle}_${rowValues.row.shelf}`} name="qty" size="4"
            min="0" max={rowValues.row.maxQuantity}
          >
          </input>
        </form>
      )
    },
    width: 160
  },
  {
    field: "Purchase",
    renderCell: (rowValues) => {
      return (
        <Button variant="contained"> Purchase </Button>
      )
    },
    width: 160
  },
]

function* generateRowId() {
  let id = 0;
  while (true) {
    yield id++;
  }
}


// TODO: To implement a view of a specific store from the customer's point of view (i.e. page 12 )

export default function CustomerStoreView() {
  //TODO: reform and resent the storeJson in a tabular form
  let [storeItems, setStoreItems] = useState([]);
  const params = useParams();
  const rowIdGenerator = generateRowId();
  const [storeName, setStoreName] = useState(null);
  const [tableRerender, setTableRerender] = useState(false); //to rerender tables if an item is purchased and removed from shelf;

  // success, error state for user feedback

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [success, setSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const storeId = useParams().storeId;
  let data = {};
  data['storeID'] = storeId;

  // //building up the payload; ffirst starting from data, then build a body
  let body = {};
  body['body'] = JSON.stringify(data);

  console.log(body);

  let js = JSON.stringify(body);

  useEffect(() => {
    fetch(customer_view_store_url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: js
      })
      .then((response) => response.json())
      .then((data) => {
        // setSuccess(true);
        // setSuccessText(data.result);
        //set new rows as the rows of items fetched from the server
        let newStoreItems = data.items;
        setStoreItems(newStoreItems);
        setStoreName(data.storeName);
        //reset success state back to false to ready for the next invocation
        // setTimeout(() => {
        //   setSuccess(false);
        // }, 2000)

      })
      .catch((error) => {
        console.log('Error: ', error);
        setError(true);
        setErrorText(error.message);
      })
  }, [tableRerender]);

  const handlePurchaseClick = (rowValues) => {
    console.log(rowValues);
    if (rowValues.field === "Purchase") {
      console.log("purchased");
      // console.log(params)
      const shelf = rowValues.row.shelf;
      const aisle = rowValues.row.aisle;
      const purchaseQty = document.getElementById(`qty_${rowValues.row.SKU}_${rowValues.row.aisle}_${rowValues.row.shelf}`).value;
      const availableQty = rowValues.row.quantity;
      const itemPurchased = rowValues.row.SKU;
      if (purchaseQty <= availableQty) {
        setSuccess(true);
        setSuccessText(`Attemping to purchase ${purchaseQty} - ${itemPurchased} at shelf ${shelf} and aisle ${aisle}. Hang in there .....`);

        //reset success state back to false to ready for the next invocation
        setTimeout(() => {
          setSuccess(false);
        }, 2000)

        let data = {};
        data['SKU'] = itemPurchased;
        data['storeID'] = storeId;
        data['quantity'] = purchaseQty;
        data['aisle'] = aisle;
        data['shelf'] = shelf;
        // //building up the payload; ffirst starting from data, then build a body
        let body = {};
        body['body'] = JSON.stringify(data);
        console.log(body);
        let js = JSON.stringify(body);

        fetch(buy_item_url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: js
          })
          .then((response) => response.json())
          .then((data) => {
            setSuccess(true);
            setSuccessText(data.result);

            //reset success state back to false to ready for the next invocation
            setTimeout(() => {
              setSuccess(false);
            }, 2000)
            setTableRerender((prev) => !prev);
          })
          .catch((error) => {
            console.log('Error: ', error);
            setError(true);
            setErrorText(error.message);
          })
      } else {
        setError(true);
        setErrorText(`You can't buy more than ${availableQty}`);
      }
      //reset the Purchase quantity field after clicking on "Purchase"
      document.getElementById(`qty_${rowValues.row.SKU}_${rowValues.row.aisle}_${rowValues.row.shelf}`).value = null;
    }
  }


  return (
    <div>
      <CustomAppBar />

      {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
      {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}

      {storeItems.length === 0 ? <p>Sorry! The Store Runs Out Of Stock</p> :
        <div>
          <Typography variant="h4" align="center" sx={{ mb: 2.5 }}>View All Shelves in Store {params.storeId}</Typography>

          <Typography variant="h6" align="center" sx={{ fontStyle: 'italic', mb: 2.5 }}>{storeName}</Typography>

          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              getRowId={() => rowIdGenerator.next().value}
              rows={storeItems}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              components={{
                Toolbar: GridToolbar,
              }}
              onCellClick={handlePurchaseClick}
            />
          </Box>
        </div>
      }
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
