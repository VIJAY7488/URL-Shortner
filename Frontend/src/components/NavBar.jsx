import React from 'react';
// import { Link } from '@tanstack/react-router';

const Navbar = () => {
  return (
    <header className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              TinyLink
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                My URLs
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <button className="px-3 py-2 rounded-md bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">
                Login 
              </button>
              <button className="px-2 py-2 rounded-md bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">Get Started</button>
            </nav>
          </div>
        </header>
  );
};

export default Navbar;