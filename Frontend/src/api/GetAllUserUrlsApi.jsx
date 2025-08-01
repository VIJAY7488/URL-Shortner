import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { UrlContext } from "../context/UrlContext";

const GET_ALL_USER_URI = `${import.meta.env.VITE_API_BASE_URL}/url/get-all-user-url`;

export const useUserAllUrls = () => {
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

      setAllUrls(response.data.data.urls);
      return response.data.urls;
    } catch (error) {
        throw new Error("Get to failed all user url. ", error);
    }
  };

  return { getAllUserUrls };
};
