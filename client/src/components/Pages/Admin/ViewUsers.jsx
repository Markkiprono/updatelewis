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
import Swal from "sweetalert2";
import { IconButton } from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
//import SearchUsers from "./SearchUse";
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

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        await axios.get("/api/users/all").then((res) => {
          setUsers(res.data);
          setloading(false);
        });
      } catch (err) {
        console.log(err);
        setloading(false);
        setError(true);
      }
    };
    getUsers();
  }, []);
  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", text: "User Deleted " });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong Try again Later!"
      });
    }
  };
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
        <h1>List of Users</h1>
       {/*<SearchUsers/>*/}
        <h3>{users.length} users</h3>
      </div>
      <TableContainer component={Paper} style={{ height: "min-content" }}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
              <StyledTableCell align="left">Date Joined</StyledTableCell>

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
            {users.map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="left">{row.email}</StyledTableCell>
                <StyledTableCell align="left">{row.createdAt}</StyledTableCell>
                <StyledTableCell align="left">
                  <IconButton
                    size="small"
                    edge="start"
                    color="error"
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, delete it!"
                      }).then((result) => {
                        if (result.isConfirmed) {
                          deleteUser(row._id);
                        }
                      });
                    }}
                    aria-label="option"
                    sx={{ mr: 2 }}
                  >
                    <MdDeleteOutline />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer></div>
    </>
  );
};

export default ViewUsers;
