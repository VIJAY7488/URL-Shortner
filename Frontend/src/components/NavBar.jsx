import React, { useContext } from 'react';
import Profile from './Profile';
import { Link } from 'react-router-dom';
import { AuthContext } from '../api/AuthContext';


const Navbar = () => {

  const { user } = useContext(AuthContext);
  return (
    <header className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/"className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              TinyLink
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to='' className="text-white font-medium hover:text-gray-900">
                My URLs
              </Link>
              <Link to='' className="text-white font-medium hover:text-gray-900">
                Dashboard
              </Link>

              {user ? (<Profile />): (<>
                <Link to='/login'>
                <button className="px-3 py-2 font-medium rounded-md bg-white text-gray-900 border border-gray-200 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:text-white">
                Login 
                </button>
              </Link>
              
              <Link to='/register'>
                <button className="px-2 py-2 font-medium rounded-md bg-white text-gray-900 border border-gray-200 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:text-white">
                Get Started
                </button>
              </Link>
              </>)}
            </nav>
          </div>
        </header>
  );
};

export default Navbar;