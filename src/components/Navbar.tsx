import { NavLink, Outlet } from "react-router-dom";

const Navbar = () => {

  return (
    <div className="header-container">
      <header className="header">
        <nav className="navbar">
          <NavLink to={"/"} className="app-name hide-on-mobile">
            {process.env.REACT_APP_APP_NAME || "Test Reporting Tool"}
          </NavLink>
          <NavLink to={"/tests/pending"} className="navbar-item">
            Pending
          </NavLink>
          <NavLink to={"/tests/completed"} className="navbar-item">
            Completed
          </NavLink>
          <NavLink to={"/tests/validated-releases"} className="navbar-item">
            Validated Releases
          </NavLink>
          <NavLink to={"/tests/new-test"} className="btn btn-primary">
            Create Test
          </NavLink>
        </nav>
        <nav className="navbar">
          <NavLink to={"/settings"} className="navbar-item">
            Settings
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};

export default Navbar;
