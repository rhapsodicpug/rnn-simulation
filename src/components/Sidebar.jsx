import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, HelpCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // Import the useTheme hook
import AnimatedTitle from '../components/AnimatedTitle';

const tabs = [
  { path: "/", label: "Simulation", icon: BrainCircuit },
  { path: "/theory", label: "Theory", icon: BookOpen },
  { path: "/questionnaire", label: "Questionnaire", icon: HelpCircle },
];

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme(); // Use the hook to get theme state and toggle function

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div>
        <header className="header">
          <h1 className="header-title">RNN Simulation</h1>
          <p className="header-subtitle">Language Translation</p>
        </header>

        <nav className="tab-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.label}
                to={tab.path}
                end={tab.path === "/"}
                className={({ isActive }) =>
                  `tab-button ${isActive ? "is-active" : ""}`
                }
              >
                <span className="icon">
                  <Icon size={18} />
                </span>
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;