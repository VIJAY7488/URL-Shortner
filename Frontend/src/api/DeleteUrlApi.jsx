import axios from 'axios';

const DELETE_URL_API = `${import.meta.env.VITE_API_BASE_URL}/auth/delete-url`;


export const useDelete = () => {

    const deleteUrlById = async(urlId) => {
        try {
            await axios.delete(`${DELETE_URL_API}/${urlId}`,
            { withCredentials: true}
            );
            
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Deletion of url failed");
            }
            throw new Error("Deletion of url failed");
        }
    }

    return { deleteUrlById };
}