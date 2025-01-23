import axios from 'axios';

const getUserProfile = async (userId) => {
    try {
        const response = await axios.get('http://localhost:3000/api/auth/profile', {
            params: { userId: userId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data', error);
        return null;
    }
};

export default getUserProfile;
