from functools import lru_cache
import json
import pymongo as mongo
import mysql.connector as sql
import numpy as np
from scipy import optimize
from datetime import datetime, timedelta

client = mongo.MongoClient(
    "mongodb+srv://admin:UiFCjYzU3Jn3p27G@bookx.oy5xsb8.mongodb.net/?retryWrites=true&w=majority"
)

sql_props = {
    "host": "cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
    "username": "admin",
    "password": "AeFZpryUI5q9PWneFsdb",
    "database": "Stock_And_News",
}


def get_portfolio(username):
    return client["Stocks"]["Users"].find_one(
        {"username": username}, {"_id": 0, "username": 0, "password": 0}
    )


def update_portfolio(username, portfolio):
    return client["Stocks"]["Users"].update_one(
        {"username": username}, {"$set": {"portfolio": portfolio}}
    )


@lru_cache
def get_max_movers(date):
    with sql.connect(**sql_props) as connection:
        cursor = connection.cursor()
        start = (datetime.strptime(date, "%Y-%m-%d") - timedelta(5)).strftime(
            "%Y-%m-%d"
        )
        end = (datetime.strptime(date, "%Y-%m-%d") + timedelta(5)).strftime("%Y-%m-%d")
        cursor.execute(
            f"""
            WITH T AS (SELECT DENSE_RANK() OVER (ORDER BY date) AS n, ticker, close, date
                    FROM Daily_Stocks
                    WHERE date >= '{start}'
                        AND date <= '{end}')
            SELECT d2.ticker, (d2.close - d1.close) / d1.close AS percent_change
            FROM T d1
                    JOIN T d2 ON (d1.ticker = d2.ticker AND d1.n + 1 = d2.n)
            WHERE d2.date = '{date}'
            ORDER BY percent_change DESC
            LIMIT 5;
            """
        )
        movers = list(cursor.fetchall())
        return [{"ticker": mover[0], "percent_change": mover[1]} for mover in movers]


@lru_cache
def get_portfolio_history(portfolio):
    with sql.connect(**sql_props) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""
            WITH 
            {", ".join([f'{item[0]} AS (SELECT date, {item[1]} * adj_close AS "{item[0]}" FROM Daily_Stocks WHERE ticker = "{item[0]}" AND date >= "2010-01-01")' for item in portfolio])}
            SELECT date, {"+".join([item[0] for item in portfolio])} AS value
            FROM {" NATURAL JOIN ".join([item[0] for item in portfolio])};
            """
        )
        history = list(cursor.fetchall())
        return [
            {"date": day[0].strftime("%Y-%m-%d"), "value": day[1]} for day in history
        ]


@lru_cache
def get_portfolio_information(portfolio, date):
    with sql.connect(**sql_props) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""    
            WITH 
            start AS (SELECT ticker, adj_close AS start FROM Daily_Stocks WHERE ticker IN ({" ,".join([f'"{item[0]}"' for item in portfolio])}) AND date = "2010-01-04"),
            end AS (SELECT ticker, adj_close AS end FROM Daily_Stocks WHERE ticker IN ({" ,".join([f'"{item[0]}"' for item in portfolio])}) AND date = "{date}")
            SELECT ticker, start, end, (end - start) / start AS percent_change FROM start NATURAL JOIN end;"""
        )
        prices = dict([(item[0], item[1:]) for item in list(cursor.fetchall())])
    means = get_portfolio_means(portfolio, date)
    covar = get_portfolio_covars(portfolio, date)
    results = maximize(means, covar).x
    recommendations = {key[0]: value for key, value in zip(portfolio, results)}
    total = sum([item[1] * prices[item[0]][1] for item in portfolio])
    return [
        {
            "ticker": item[0],
            "quantity": item[1],
            "allocation": item[1] * prices[item[0]][1] / total,
            "recommended": recommendations[item[0]],
            "original_price": prices[item[0]][0],
            "current_price": prices[item[0]][1],
            "percent_change": prices[item[0]][2],
        }
        for item in portfolio
    ]


@lru_cache
def get_portfolio_means(portfolio, date):
    with sql.connect(**sql_props) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""
WITH T AS (SELECT ROW_NUMBER() OVER () AS n, {", ".join([item[0] for item in portfolio])}
           FROM {" NATURAL JOIN ".join([f"(SELECT date, adj_close AS '{item[0]}' FROM Daily_Stocks WHERE ticker = '{item[0]}') AS {item[0]}" for item in portfolio])}
           WHERE date >= '2009-01-01'
             AND date <= '{date}')
SELECT {", ".join([f"AVG((t2.{item[0]} - t1.{item[0]}) / t1.{item[0]}) AS {item[0]}" for item in portfolio])}
FROM T t1
         JOIN T t2 ON t1.n + 1 = t2.n;
        """
        )
        return np.array(cursor.fetchone())


@lru_cache
def get_portfolio_covars(portfolio, date):
    with sql.connect(**sql_props) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""
WITH T AS (SELECT ROW_NUMBER() OVER () AS n, {", ".join([item[0] for item in portfolio])}
           FROM {" NATURAL JOIN ".join([f"(SELECT date, adj_close AS '{item[0]}' FROM Daily_Stocks WHERE ticker = '{item[0]}') AS {item[0]}" for item in portfolio])}
           WHERE date >= '2009-01-01'
             AND date <= '{date}'),
U AS (SELECT {", ".join([f"(t2.{item[0]} - t1.{item[0]}) / t1.{item[0]} AS {item[0]}" for item in portfolio])}
FROM T t1
         JOIN T t2 ON t1.n + 1 = t2.n)
SELECT {f", ".join([f"(SUM({item1[0]} * {item2[0]}) - SUM({item1[0]}) * SUM({item2[0]}) / COUNT({item1[0]})) / COUNT({item1[0]})" for item1 in portfolio for item2 in portfolio])}
FROM U;
        """
        )
        return np.array(cursor.fetchone()).reshape(len(portfolio), len(portfolio))


def maximize(mean_returns, covariance):
    Rf = 0.03
    risk_free_rate = np.power(1 + Rf, (1.0 / 365.0)) - 1

    def f(x, mean_returns, covariance, risk_free_rate):
        numerator = np.matmul(mean_returns, x.T) - risk_free_rate
        denominator = np.sqrt(np.matmul(np.matmul(x, covariance), x.T))
        return -(numerator / denominator)

    def constraint(x):
        A = np.ones(x.shape)
        return np.matmul(A, x.T) - 1

    x_init = np.repeat(0.33, mean_returns.shape[0])
    cons = {"type": "eq", "fun": constraint}
    bnds = tuple([0, 1] for x in x_init)

    return optimize.minimize(
        f,
        x0=x_init,
        args=(mean_returns, covariance, risk_free_rate),
        method="SLSQP",
        bounds=bnds,
        constraints=cons,
        tol=5 * 10**-3,
    )
