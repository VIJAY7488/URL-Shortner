import React, { useContext, useState } from "react";
import { Edit2, LogOut, Mail, User, X } from "lucide-react";
import { useLogout } from "../api/LogoutApi";
import { AuthContext } from "../api/AuthContext";


const Profile = () => {

  const [showModal, setShowModal] = useState(false);
  const { logoutUser } = useLogout();
  const { user } = useContext(AuthContext);


  const handleProfileClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = async() => {
      await logoutUser();
  }
  

  return (
    <div>
      {/* Profile Picture - Click to open modal */}
      <div className="flex justify-center">
        <button
          onClick={handleProfileClick}
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          <img src={user.avatar} alt="" className="h-16 w-16 object-cover rounded-full" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className=" flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <img src={user.avatar} alt="" className="h-16 w-16 object-cover rounded-full" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">
                      {user.name}
                    </h2>
                    <p className="text-blue-100 text-sm">{user.email}</p>
                  </div>
                </div>
                <button
                    onClick={handleCloseModal}
                    className="text-white hover:bg-white -mt-16 -mr-4 hover:bg-opacity-20 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Profile Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Name</span>
                      </div>
                      <button
                        //  onClick={handleEditProfile}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Email</span>
                    </div>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center bg-red-50 hover:bg-red-100 px-4 py-3 rounded-lg transition-colors border border-red-200"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 font-medium">Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
