// Create DynamoDB tables and insert initial data

const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const dynamodb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();

const productsTable = {
    TableName: 'Products',
    
    AttributeDefinitions: [
        {
            AttributeName: 'ID',
            AttributeType: 'S' // string
        }
    ],
    KeySchema: [
        {
            AttributeName: 'ID',
            KeyType: 'HASH'
        }   
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, // default value
        WriteCapacityUnits: 5 // default value
    } 
};

const insertProducts = () => {
    
    const s3Bucket = 'https://s3.amazonaws.com/serverless-store-media/product-images/';

    const generateComment = () => {
        const id1 = uuidv4();
        const id2 = uuidv4();
        return [
            {
                ID: id1,
                Username: 'hien nguyen',
                Date: '2017-08-15',
                Text: `I like it `
            },
            {
                ID: id2,
                Username: 'Chinwe joy',
                Date: '2017-08-15',
                Text: 'Such a good book'
            }
        ]
    };

    const comments = [];
    for (let i = 0; i < 9; i++) {
        comments.push(generateComment());
    }

    const insertParams = {
        RequestItems: {
            'Products': [
                {
                    PutRequest: {
                        Item: {
                            ID: 'cloud-computing-book',
                            Name: 'Cloud computing book',
                            Price: 29.99,
                            Image: s3Bucket + 'cloud-computing-book.jpg',
                            Comments: comments[0]
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            ID: 'google-app-engine-book',
                            Name: 'Google App Engine book',
                            Price: 100,
                            Image: s3Bucket + 'google-app-engine-book.jpg',
                            Comments: comments[1]
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            ID: 'serverless-framework-book',
                            Name: 'Serverless framework book',
                            Price: 39.99,
                            Image: s3Bucket + 'serverless-framework-book.jpg',
                            Comments: comments[2]
                        }
                    }
                },
                
                
                {
                    PutRequest: {
                        Item: {
                            ID: 'aws-book',
                            Name: 'AWS Book',
                            Price: 40,
                            Image: s3Bucket + 'aws-book.jpg',
                            Comments: comments[8]
                        }
                    }
                }                                                                                                                                
            ]
        }
    };
    
    documentClient.batchWrite(insertParams, (err, data) => {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
};

dynamodb.createTable(productsTable, (err, data) => {
    if (err) return console.log(err, err.stack);

    const params = {
        TableName: 'Products'
    };

    dynamodb.waitFor('tableExists', params, (err, data) => {
        if (err) console.log(err, err.stack);
        else     insertProducts();
    });    
});

const cartTable = {
    TableName: 'ShoppingCart',
    AttributeDefinitions: [
        {
            AttributeName: 'UserID',
            AttributeType: 'S' // string
        }
    ],
    KeySchema: [
        {
            AttributeName: 'UserID',
            KeyType: 'HASH'
        }   
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, // default value
        WriteCapacityUnits: 5 // default value
    } 
};

dynamodb.createTable(cartTable, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
});