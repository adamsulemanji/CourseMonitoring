import json
import boto3
from botocore.exceptions import ClientError
import os
import requests
from bs4 import BeautifulSoup
import time


ddb_client = boto3.client('dynamodb')

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
}


def lambda_handler(event, context):
    method = event['httpMethod']
    resource = event['resource']
    path_parameters = event.get('pathParameters', {})
    body = json.loads(event['body']) if event.get('body') else {}


    class_table = os.environ['CLASSES_TABLE_NAME']
    user_table = os.environ['USERS_TABLE_NAME']

    print('Event:', event)
    print('Path Parameters:', path_parameters)
    print('Body:', body)
