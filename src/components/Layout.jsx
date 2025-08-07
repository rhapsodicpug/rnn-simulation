import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="main-container">
      <Sidebar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="content-inner-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            // UPDATED: Changed the transition to a gentle spring for a smoother feel
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Tooltip id="app-tooltip" className="app-tooltip" place="bottom" />
    </div>
  );
};

export default Layout;