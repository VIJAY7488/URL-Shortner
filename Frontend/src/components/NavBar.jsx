import React, { useContext } from 'react';
import Profile from './Profile';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUserAllUrls } from '../api/GetAllUserUrlsApi';
import { LinkIcon } from 'lucide-react';



const Navbar = () => {

  const location = useLocation();

  const { user } = useContext(AuthContext);
  const { getAllUserUrls } = useUserAllUrls();

  return (
    <header className="container mx-auto relative z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <LinkIcon className="h-4 w-4 text-white" />
          </div>
          <Link className="font-bold text-xl text-white">
            TinyLink
          </Link>
        </div>
            
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-purple-200' 
                : 'text-pink-200 hover:text-pink-300'
            }`}
          >
            Home
          </Link>
          <Link to='/my-urls' onClick={() => getAllUserUrls()} className="text-purple-200 font-medium hover:text-pink-200">
            My URLs
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