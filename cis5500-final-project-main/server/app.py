import json

from flask import Flask, request
from flask_cors import CORS
from src.operations.portfolio import (
    get_max_movers,
    get_portfolio,
    get_portfolio_history,
    get_portfolio_information,
    update_portfolio,
)
from src.operations.news import (
    get_headlines,
    get_headlines_new,
    get_headlines_close_high,
    get_headlines_close_low,
    get_headlines_portfolio,
)
from src.operations.company import (
    get_companies,
    get_company,
    get_history,
    get_recommended_stocks,
)
from src.operations.user import add_user, update_password
from src.utils.auth import authenticate_user, get_username, validate_user

api = Flask(__name__)
CORS(api)


@api.route("/", methods=["GET"])
def hello_world():
    return "Hello, World!"


@api.route("/login", methods=["POST"])
def login():
    token = authenticate_user(request.json["username"], request.json["password"])
    if token:
        return json.dumps({"token": token}), 201
    else:
        return "invalid credentials", 401


@api.route("/register", methods=["POST"])
def register():
    try:
        add_user(request.json["username"], request.json["password"])
        return "updated", 200
    except Exception as e:
        print(e)
        return "username already in use", 400


@api.route("/password-reset", methods=["PUT"])
def password_reset():
    try:
        update_password(request.json["username"], request.json["password"])
        return "created", 201
    except Exception as e:
        print(e)
        return "username not found", 400


@api.route("/security/<ticker>", methods=["GET"])
def security(ticker):
    try:
        return json.dumps(get_company(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/history/<ticker>", methods=["GET"])
def history(ticker):
    try:
        return json.dumps(get_history(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/headlines/<ticker>", methods=["GET"])
def headlines(ticker):
    try:
        return json.dumps(get_headlines(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/headlines/new/<ticker>", methods=["GET"])
def headlines_new(ticker):
    try:
        return json.dumps(get_headlines_new(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/headlines/close/high/<ticker>", methods=["GET"])
def headlines_close_high(ticker):
    try:
        return json.dumps(get_headlines_close_high(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/headlines/close/low/<ticker>", methods=["GET"])
def headlines_close_low(ticker):
    try:
        return json.dumps(get_headlines_close_low(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/recommended_stocks/<ticker>", methods=["GET"])
def recommended_stocks(ticker):
    try:
        return json.dumps(get_recommended_stocks(ticker)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/max_movers/<date>", methods=["GET"])
def greatest_gain_loss(date):
    try:
        return json.dumps(get_max_movers(date)), 200
    except Exception as e:
        print(e)
        return "security not found", 404


@api.route("/portfolio/headlines", methods=["GET"])
def headlines_new_portfolio():
    try:
        token = request.headers.get("X-Api-Key")
        if validate_user(token):
            username = get_username(token)
            portfolio = tuple(
                [
                    (item["ticker"], item["quantity"])
                    for item in get_portfolio(username)["portfolio"]
                ]
            )
            headlines = get_headlines_portfolio(portfolio)
            return json.dumps(headlines)
        else:
            return "not authorized", 401
    except Exception as e:
        print(e)
        return "internal server error", 500


@api.route("/portfolio", methods=["GET", "PUT"])
def portfolio():
    try:
        token = request.headers.get("X-Api-Key")
        if validate_user(token):
            username = get_username(token)
            if request.method == "GET":
                return get_portfolio(username)
            else:
                update_portfolio(username, request.json)
                return "Updated", 201
        else:
            return "not authorized", 401
    except Exception as e:
        print(e)
        return "internal server error", 500


@api.route("/portfolio/history", methods=["GET"])
def portfolio_history():
    try:
        token = request.headers.get("X-Api-Key")
        if validate_user(token):
            username = get_username(token)
            portfolio = tuple(
                [
                    (item["ticker"], item["quantity"])
                    for item in get_portfolio(username)["portfolio"]
                ]
            )
            history = get_portfolio_history(portfolio)
            return json.dumps(history)
        else:
            return "not authorized", 401
    except Exception as e:
        print(e)
        return "internal server error", 500


@api.route("/portfolio/information", methods=["GET"])
def portfolio_information():
    try:
        token = request.headers.get("X-Api-Key")
        if validate_user(token):
            username = get_username(token)
            portfolio = tuple(
                [
                    (item["ticker"], item["quantity"])
                    for item in get_portfolio(username)["portfolio"]
                ]
            )
            information = get_portfolio_information(portfolio, request.args.get("date"))
            return json.dumps(information)
        else:
            return "not authorized", 401
    except Exception as e:
        print(e)
        return "internal server error", 500


@api.route("/companies", methods=["GET"])
def list_companies():
    try:
        return json.dumps(get_companies()), 200
    except Exception as e:
        print(e)
        return "not found", 404


if __name__ == "__main__":
    api.run()
