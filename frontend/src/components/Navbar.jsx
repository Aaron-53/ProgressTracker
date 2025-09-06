import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiList, FiUsers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/questions", label: "Questions", icon: FiList },
    { path: "/class", label: "Class", icon: FiUsers },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
      {/* Left side - Welcome and Navigation */}
      <div className="flex items-center gap-6">
        <span className="text-2xl md:text-3xl font-semibold text-white/90">
          Welcome, {user?.name} 👋
        </span>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                location.pathname === path
                  ? "bg-blue-500/20 text-blue-400 border-blue-400/30"
                  : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Admin indicator and Logout */}
      <div className="flex items-center gap-3">
        {user?.isAdmin && (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-400/30 rounded-lg text-sm font-medium">
            Admin
          </span>
        )}

        <button
          onClick={logout}
          className="bg-amber-500/10 hover:bg-amber-500/5 text-amber-500/80 px-4 py-2 rounded-lg border border-amber-500/30 transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
