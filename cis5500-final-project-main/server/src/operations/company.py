import mysql.connector as sql
from functools import lru_cache
import json
from src.utils.utils import retry

fields = (
    "ticker",
    "avg_volume",
    "competitors",
    "security",
    "headquarters",
    "industry",
    "date_added",
)


@lru_cache
@retry
def get_company(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(f'SELECT * FROM Companies WHERE ticker="{ticker}"')
        company = list(cursor.fetchone())
        company[2] = json.loads(
            company[2].replace("'", '"')
        )  # convert competitors to list
        company[6] = company[6].strftime("%Y-%m-%d")  # convert date to string
        return {fields[i]: company[i] for i in range(len(company))}


@lru_cache
@retry
def get_history(ticker):
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f'SELECT date, adj_close FROM Daily_Stocks WHERE ticker="{ticker}" AND DATE >= "2010-01-01"'
        )
        history = list(cursor.fetchall())
        return [
            {"date": day[0].strftime("%Y-%m-%d"), "adj_close": day[1]}
            for day in history
        ]


@lru_cache
@retry
def get_companies():
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(f"SELECT ticker FROM Companies")
        companies = list(cursor.fetchall())
        return list(map(lambda x: x[0], companies))


@lru_cache
def get_recommended_stocks(ticker):
    print("WE ARE HERE!")
    with sql.connect(
        host="cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com",
        username="admin",
        password="AeFZpryUI5q9PWneFsdb",
        database="Stock_And_News",
    ) as connection:
        cursor = connection.cursor()
        cursor.execute(
            f"""
WITH stock AS
    (
        SELECT c.ticker, c.avg_volume, c.industry, c.competitors, ds.close AS price,
               ma.ma_1_month, ma.ma_6_month, ma.ma_1_year, pct_change.prc_change_mo1, pct_change.prc_change_mo6, pct_change.prc_change_yr1
        FROM (SELECT ticker, avg_volume, industry, competitors
              FROM Companies) c
            JOIN (SELECT ticker, date, close
                  FROM Daily_Stocks
                  WHERE date = (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '{ticker}')) ds ON c.ticker = ds.ticker
            JOIN (SELECT ma1mo.ticker, ma1mo.ma_1_month, ma6mo.ma_6_month, ma1yr.ma_1_year
                FROM
                (SELECT SUM(close) / COUNT(close) as ma_1_month, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH) FROM Daily_Stocks WHERE ticker = '{ticker}')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '{ticker}')
                GROUP BY ticker) ma1mo JOIN
                (SELECT SUM(close) / COUNT(close) as ma_6_month, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH) FROM Daily_Stocks WHERE ticker = '{ticker}')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '{ticker}')
                GROUP BY ticker) ma6mo ON ma1mo.ticker = ma6mo.ticker
                JOIN (SELECT SUM(close) / COUNT(close) as ma_1_year, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 YEAR) FROM Daily_Stocks WHERE ticker = '{ticker}')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '{ticker}')
                GROUP BY ticker) ma1yr ON ma1mo.ticker = ma1yr.ticker) ma ON ma.ticker = c.ticker
            JOIN (SELECT cur.ticker,
                (cur.price-mo1.price)/mo1.price as prc_change_mo1,
                (cur.price-mo6.price)/mo6.price as prc_change_mo6,
                (cur.price-yr1.price)/yr1.price as prc_change_yr1
                FROM (SELECT ticker, close AS price
                FROM Daily_Stocks WHERE date = (SELECT MAX(date)
                                FROM Daily_Stocks WHERE ticker = '{ticker}')
                GROUP BY ticker) cur
                JOIN
                    (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH)
                                                FROM Daily_Stocks WHERE ticker = '{ticker}')
                    GROUP BY ticker) mo1 ON cur.ticker = mo1.ticker
                JOIN (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH)
                                                FROM Daily_Stocks WHERE ticker = '{ticker}')
                    GROUP BY ticker) mo6 ON cur.ticker = mo6.ticker
                JOIN (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 377 DAY) #exactly one year was a weekend
                                                FROM Daily_Stocks WHERE ticker = '{ticker}')
                    GROUP BY ticker) yr1 ON cur.ticker = yr1.ticker) pct_change ON pct_change.ticker = c.ticker
    ),

industry_compete_dist AS
    (
    SELECT a.ticker,
        CASE WHEN a.industry IN (SELECT industry from stock WHERE ticker='{ticker}') THEN 0
        ELSE 1
        END AS industry_bool,
        CASE WHEN a.competitors LIKE CONCAT('%', (SELECT ticker FROM stock WHERE ticker='{ticker}'), '%') THEN 0
        ELSE 1
        END AS compete_bool
    FROM (SELECT ticker, industry, competitors FROM stock WHERE ticker <> '{ticker}') a
    ),

#
# #find difference
vol_price AS
    (
        SELECT A.ticker,
            POWER(A.avg_volume - (SELECT avg_volume FROM stock WHERE ticker='{ticker}'), 2) AS vol_diff,
            POWER(A.price - (SELECT price FROM stock WHERE ticker='{ticker}'), 2) AS price_diff,
            POWER(A.ma_1_month - (SELECT ma_1_month FROM stock WHERE ticker='{ticker}'), 2) AS ma_1_month_diff,
            POWER(A.ma_6_month - (SELECT ma_6_month FROM stock WHERE ticker='{ticker}'), 2) AS ma_6_month_diff,
            POWER(A.ma_1_year - (SELECT ma_1_year FROM stock WHERE ticker='{ticker}'), 2) AS ma_1_yr_diff,
            POWER(A.prc_change_mo1 - (SELECT prc_change_mo1 FROM stock WHERE ticker='{ticker}'), 2) AS pcr_1_month_diff,
            POWER(A.prc_change_mo6 - (SELECT prc_change_mo6 FROM stock WHERE ticker='{ticker}'), 2) AS prc_6_month_diff,
            POWER(A.prc_change_yr1 - (SELECT prc_change_yr1 FROM stock WHERE ticker='{ticker}'), 2) AS prc_1_yr_diff
        FROM (SELECT ticker,avg_volume,price, ma_1_month, ma_6_month, ma_1_year, prc_change_mo1, prc_change_mo6,
                prc_change_yr1
                FROM stock WHERE ticker <> '{ticker}') A
    )

SELECT i.ticker, (v.price_diff + v.vol_diff + i.industry_bool + i.compete_bool +
                  v.ma_1_month_diff + v.ma_6_month_diff + v.ma_1_yr_diff +
                  v.pcr_1_month_diff + v.prc_6_month_diff + v.prc_1_yr_diff) AS sum_vals
FROM vol_price v LEFT JOIN industry_compete_dist i on i.ticker = v.ticker
GROUP BY i.ticker
ORDER BY sum_vals ASC
LIMIT 5
        """
        )
        companies = list(cursor.fetchall())
        print("LIST", list(map(lambda x: x[0], companies)))
        return list(map(lambda x: x[0], companies))
