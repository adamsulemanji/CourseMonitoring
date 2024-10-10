import json
import boto3
from botocore.exceptions import ClientError
import uuid

ddb_client = boto3.client('dynamodb')

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
}

def map_semester(semester):
    if semester == 'Spring':
        return 1
    elif semester == 'Summer':
        return 2
    elif semester == 'Fall':
        return 3
    else:
        return 0

def lambda_handler(event, context):
    method = event['httpMethod']
    resource = event['resource']
    path_parameters = event.get('pathParameters', {})
    body = json.loads(event['body']) if event.get('body') else {}

    user_table = 'USERS_TABLE_NAME'
    class_table = 'CLASSES_TABLE_NAME'

    print('Event:', event)

    try:
        if method == 'POST' and resource == '/users':
            if 'email' not in body:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Email is required'})
                }

            create_user_params = {
                'TableName': user_table,
                'Item': {
                    'userId': {'S': str(uuid.uuid4())},
                    'email': {'S': body['email']},
                    'classes': {'L': []},
                }
            }
            ddb_client.put_item(**create_user_params)
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'message': 'New User Created'})
            }

        elif method == 'GET' and resource == '/users':
            scan_params = {'TableName': user_table}
            response = ddb_client.scan(**scan_params)
            users = [unmarshall(item) for item in response['Items']]
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'users': users})
            }

        elif method == 'GET' and resource == '/users/{uuid}':
            get_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.get_item(**get_user_params)
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found'})
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'user': unmarshall(response['Item'])})
            }

        elif method == 'PATCH' and resource == '/users/{uuid}':
            crn = body.get('crn')
            year = body.get('year')
            semester = body.get('semester')

            if not crn or not year or not semester:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'CRN, year, and semester are required'})
                }

            get_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.get_item(**get_user_params)
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found'})
                }

            class_id = str(uuid.uuid4())
            class_params = {
                'TableName': class_table,
                'Item': {
                    'classId': {'S': class_id},
                    'crn': {'S': crn},
                    'year': {'N': str(year)},
                    'semester': {'N': str(map_semester(semester))},
                    'userId': {'S': path_parameters['uuid']}
                }
            }
            ddb_client.put_item(**class_params)

            user = unmarshall(response['Item'])
            user['classes'].append(class_id)
            update_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}},
                'UpdateExpression': 'SET classes = :c',
                'ExpressionAttributeValues': {
                    ':c': {'L': [{'S': c} for c in user['classes']]}
                }
            }
            ddb_client.update_item(**update_user_params)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'User Updated'})
            }

        elif method == 'DELETE' and resource == '/users/{uuid}/classes':
            fetch_user_classes_params = {
                'TableName': class_table,
                'IndexName': 'userId-index',
                'KeyConditionExpression': 'userId = :userUuid',
                'ExpressionAttributeValues': {':userUuid': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.query(**fetch_user_classes_params)

            delete_classes_promises = []
            for class_item in response['Items']:
                class_deletion_params = {
                    'TableName': class_table,
                    'Key': {
                        'classId': {'S': class_item['classId']['S']},
                        'userId': {'S': path_parameters['uuid']}
                    }
                }
                delete_classes_promises.append(ddb_client.delete_item(**class_deletion_params))

            for promise in delete_classes_promises:
                promise

            user_classes_clear_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}},
                'UpdateExpression': 'SET classes = :emptyClassList',
                'ExpressionAttributeValues': {':emptyClassList': {'L': []}}
            }
            ddb_client.update_item(**user_classes_clear_params)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'All classes successfully deleted for the user'})
            }

        elif method == 'DELETE' and resource == '/users/{uuid}':
            get_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.get_item(**get_user_params)
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found'})
                }

            get_classes_params = {
                'TableName': class_table,
                'FilterExpression': 'userId = :u',
                'ExpressionAttributeValues': {':u': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.scan(**get_classes_params)

            for class_item in response['Items']:
                delete_class_params = {
                    'TableName': class_table,
                    'Key': {'classId': class_item['classId']}
                }
                ddb_client.delete_item(**delete_class_params)

            delete_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}}
            }
            ddb_client.delete_item(**delete_user_params)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'User Deleted'})
            }

        elif method == 'DELETE' and resource == '/users/{uuid}/classes/{classId}':
            delete_class_params = {
                'TableName': class_table,
                'Key': {
                    'classId': {'S': path_parameters['classId']},
                    'userId': {'S': path_parameters['uuid']}
                }
            }
            ddb_client.delete_item(**delete_class_params)

            get_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}}
            }
            response = ddb_client.get_item(**get_user_params)
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found'})
                }

            user = unmarshall(response['Item'])
            user['classes'] = [c for c in user['classes'] if c != path_parameters['classId']]

            update_user_params = {
                'TableName': user_table,
                'Key': {'userId': {'S': path_parameters['uuid']}},
                'UpdateExpression': 'SET classes = :c',
                'ExpressionAttributeValues': {
                    ':c': {'L': [{'S': c} for c in user['classes']]}
                }
            }
            ddb_client.update_item(**update_user_params)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Class Deleted'})
            }

        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'message': 'Route not found'})
            }

    except ClientError as error:
        print('Error:', error)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'An error occurred: {error}'})
        }


def unmarshall(item):
    """Helper function to convert DynamoDB item to Python dictionary."""
    return {key: list(value.values())[0] for key, value in item.items()}
