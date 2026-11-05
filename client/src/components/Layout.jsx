import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FiClock,
  FiCreditCard,
  FiGrid,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiUser,
  FiUsers,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { useAuth } from "../auth";
import { Avatar } from "./ui";

const MINE = [
  { to: "/", label: "My day", icon: FiClock, end: true },
  { to: "/pay", label: "My pay", icon: FiCreditCard },
  { to: "/profile", label: "Profile", icon: FiUser },
];

const ADMIN = [
  { to: "/admin", label: "Overview", icon: FiGrid, end: true },
  { to: "/admin/employees", label: "Employees", icon: FiUsers },
  { to: "/admin/attendance", label: "Attendance", icon: FiCalendar },
  { to: "/admin/payroll", label: "Payroll", icon: FiDollarSign },
  { to: "/admin/locations", label: "Locations", icon: FiMapPin },
];

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <FiClock />
      </div>
      Groupwork
    </div>
  );
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const link = ({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className="nav-link">
      <Icon />
      {label}
    </NavLink>
  );

  return (
    <div className="shell">
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Main navigation">
        <Brand />
        <nav>
          {isAdmin && <div className="nav-section">Admin</div>}
          {isAdmin && ADMIN.map(link)}
          <div className="nav-section">{isAdmin ? "Me" : "Menu"}</div>
          {MINE.map(link)}
        </nav>
        <div className="sidebar-foot">
          <Avatar user={user} size={36} />
          <div className="who">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
            <FiLogOut />
          </button>
        </div>
      </aside>
      <div className={`scrim${open ? " show" : ""}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>
          Groupwork
          <div style={{ marginLeft: "auto" }}>
            <Avatar user={user} size={32} />
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
