import jwt

from src.operations.user import get_user_by_username

KEY = "secret"


def valid_username_and_password(username, password):
    user = get_user_by_username(username)
    return (user != None) and (user["password"] == password)


def authenticate_user(username, password):
    if valid_username_and_password(username, password):
        data = {"username": username, "password": password}
        return jwt.encode(data, KEY).decode("utf-8")
    else:
        return None


def validate_user(token):
    decoded = jwt.decode(token, KEY)
    return valid_username_and_password(decoded["username"], decoded["password"])


def get_username(token):
    return jwt.decode(token, KEY)["username"]
