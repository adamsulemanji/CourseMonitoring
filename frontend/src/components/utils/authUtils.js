import userPool from '../../config/cognitoPool';

export const getCurrentSession = async () => {
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
        throw new Error('No current user');
    }

    const session = await new Promise((resolve, reject) => {
        currentUser.getSession((err, session) => {
            if (err) reject(err);
            resolve(session);
        });
    });

    if (!session.isValid()) {
        throw new Error('Invalid session');
    }

    return {
        user: currentUser,
        session,
        token: session.getIdToken().getJwtToken(),
    };
};

export const getUserAttributes = async currentUser => {
    return new Promise((resolve, reject) => {
        currentUser.getUserAttributes((err, attributes) => {
            if (err) {
                console.error('Failed to retrieve user attributes:', err);
                return reject(err);
            } else {
                return resolve(attributes);
            }
        });
    });
};
