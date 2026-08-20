import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { useNavigate } from 'react-router-dom';

const ProfileInfoCard = () => {
    const { user,clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = ()=>{
        localStorage.clear();
        clearUser();
        navigate("/");
    };

  return (
  user && (
  <div className="flex items-center">
    {user.profileImageUrl ? (
      <img
        src={user.profileImageUrl}
        alt={user.name || "User"}
        className="w-11 h-11 bg-gray-300 rounded-full mr-3 object-cover"
      />
    ) : (
      <div className="w-11 h-11 bg-amber-100 text-amber-700 font-bold text-sm rounded-full mr-3 flex items-center justify-center border border-amber-300">
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </div>
    )}
    
    <div>
      <div className="text-[15px] text-black font-bold leading-3">
        {user.name || ""}
      </div>

      <button
        className="text-amber-600 text-sm font-semibold cursor-pointer hover:underline"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  </div>
)
);
}

export default ProfileInfoCard