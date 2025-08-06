import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import logo from "../assets/Android.png";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleHomeClick = () => {
    if (user) {
      // Redirect to appropriate dashboard based on user role
      if (user.role === 'employee') {
        navigate('/employeeDashboard');
      } else if (user.role === 'employer') {
        navigate('/employerDashboard');
      } else {
        navigate('/');
      }
    } else {
      // If not logged in, go to landing page
      navigate('/');
    }
  };

  return (
    <div className=" w-full z-50 bg-[#0D3B66] shadow-md">
      <div className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between px-4 sm:px-8 py-3 gap-y-3">
        {/* Enhanced Brand Name */}
        <Link
          to="/"
          className="flex items-center gap-1 text-3xl font-bold tracking-wide">
          <img
            src={logo}
            alt="Lucid Ledger Logo"
            className="w-16 h-16 object-contain"
          />
          <span className="text-[#FFFFFF] hover:[#EE964B] transition-all">
            LUCID LEDGER
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-12 text-md">
          <button
            onClick={handleHomeClick}
            className="transition-all font-medium text-white hover:text-[#F4D35E]">
            Home
          </button>
          <NavLink
            to="/about-us"
            className={({ isActive }) =>
              `transition-all font-medium ${
                isActive ? "text-[#EE964B] font-semibold" : "text-white"
              } hover:text-[#F4D35E]`
            }>
            About Us
          </NavLink>

          {user ? (
            <div className='flex items-center gap-12'>
              <span className="text-white text-sm">
                Welcome, {user.first_name || user.email}
              </span>
              <Link 
                to={user.role === 'employee' ? '/employee-profile' : '/employer-profile'} 
                className='text-white hover:text-orange-600 transition-all text-lg'>
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className='bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all shadow-md text-lg'>
                  Log Out
              </button>
            </div>
          ) : (
            <div className='relative' ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)} 
                className='bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all shadow-md text-lg'
                >
                Sign In
              </button>

              {isDropdownOpen && (
                <div className='absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-lg'>
                  <Link 
                    to='/employeeLogin' 
                    className='block px-4 py-2 text-gray-900 hover:bg-orange-100 transition-all rounded-t-lg'>
                    Employee
                  </Link>
                  <Link 
                    to='/employerLogin' 
                    className='block px-4 py-2 text-gray-900 hover:bg-orange-100 transition-all rounded-b-lg'>
                    Employer
                  </Link>
                </div>
              )}
            </div>
          )}        
        </div>
      </div>
    </div>
  );
};

export default Navbar;
