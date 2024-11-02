import { useState } from 'react';
import { useApi } from './useApi';

export const useClasses = onUnauthorized => {
    const [classes, setClasses] = useState([]);
    const { makeAuthenticatedRequest } = useApi(onUnauthorized);

    const fetchClasses = async userId => {
        try {
            const data = await makeAuthenticatedRequest({
                method: 'get',
                url: `/api/classes/${userId}`,
            });
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    };

    const saveClass = async classData => {
        try {
            const data = await makeAuthenticatedRequest({
                method: 'post',
                url: '/api/classes',
                data: classData,
            });
            setClasses(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error saving class:', error);
            throw error;
        }
    };

    const deleteClass = async classId => {
        try {
            await makeAuthenticatedRequest({
                method: 'delete',
                url: `/api/classes/${classId}`,
            });
            setClasses(prev => prev.filter(c => c._id !== classId));
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    };

    return {
        classes,
        fetchClasses,
        saveClass,
        deleteClass,
    };
};
