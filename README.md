# pray-prayers-serverless-api
A serverless api test for Pray.com

# Install
    npm install

# Deploy
    serverless deploy

# Endpoints
* POST /prayer - Creates a prayer with an autogenerated id (UUID v4) as prayerID
* GET /prayer/{id} - Gets a prayer using {id} as prayerID
* PUT /prayer/{id} - Updates a prayer having {id}
* DELETE /prayer/{id} - Deletes a prayer having {id}
* GET /prayers - Gets a list of all prayers

# Test
For staging purposes I used AWS Services (DynamoDB, Lambda) & Serverless. Also for testing purposes I used POSTMAN with the currently available AWS URL: https://7jt9isgxxc.execute-api.us-east-1.amazonaws.com
