import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const USERDETAILS_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/get-user`;
const REFRESH_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`;

export const useUserDetails = () => {
  const { setUser, accessToken, setAccessToken } = useContext(AuthContext);

  const getUser = async () => {
    try {
      const response = await axios.get(USERDETAILS_URI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      setUser(response.data.user);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // token expired, try to refresh
        try {
          const refreshRes = await axios.post(REFRESH_URI, {
            withCredentials: true,
          });
          const newAccessToken = refreshRes.data.accessToken;
          setAccessToken(newAccessToken);

          // retry the original request
          const retryResponse = await axios.get(USERDETAILS_URI, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
            withCredentials: true,
          });

          setUser(retryResponse.data);
          return retryResponse.data;
        } catch (refreshErr) {
            throw new Error("Session expired, please login again ", refreshErr);
        }
      }
      throw new Error("Failed to get user data");
    }
  };

  return { getUser };
};
