import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {AiFillFileImage, AiOutlineUserAdd, AiFillCalendar, AiFillWallet } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { FaBars } from "react-icons/fa";
import {CiLocationOn} from "react-icons/ci"
import {BsEmojiSmile} from 'react-icons/bs'
const navRoute = [
  {
    name: "Attendances",
    icon: <AiFillCalendar />,
    to: "/admin"
  },
  {
    name: "Create User",
    icon: <AiOutlineUserAdd />,
    to: "/CreateUser"
  },

  {
    name: "View Salary",
    icon: <AiFillWallet />,
    to: "/Salary"
  },
  {
    name:"View Location",
  icon:<CiLocationOn/>,
  to:'/location'
  },
  {
    name: "Users",
    icon: <FiUsers />,
    to: "/ViewUsers"
  },
  {
    name:"Users images",
    icon:<AiFillFileImage/>,
    to:'/images',
  }
];

const showAnimation = {
  hidden: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.5
    }
  },
  show: {
    width: "auto",

    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [mobile, setMobile] = useState(false);
  const navigate=useNavigate()

  const logout = () => {
    try {
        localStorage.removeItem("user");
        localStorage.removeItem('attendance')
       navigate("/Login")
    
    } catch (err) {
      
      console.log(err);
      }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobile]);

  return (
    <>
      <AppBar position="static" style={{background:"#4F7942"}}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={toggle}
            color="inherit"
            aria-label="menu"
          >
            <FaBars />
          </IconButton>
          <Box sx={{flexGrow:1}}/>
          <Button style={{color:'white', fontWeight:"bold"}}   onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <div className="main-container">
        <motion.div
          animate={{
            width: isOpen ? "200px" : !mobile ? "40px" : "0px",
            transition: {
              duration: 0.5,
              type: "spring",
              damping: 10
            }
          }}
          className="sidebar"
        >
          <div className="top_section">
            {isOpen && <motion.h1 className="logo">Groupwork</motion.h1>}

            {!mobile && (
              <div className="bars">
                <BsEmojiSmile onClick={toggle} />
              </div>
            )}
          </div>
          <section className="navRoute">
            {" "}
            
              <>
                {navRoute.map((route) => (
                  <NavLink
                    activeClassName="active"
                    to={route.to}
                    key={route.name}
                    className="Link"
                  >
                    {" "}
                    <div className="icon">{route.icon}</div>
                    <AnimatePresence>
                      {" "}
                      {isOpen && (
                        <motion.p
                          variants={showAnimation}
                          inital="hidden"
                          animate="show"
                          exit="hidden"
                          className="Link_Text"
                        >
                          {route.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </NavLink>
                ))}
              </>
        
          </section>
        </motion.div>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
export default SideBar;
