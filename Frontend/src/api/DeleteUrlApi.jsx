import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const DELETE_URL_API = `${import.meta.env.VITE_API_BASE_URL}/url/delete-url`;

const deleteUrlById = async (urlId) => {
  try {
    await axios.delete(`${DELETE_URL_API}/${urlId}`, { withCredentials: true });
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Deletion of url failed");
    }
    throw new Error("Deletion of url failed");
  }
};

export const useDeleteUrl = (onSuccessCallback = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUrlById,
    onSuccess: (_, urlId) => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });

      if (onSuccessCallback) {
        onSuccessCallback(urlId);
      }
    },
    onError: (error) => {
      console.error("Delete failed:", error.message);
    },
  });
};
