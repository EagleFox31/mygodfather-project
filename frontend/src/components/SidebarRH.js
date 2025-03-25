import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaFileUpload, FaChartBar } from "react-icons/fa";

const SidebarRH = () => {
  return (
    <div className="d-flex flex-column p-3 bg-primary text-white h-screen">
      <h4 className="text-lg font-bold mb-4">RH Dashboard</h4>
      <ul className="nav flex-column">
        <li className="nav-item flex items-center space-x-2">
          <FaTachometerAlt />
          <Link className="nav-link text-secondary-5 hover:text-white" to="/dashboard-rh">Tableau de bord</Link>
        </li>
        <li className="nav-item flex items-center space-x-2">
          <FaFileUpload />
          <Link className="nav-link text-secondary-5 hover:text-white" to="/import">Importation Excel</Link>
        </li>
        <li className="nav-item flex items-center space-x-2">
          <FaChartBar />
          <Link className="nav-link text-secondary-5 hover:text-white" to="/stats">Statistiques</Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarRH;
