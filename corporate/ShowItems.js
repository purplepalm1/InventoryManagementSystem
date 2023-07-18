import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box } from "@mui/material";



const columns_item = [
    {
        field: "SKU",
        headerName: "SKU",
        type: "number",
        width: 100
    },
    {
        field: "name",
        headerName: "Name",
        width: 90
    },
    {
        field: "description",
        headerName: "Description",
        width: 100
    },
    {
        field: "price",
        headerName: "Price",
        type: "number",
        width: 100
    },
    {
        field: "maxQuantity",
        headerName: "Max Shelf Quantity",
        type: "number",
        width: 110
    }
];

//TODO: to fetch the real data and generate rows from the database, i.e. "SELECT * FROM item;"

// const rows = [];

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}


/*
Format of rows
[{"SKU":"ABC12345","name":"bananas","description":"test bananas from xyz","price":5,"maxQuantity":50},\
{"SKU":"ABD22311145","name":"bananas","description":"test bananas from xyz","price":5,"maxQuantity":50},\
{"SKU":"ABD22345","name":"bananas","description":"test bananas from xyz","price":5,"maxQuantity":50},\
{"SKU":"dfggfdsf","name":"dgfdfgfg","description":"dfgfg","price":2,"maxQuantity":34},
{"SKU":"DRJ203023","name":"bananas","description":"chiquita bananas from guatemala","price":2,"maxQuantity":40},...
*/


export default function ShowCorporateItems(props) {
    const rowIdGenerator = generateRowId();
    return (
        <div>
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    getRowId={() => rowIdGenerator.next().value}
                    rows={props.rows}
                    columns={columns_item}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    // components={{
                    //     Toolbar: GridToolbar,
                    // }}
                />
            </Box>
        </div >
    )
}