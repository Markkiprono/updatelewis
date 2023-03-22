import { Alert, CircularProgress} from "@mui/material";
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






const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    try {
      axios.get("/api/attendance").then((res) => {
        setAttendance(res.data);
console.log(res)
        setloading(false);
      });
    } catch (err) {
      console.log(err);
      setloading(false);
      setError(true);
    }
  }, []);

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
        <h1>List of Attendance</h1>
        <h3>{attendance.length} attendance </h3>
      </div>
      <TableContainer component={Paper} style={{ height: "min-content" }}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell align="left">Email of Employee</StyledTableCell>
              <StyledTableCell align="left">Checked in</StyledTableCell>

              <StyledTableCell align="left">Checked out</StyledTableCell>
              <StyledTableCell align="left">Duration</StyledTableCell>
           
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
            {attendance.map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row._id}
                </StyledTableCell>
                <StyledTableCell align='left'>
                  {row.employee[0].email}
                </StyledTableCell>
                <StyledTableCell align="left">{row.checkIn}</StyledTableCell>
                <StyledTableCell align="left">{row.checkOut}</StyledTableCell>
                <StyledTableCell align="left">{parseFloat(row.duration *100).toPrecision(2) } min</StyledTableCell>
              
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer></div>
    </>
  );
};

export default Attendance;
