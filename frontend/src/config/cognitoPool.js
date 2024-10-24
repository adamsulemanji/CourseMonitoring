import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-1_tQOjzQocV',
    ClientId: '3le5isv0lr9th52o7lvva1p1ih',
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
