import { useState } from 'react';
import { useApi } from './useApi';

export const useClasses = onUnauthorized => {
    const [classes, setClasses] = useState([]);
    const { makeAuthenticatedRequest } = useApi(onUnauthorized);

    const fetchClasses = async userId => {
        console.log(userId);
    };

    const saveClass = async classData => {
        console.log(classData);
    };

    const deleteClass = async classId => {
        console.log(classId);
    };

    return {
        classes,
        fetchClasses,
        saveClass,
        deleteClass,
    };
};
