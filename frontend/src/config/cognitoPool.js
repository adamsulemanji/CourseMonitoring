import { CognitoUserPool } from 'amazon-cognito-identity-js'

const poolData = {
    UserPoolId: 'us-east-1_OjUVi5IAI',
    ClientId: '4ndqe4ft3kej4g7lbhn8u5r7a1',
}

const userPool = new CognitoUserPool(poolData)

export default userPool
