import { NavLink, Outlet } from "react-router-dom";
import { ReactComponent as ArchiveIcon } from "../../assets/icons/archive-16.svg";
import { ReactComponent as CpuIcon } from "../../assets/icons/cpu-16.svg";
import { ReactComponent as BranchesIcon } from "../../assets/icons/git-branch-16.svg";
import { ReactComponent as AirplaneIcon } from "../../assets/icons/paper-airplane-16.svg";
import { ReactComponent as PaintbrushIcon } from "../../assets/icons/paintbrush-16.svg";
import { ReactComponent as PeopleIcon } from "../../assets/icons/people-16.svg";
import { ReactComponent as CodeReview } from "../../assets/icons/code-review-16.svg";
import { ReactComponent as WorkflowIcon } from "../../assets/icons/workflow-16.svg";

export const settingsLinks = [
  { to: "/settings/appearance", icon: <PaintbrushIcon />, label: "Appearance" },
  { to: "/settings/templates", icon: <WorkflowIcon />, label: "Templates" },
  { to: "/settings/users", icon: <PeopleIcon />, label: "Users" },
  { to: "/settings/branches", icon: <BranchesIcon />, label: "Branches" },
  { to: "/settings/mail-recipients", icon: <AirplaneIcon />, label: "Mail Recipients" },
  { to: "/settings/products", icon: <CpuIcon />, label: "Products" },
  { to: "/settings/presets", icon: <CodeReview />, label: "Comment Presets" },
  { to: "/settings/archived", icon: <ArchiveIcon />, label: "Archived Tests" },
];

function Sidebar() {
  return (
    <div className="layout-sidebar-grid">
      <nav className="layout-sidebar">
        <nav className="layout-sidebar-sidenav">
          <ul className="sidenav-list-group">
            {settingsLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={"sidenav-list-item"}>
                  {link.icon}
                  <span className="sidenav-label">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </nav>
      <div className="layout-sidebar-main ">
        <Outlet />
      </div>
    </div>
  );
}
export default Sidebar;
