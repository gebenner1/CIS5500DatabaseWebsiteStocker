import mysql.connector as sql
from functools import lru_cache
from src.utils.utils import retry


@lru_cache
@retry
def get_headlines(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""WITH Dif AS(
            SELECT date, (close - open) AS daily_dif
            FROM Daily_Stocks
            WHERE ticker = '{ticker}' 
                AND date >= (SELECT date
                            FROM Historic_News
                            ORDER BY date ASC
                            LIMIT 1)
                AND date <= (SELECT date
                            FROM Historic_News
                            ORDER BY date DESC
                            LIMIT 1)
            )
          SELECT title, date
          FROM Historic_News
          WHERE date = (SELECT date
                        FROM Dif
                        WHERE daily_dif = (SELECT max(DISTINCT daily_dif) FROM Dif)
                        ORDER BY date DESC
                        LIMIT 1)
          LIMIT 3"""
        )
        news = cursor.fetchall()
        return [
            {"date": day[1].strftime("%Y-%m-%d"), "headline": day[0]} for day in news
        ]


@lru_cache
@retry
def get_headlines_new(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""SELECT Title, Date
                FROM Current_News
                WHERE Ticker = '{ticker}' 
                ORDER BY Date DESC
                LIMIT 3"""
        )
        news = cursor.fetchall()
        return [
            {"date": day[1].strftime("%Y-%m-%d"), "headline": day[0]} for day in news
        ]


@lru_cache
@retry
def get_headlines_close_high(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""WITH Close_Range AS (SELECT date, close
                      FROM Daily_Stocks
                      WHERE ticker = '{ticker}' 
                          AND date >= (SELECT Date
                              FROM Historic_News
                              ORDER BY Date ASC
                              LIMIT 1)
                          AND date <= (SELECT Date
                              FROM Historic_News
                              ORDER BY Date DESC
                              LIMIT 1))
                      
                    SELECT Title, Date
                    FROM Historic_News
                    WHERE Date = (SELECT date
                                FROM Close_Range
                                WHERE close = (SELECT DISTINCT MAX(close) FROM Close_Range)
                                ORDER BY date DESC
                                LIMIT 1)
                    LIMIT 3"""
        )
        news = cursor.fetchall()
        return [
            {"date": day[1].strftime("%Y-%m-%d"), "headline": day[0]} for day in news
        ]


@lru_cache
@retry
def get_headlines_close_low(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""WITH Close_Range AS (SELECT date, close
                      FROM Daily_Stocks
                      WHERE ticker = '{ticker}' 
                          AND date >= (SELECT Date
                              FROM Historic_News
                              ORDER BY Date ASC
                              LIMIT 1)
                          AND date <= (SELECT Date
                              FROM Historic_News
                              ORDER BY Date DESC
                              LIMIT 1))
                      
                    SELECT Title, Date
                    FROM Historic_News
                    WHERE Date = (SELECT date
                                FROM Close_Range
                                WHERE close = (SELECT DISTINCT MIN(close) FROM Close_Range)
                                ORDER BY date DESC
                                LIMIT 1)
                    LIMIT 3"""
        )
        news = cursor.fetchall()
        return [
            {"date": day[1].strftime("%Y-%m-%d"), "headline": day[0]} for day in news
        ]


def get_headlines_portfolio(portfolio):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""
WITH with_added_row_num
    AS
    (SELECT date,
            ticker,
            title,
            ROW_NUMBER() OVER(PARTITION BY Ticker ORDER BY Date DESC) AS row_num
    FROM Current_News
    WHERE ticker in ({", ".join([f'"{item[0]}"' for item in portfolio])})
    )

    SELECT date,
           ticker,
           title
    FROM with_added_row_num
    WHERE row_num <=2
    ORDER BY row_num
    LIMIT 5
    """
        )
        news = cursor.fetchall()
        return [
            {"date": item[0].strftime("%Y-%m-%d"), "headline": item[2]} for item in news
        ]
