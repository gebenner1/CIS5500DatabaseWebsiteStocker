import pymongo as mongo

client = mongo.MongoClient(
    "mongodb+srv://admin:UiFCjYzU3Jn3p27G@bookx.oy5xsb8.mongodb.net/?retryWrites=true&w=majority"
)


def get_user_by_username(username):
    collection = client["Stocks"]["Users"]
    return collection.find_one({"username": username})


def add_user(username, password):
    collection = client["Stocks"]["Users"]
    collection.insert_one(
        {
            "username": username,
            "password": password,
            "portfolio": [{"ticker": "AMZN", "quantity": "10"}],
        }
    )


def update_password(username, password):
    collection = client["Stocks"]["Users"]
    collection.update_one({"username": username}, {"$set": {"password": password}})
