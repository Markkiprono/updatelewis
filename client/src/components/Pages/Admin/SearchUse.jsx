import {
    Alert,
    CircularProgress,
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel
  } from "@mui/material";
  import React, { useState } from "react";
  import { AiOutlineSearch } from "react-icons/ai";
  import axios from "../../../api/axios";
  
  const SearchUsers = () => {
    const [search, setSearch] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchData, setSearchData] = useState([]);
    const searchUsers = async (e) => {
      e.preventDefault()
      setLoading(true);
      try {
        await axios.get(`/api/users/?search=${search}`).then((res) => {
          setSearchData(res.data);
          setLoading(false);
        });
      } catch (err) {
        console.log(err);
        setLoading(false);
        setError(true);
      }
    };
    return (
      <>
        <form onSubmit={searchUsers}>
          {error && <Alert severity="error">Error! Try again</Alert>}
          <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
            <InputLabel htmlFor="standard-adornment-password">
              Search User
            </InputLabel>
            <Input
              required
              id="standard-adornment-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton aria-label="toggle search" type="submit">
                    <AiOutlineSearch />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </form>
        {searchData.map((user) => (
          <div key={user._id}>
            <h1>{user.name}</h1>
          </div>
        ))}
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
      </>
    );
  };
  
  export default SearchUsers;
  