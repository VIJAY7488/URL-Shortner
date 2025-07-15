import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { UrlContext } from "../context/UrlContext";

const GET_ALL_USER_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/get-all-user-url`;

export const useUserDetails = () => {
  const { accessToken } = useContext(AuthContext);
  const { setAllUrls } = useContext(UrlContext);

  const getAllUserUrls = async () => {
    try {
      const response = await axios.get(GET_ALL_USER_URI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      setAllUrls(response.data.allUrls);
      return response.data;
    } catch (error) {
        throw new Error("Get to failed all user url. ", error);
    }
  };

  return { getAllUserUrls };
};
