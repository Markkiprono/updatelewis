import { Alert, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#2E8B57",
    color: theme.palette.common.white,
    fontWeight: "bold"
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));




const Salary = () => {
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const getSalary = async () => {
      setLoading(true);
      try {
        await axios.get("/api/salary").then((res) => {
          setSalary(res.data);
          setLoading(false);
        });
      } catch (err) {
        console.log(err);
        setError(true);
        setLoading(false)
      }
    };
    getSalary();
  }, []);
  console.log(salary)
  return (
    <>
        <div style={{flexDirection:'column', display:'flex',width:"inherit"}}>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h1>List of Salaries</h1>
        <h3>{salary.length} </h3>
      </div>
      <TableContainer component={Paper} style={{ height: "min-content" }}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell align="left">salary</StyledTableCell>
              <StyledTableCell align="left">Created at</StyledTableCell>

              <StyledTableCell align="left"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <CircularProgress style={{ color: "black", marginTop: 10 }} />
              </div>
            )}
           {error && <Alert style={{marginLeft:100}} severity="error">Error finding Profile</Alert>}
            {salary.map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row.employee[0].email}
                </StyledTableCell>
                <StyledTableCell align="left">{row.salary}</StyledTableCell>
                <StyledTableCell align="left">{row.createdAt}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer></div>
    </>
  );
};

export default Salary;
