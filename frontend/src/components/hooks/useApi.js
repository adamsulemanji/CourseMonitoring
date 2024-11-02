import axios from 'axios';
import { getCurrentSession } from '../utils/authUtils';

export const useApi = onUnauthorized => {
    const makeAuthenticatedRequest = async config => {
        try {
            const { token } = await getCurrentSession();

            const response = await axios({
                ...config,
                headers: {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error.response?.status === 401 && onUnauthorized) {
                onUnauthorized();
            }
            throw error;
        }
    };

    return { makeAuthenticatedRequest };
};
