# Queries

This document contains the database credentials along with queries we plan to execute.

## Credentials:
------------

```
    host: cis5500-final.c4vm11sv4nva.us-east-1.rds.amazonaws.com
username: admin
password: AeFZpryUI5q9PWneFsdb
```

## Queries:

 1. Recommended stocks to invest in, based on one stock the user currently invests in.
Optimized:
 ```sql
 WITH stock AS
    (
        SELECT c.ticker, c.avg_volume, c.industry, c.competitors, ds.close AS price,
               ma.ma_1_month, ma.ma_6_month, ma.ma_1_year, pct_change.prc_change_mo1, pct_change.prc_change_mo6, pct_change.prc_change_yr1
        FROM (SELECT ticker, avg_volume, industry, competitors
              FROM Companies) c
            JOIN (SELECT ticker, date, close
                  FROM Daily_Stocks
                  WHERE date = (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')) ds ON c.ticker = ds.ticker
            JOIN (SELECT ma1mo.ticker, ma1mo.ma_1_month, ma6mo.ma_6_month, ma1yr.ma_1_year
                FROM
                (SELECT SUM(close) / COUNT(close) as ma_1_month, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH) FROM Daily_Stocks WHERE ticker = '<ticker>')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                GROUP BY ticker) ma1mo JOIN
                (SELECT SUM(close) / COUNT(close) as ma_6_month, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH) FROM Daily_Stocks WHERE ticker = '<ticker>')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                GROUP BY ticker) ma6mo ON ma1mo.ticker = ma6mo.ticker
                JOIN (SELECT SUM(close) / COUNT(close) as ma_1_year, ticker
                FROM Daily_Stocks
                WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 YEAR) FROM Daily_Stocks WHERE ticker = '<ticker>')
                AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                GROUP BY ticker) ma1yr ON ma1mo.ticker = ma1yr.ticker) ma ON ma.ticker = c.ticker
            JOIN (SELECT cur.ticker,
                (cur.price-mo1.price)/mo1.price as prc_change_mo1,
                (cur.price-mo6.price)/mo6.price as prc_change_mo6,
                (cur.price-yr1.price)/yr1.price as prc_change_yr1
                FROM (SELECT ticker, close AS price
                FROM Daily_Stocks WHERE date = (SELECT MAX(date)
                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                GROUP BY ticker) cur
                JOIN
                    (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH)
                                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                    GROUP BY ticker) mo1 ON cur.ticker = mo1.ticker
                JOIN (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH)
                                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                    GROUP BY ticker) mo6 ON cur.ticker = mo6.ticker
                JOIN (SELECT ticker, close AS price
                    FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 377 DAY) #exactly one year was a weekend
                                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                    GROUP BY ticker) yr1 ON cur.ticker = yr1.ticker) pct_change ON pct_change.ticker = c.ticker
    ),

industry_compete_dist AS
    (
    SELECT a.ticker,
        CASE WHEN a.industry IN (SELECT industry from stock WHERE ticker='<ticker>') THEN 0
        ELSE 1
        END AS industry_bool,
        CASE WHEN a.competitors LIKE CONCAT('%', (SELECT ticker FROM stock WHERE ticker='<ticker>'), '%') THEN 0
        ELSE 1
        END AS compete_bool
    FROM (SELECT ticker, industry, competitors FROM stock WHERE ticker <> '<ticker>') a
    ),

#
# #find difference
vol_price AS
    (
        SELECT A.ticker,
            POWER(A.avg_volume - (SELECT avg_volume FROM stock WHERE ticker='<ticker>'), 2) AS vol_diff,
            POWER(A.price - (SELECT price FROM stock WHERE ticker='<ticker>'), 2) AS price_diff,
            POWER(A.ma_1_month - (SELECT ma_1_month FROM stock WHERE ticker='<ticker>'), 2) AS ma_1_month_diff,
            POWER(A.ma_6_month - (SELECT ma_6_month FROM stock WHERE ticker='<ticker>'), 2) AS ma_6_month_diff,
            POWER(A.ma_1_year - (SELECT ma_1_year FROM stock WHERE ticker='<ticker>'), 2) AS ma_1_yr_diff,
            POWER(A.prc_change_mo1 - (SELECT prc_change_mo1 FROM stock WHERE ticker='<ticker>'), 2) AS prc_1_month_diff,
            POWER(A.prc_change_mo6 - (SELECT prc_change_mo6 FROM stock WHERE ticker='<ticker>'), 2) AS prc_6_month_diff,
            POWER(A.prc_change_yr1 - (SELECT prc_change_yr1 FROM stock WHERE ticker='<ticker>'), 2) AS prc_1_yr_diff
        FROM (SELECT ticker,avg_volume,price, ma_1_month, ma_6_month, ma_1_year, prc_change_mo1, prc_change_mo6,
                prc_change_yr1
                FROM stock WHERE ticker <> '<ticker>') A
    ),

scale AS (
  SELECT v1.ticker, (v1.vol_diff - AVG(v2.vol_diff)) / STD(v2.vol_diff) as vol_diff,
         (v1.price_diff - AVG(v2.price_diff)) / STD(v2.price_diff) as price_diff,
         (v1.ma_1_month_diff - AVG(v2.ma_1_month_diff)) / STD(v2.ma_1_month_diff) as ma_1_month_diff,
         (v1.ma_6_month_diff - AVG(v2.ma_6_month_diff)) / STD(v2.ma_6_month_diff) as ma_6_month_diff,
         (v1.ma_1_yr_diff - AVG(v2.ma_1_yr_diff)) / STD(v2.ma_1_yr_diff) as ma_1_yr_diff,
         (v1.prc_1_month_diff - AVG(v2.prc_1_month_diff)) / STD(v2.prc_1_month_diff) as prc_1_month_diff,
         (v1.prc_6_month_diff - AVG(v2.prc_6_month_diff)) / STD(v2.prc_6_month_diff) as prc_6_month_diff,
         (v1.prc_1_yr_diff - AVG(v2.prc_1_yr_diff)) / STD(v2.prc_1_yr_diff) as prc_1_yr_diff
    FROM vol_price v1, vol_price v2
    GROUP BY v1.ticker
)

SELECT i.ticker, (v.price_diff + v.vol_diff + i.industry_bool + i.compete_bool +
                  v.ma_1_month_diff + v.ma_6_month_diff + v.ma_1_yr_diff +
                  v.prc_1_month_diff + v.prc_6_month_diff + v.prc_1_yr_diff) AS sum_vals
FROM scale v LEFT JOIN industry_compete_dist i on i.ticker = v.ticker
GROUP BY i.ticker
ORDER BY sum_vals ASC
LIMIT 5
 ```   
    
Before Optimization:

   ```sql
      WITH single_stock AS
    (
        SELECT c.ticker, c.avg_volume, c.industry, c.security, c.competitors, ds.close AS price,
               ma.ma_1_month, ma.ma_6_month, ma.ma_1_year,
               pct_change.prc_change_mo1, pct_change.prc_change_mo6, pct_change.prc_change_yr1
        FROM (SELECT ticker, avg_volume, industry, competitors
              FROM Companies
              WHERE ticker = '<ticker>') c
            #Get most recent price of the ticker
            JOIN (SELECT ticker, date, close
                  FROM Daily_Stocks
                  WHERE ticker='<ticker>'
                  AND date = (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')) ds ON c.ticker = ds.ticker
            
            #Find the 1 month, 6 month, and 1 year moving averages for one ticker
            JOIN (SELECT ma1mo.ticker, ma1mo.ma_1_month, ma6mo.ma_6_month, ma1yr.ma_1_year
                 FROM
                (SELECT SUM(close) / COUNT(close) as ma_1_month, ticker
                    FROM Daily_Stocks
                    WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH) 
                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                    AND date <= (SELECT MAX(date) 
                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                    AND ticker = '<ticker>'
                    GROUP BY ticker) ma1mo 
                JOIN (SELECT SUM(close) / COUNT(close) as ma_6_month, ticker
                      FROM Daily_Stocks
                      WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH) 
                                     FROM Daily_Stocks WHERE ticker = '<ticker>')
                        AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                        AND ticker = '<ticker>'
                       GROUP BY ticker) ma6mo ON ma1mo.ticker = ma6mo.ticker
                JOIN (SELECT SUM(close) / COUNT(close) as ma_1_year, ticker
                      FROM Daily_Stocks
                      WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 YEAR) 
                                FROM Daily_Stocks WHERE ticker = '<ticker>')
                        AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                        AND ticker = '<ticker>'
                       GROUP BY ticker) ma1yr ON ma1mo.ticker = ma1yr.ticker) ma ON ma.ticker = c.ticker
                       
             #Find the 1 month, 6 month, and 1 year price percent changes of the single stock         
             JOIN (SELECT cur.ticker,
                    (cur.price-mo1.price)/mo1.price as prc_change_mo1,
                    (cur.price-mo6.price)/mo6.price as prc_change_mo6,
                    (cur.price-yr1.price)/yr1.price as prc_change_yr1
                    FROM (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT MAX(date)
                                        FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker = '<ticker>'
                          GROUP BY ticker) cur
                    JOIN (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH)
                                        FROM Daily_Stocks WHERE ticker = '<ticker>')
                         AND ticker = '<ticker>'
                         GROUP BY ticker) mo1 ON cur.ticker = mo1.ticker
                    JOIN (SELECT ticker, close AS price
                         FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH)
                                                        FROM Daily_Stocks WHERE ticker = '<ticker>')
                         AND ticker = '<ticker>'
                         GROUP BY ticker) mo6 ON cur.ticker = mo6.ticker
                    JOIN (SELECT ticker, close AS price
                          FROM Daily_Stocks WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 377 DAY) #exactly one year was a weekend
                                                           FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker = '<ticker>'
                          GROUP BY ticker) yr1 ON cur.ticker = yr1.ticker) pct_change ON c.ticker = pct_change.ticker
    ),
    
    all_stocks AS
    (
        SELECT c.ticker, c.avg_volume, c.industry, c.security, c.competitors, ds.close AS price,
               ma.ma_1_month, ma.ma_6_month, ma.ma_1_year, pct_change.prc_change_mo1, pct_change.prc_change_mo6, pct_change.prc_change_yr1
        FROM (SELECT ticker, avg_volume, industry, competitors
              FROM Companies
              WHERE ticker <> '<ticker>') c
            #Get most recent price of all the tickers except the selected one
            JOIN (SELECT ticker, date, close
                  FROM Daily_Stocks
                  WHERE date = (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                  AND ticker <> '<ticker>') ds ON c.ticker = ds.ticker
            
            #Find the 1 month, 6 month, and 1 year moving averages for all tickers except the selected one
            JOIN (SELECT ma1mo.ticker, ma1mo.ma_1_month, ma6mo.ma_6_month, ma1yr.ma_1_year
                  FROM (SELECT SUM(close) / COUNT(close) as ma_1_month, ticker
                        FROM Daily_Stocks
                        WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH) FROM Daily_Stocks WHERE ticker = '<ticker>')
                         AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker <> '<ticker>')
                        AND ticker <> '<ticker>'
                        GROUP BY ticker) ma1mo 
                  JOIN (SELECT SUM(close) / COUNT(close) as ma_6_month, ticker
                          FROM Daily_Stocks
                          WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH) FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker <> '<ticker>'
                          GROUP BY ticker) ma6mo ON ma1mo.ticker = ma6mo.ticker
                  JOIN (SELECT SUM(close) / COUNT(close) as ma_1_year, ticker
                          FROM Daily_Stocks
                          WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 1 YEAR) FROM Daily_Stocks WHERE ticker = '<ticker>')
                           AND date <= (SELECT MAX(date) FROM Daily_Stocks WHERE ticker = '<ticker>')
                           AND ticker <> '<ticker>'
                          GROUP BY ticker) ma1yr ON ma1mo.ticker = ma1yr.ticker) ma ON ma.ticker = c.ticker
                          
              #Find the 1 month, 6 month, and 1 year price percent changes of every stock except the single stock
              JOIN (SELECT cur.ticker,
                    (cur.price-mo1.price)/mo1.price as prc_change_mo1,
                    (cur.price-mo6.price)/mo6.price as prc_change_mo6,
                    (cur.price-yr1.price)/yr1.price as prc_change_yr1
                    FROM (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT MAX(date)
                                        FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker <> '<ticker>'
                         GROUP BY ticker) cur
                    JOIN (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 1 MONTH)
                                  FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker <> '<ticker>'
                          GROUP BY ticker) mo1 ON cur.ticker = mo1.ticker
                    JOIN (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 6 MONTH)
                                        FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker <> '<ticker>'
                         GROUP BY ticker) mo6 ON cur.ticker = mo6.ticker
                    JOIN (SELECT ticker, close AS price
                          FROM Daily_Stocks 
                          WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 377 DAY) #exactly one year was a weekend
                                       FROM Daily_Stocks WHERE ticker = '<ticker>')
                          AND ticker <> '<ticker>'
                          GROUP BY ticker) yr1 ON cur.ticker = yr1.ticker) pct_change ON pct_change.ticker = c.ticker
    ),
    
    #Assign 0 (indicating that they are more similar) if all other stocks are in the same industry as the single stock, otherwise assign 1
    industry_compete_dist AS
    (
    SELECT ticker,
        CASE
        WHEN industry IN (SELECT industry from single_stock) THEN 0
        ELSE 1
        END AS industry_bool,
        CASE
        WHEN competitors LIKE CONCAT('%', (SELECT ticker FROM single_stock), '%') THEN 0
        ELSE 1
        END AS compete_bool
    FROM all_stocks
    ),
    
    #Find the squared difference between all stocks and the single stock. This includes the difference in average volume, current price, moving       average for 1 month, moving average for 6 months, moving average for 1 year, percent change for 1 month, percent change for 6 months, and percent change for 1 year
    vol_price AS
    (
        SELECT ticker,
            POWER(A.avg_volume - (SELECT avg_volume FROM single_stock), 2) AS vol_diff,
            POWER(A.price - (SELECT price FROM single_stock), 2) AS price_diff,
            POWER(A.ma_1_month - (SELECT ma_1_month FROM single_stock), 2) AS ma_1_month_diff,
            POWER(A.ma_6_month - (SELECT ma_6_month FROM single_stock), 2) AS ma_6_month_diff,
            POWER(A.ma_1_year - (SELECT ma_1_year FROM single_stock), 2) AS ma_1_yr_diff,
            POWER(A.prc_change_mo1 - (SELECT prc_change_mo1 FROM single_stock), 2) AS pc_1_month_diff,
            POWER(A.prc_change_mo6 - (SELECT prc_change_mo6 FROM single_stock), 2) AS prc_6_month_diff,
            POWER(A.prc_change_yr1 - (SELECT prc_change_yr1 FROM single_stock), 2) AS prc_1_yr_diff
        FROM all_stocks A
    ),
    
    #Normalize the numeric, non-boolean data by substracting each column by the minimum value in the column and dividing by the difference between the    maximum of the column and minimum of the column
    scale AS
    (
    SELECT ticker,
           (A1.vol_diff - (SELECT MIN(vol_diff) FROM vol_price)) / ((SELECT MAX(vol_diff) FROM vol_price) 
           - (SELECT MIN(vol_diff) FROM vol_price)) AS scaled_vol,
           (A1.price_diff - (SELECT MIN(price_diff) FROM vol_price)) / ((SELECT MAX(price_diff) FROM vol_price)
           - (SELECT MIN(price_diff) FROM vol_price)) AS scaled_price,
           (A1.ma_1_month_diff - (SELECT MIN(ma_1_month_diff) FROM vol_price)) / ((SELECT MAX(ma_1_month_diff) FROM vol_price) 
           - (SELECT MIN(ma_1_month_diff) FROM vol_price)) AS scaled_ma_1_month_diff,
           (A1.ma_6_month_diff - (SELECT MIN(ma_6_month_diff) FROM vol_price)) / ((SELECT MAX(ma_6_month_diff) FROM vol_price) 
           - (SELECT MIN(ma_6_month_diff) FROM vol_price)) AS scaled_ma_6_month_diff,
           (A1.ma_1_yr_diff - (SELECT MIN(ma_1_yr_diff) FROM vol_price)) / ((SELECT MAX(ma_1_yr_diff) FROM vol_price) 
           - (SELECT MIN(ma_1_yr_diff) FROM vol_price)) AS scaled_ma_1_yr_diff,
           (A1.pc_1_month_diff - (SELECT MIN(pc_1_month_diff) FROM vol_price)) / ((SELECT MAX(pc_1_month_diff) FROM vol_price)
           - (SELECT MIN(pc_1_month_diff) FROM vol_price)) AS scaled_pc_1_month_diff,
           (A1.prc_6_month_diff - (SELECT MIN(prc_6_month_diff) FROM vol_price)) / ((SELECT MAX(prc_6_month_diff) FROM vol_price) 
           - (SELECT MIN(prc_6_month_diff) FROM vol_price)) AS scaled_pc_6_month_diff,
           (A1.prc_1_yr_diff - (SELECT MIN(prc_1_yr_diff) FROM vol_price)) / ((SELECT MAX(prc_1_yr_diff) FROM vol_price) 
           - (SELECT MIN(prc_1_yr_diff) FROM vol_price)) AS scaled_pc_1_yr_diff
    FROM vol_price A1
    )

    SELECT i.ticker, 
    (scaled_price + scaled_vol + industry_bool + compete_bool + scaled_ma_1_month_diff + scaled_ma_6_month_diff + scaled_ma_1_yr_diff + scaled_pc_1_month_diff + scaled_pc_6_month_diff + scaled_pc_1_yr_diff) AS sum_vals
    FROM scale s LEFT JOIN industry_compete_dist i on i.ticker = s.ticker
    GROUP BY i.ticker
    ORDER BY sum_vals
    LIMIT 5
   ```

2. The average percent change of a stock `ticker` on a given date range(`start` to `stop`).

     ```sql
     WITH T AS (SELECT date, close 
                FROM Daily_Stocks 
                WHERE ticker = '<ticker>' AND date >= '<start>' AND date <= '<stop>'),
     PC AS (SELECT d2.date AS date, (d2.close - d1.close)/d1.close AS percent_change, d1.close AS previous_close, d2.close AS close
            FROM T d1, T d2
            WHERE d1.date <d2.date AND NOT EXISTS (SELECT * 
                                                    FROM T d3 
                                                    WHERE d1.date < d3.date AND d3.date < d2.date))
     SELECT AVG(percent_change) * 100 AS avg_percent_change FROM PC;
     ```

3. The covariance between two stocks (`ticker1` and `ticker2`) on a given date range (`start` to `stop`).

     ```sql
     WITH 
     T1 AS (SELECT date, close 
          FROM Daily_Stocks 
          WHERE ticker = '<ticker1>' 
          AND date >= '<start>' 
          AND date <= '<stop>'),

     PC_1 AS (SELECT d2.date AS date, (d2.close - d1.close)/d1.close * 100 AS percent_change
          FROM T1 d1, T1 d2
          WHERE d1.date <d2.date
          AND NOT EXISTS (SELECT * FROM T1 d3 WHERE d1.date < d3.date AND d3.date < d2.date)),

     average_1 AS (SELECT AVG(percent_change) AS av 
               FROM PC_1),

     T2 AS (SELECT date, close 
          FROM Daily_Stocks 
          WHERE ticker = '<ticker2>' 
          AND date >= '<start>' 
          AND date <= 'stop'),

     PC_2 AS (SELECT d2.date AS date, (d2.close - d1.close)/d1.close * 100 AS percent_change
          FROM T2 d1, T2 d2
          WHERE d1.date <d2.date 
          AND NOT EXISTS (SELECT * FROM T2 d3 WHERE d1.date < d3.date AND d3.date < d2.date)),

     average_2 AS (SELECT AVG(percent_change) AS av 
               FROM PC_2),

     days AS (SELECT COUNT(*) AS days 
          FROM PC_1)

     SELECT SUM((a.percent_change - a1.av) * (b.percent_change - a2.av)) / (d.days - 1) AS covariance 
     FROM PC_1 a JOIN PC_2 b ON (a.date = b.date), average_1 a1, average_2 a2, days d
     ```

4. For a given stock, find histroical (2017-2021) news articles related to the day with the largest positive (MAX) or negative difference (MIN) in the opening and closing values. If there are mutliple days with the same difference, report the most recent.

    Optimized:

    ``` sql
    WITH Dif AS(
        SELECT date, (close - open) AS daily_dif
        FROM Daily_Stocks
        WHERE ticker = '<TICKER>'
        AND date >= (SELECT Date
                    FROM Historic_News
                    ORDER BY Date ASC
                    LIMIT 1)
        AND date <= (SELECT Date
                    FROM Historic_News
                    ORDER BY Date DESC
                    LIMIT 1))
        SELECT title, date
        FROM Historic_News
        WHERE date = (SELECT date
                        FROM Dif
                        WHERE daily_dif = (SELECT DISTINCT <MIN OR MAX>(daily_dif)
                                       FROM Dif)
                        ORDER BY date DESC
                        LIMIT 1)
    ```
    
    Before Optimizing:

    ``` sql
    WITH Dif AS(
        SELECT ticker, date, (close - open) AS daily_dif
        FROM Daily_Stocks)

    SELECT DISTINCT title, Historic_News.date
    FROM Daily_Stocks, Historic_News
    WHERE Historic_News.date = Daily_Stocks.date
    AND Historic_News.date = (SELECT date
                            FROM Dif
                            WHERE ticker = '<ticker>'
                            AND daily_dif = (SELECT <MAX or MIN>(daily_dif)
                                             FROM Dif
                                             WHERE ticker = '<ticker>'
                                             AND date >= (SELECT Date
                                                        FROM Historic_News
                                                        ORDER BY Date ASC
                                                        LIMIT 1)
                                             AND date <= (SELECT Date
                                                        FROM Historic_News
                                                        ORDER BY Date DESC
                                                        LIMIT 1)))
    ```

5. For a given stock, find histroical (2017-2021) news articles related to the lowest (MIN) or highest (MAX) closing value. If there are mutliple days with the same closing value, report the most recent. 
    
      ```sql
      WITH Close_Range AS (SELECT date, close
                            FROM Daily_Stocks
                            WHERE ticker = '<ticker>' 
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
                    WHERE close = (SELECT DISTINCT '<MAX or MIN>'(close)
                                  FROM Close_Range)
                    ORDER BY date DESC
                    LIMIT 1)
      ```

6. Top n most recent headlines related to a stock.
    
    ```sql
      SELECT Title, Date
      FROM Current_News
      WHERE Ticker = '<ticker>' 
      ORDER BY Date DESC
      LIMIT <n>
      ```

7.  The `n` tickers experiencing the greatest percent gains (losses) on a given `date`, along with their percent change. If the market is closed on `date`, the query returns an empty relation.

     ```sql
     SELECT d2.ticker, (d2.close - d1.close)/d1.close AS percent_change
     FROM Daily_Stocks d1 JOIN Daily_Stocks d2 ON d1.ticker = d2.ticker
     WHERE d1.date < d2.date 
     AND NOT EXISTS (SELECT * FROM Daily_Stocks d3 WHERE d1.date < d3.date AND d3.date < d2.date)
     AND d2.date = '<date>'
     ORDER BY percent_change DESC # omit DESC for greatest losses
     LIMIT <n>
     ```

8. Get general company information & competitors of company.
   
   Optimized:
   ```sql
   SELECT *
    FROM (SELECT * FROM Companies WHERE ticker='<ticker>') c
    JOIN (SELECT * FROM Daily_Stocks WHERE ticker='<ticker>' AND date=(SELECT MAX(date)
                             FROM Daily_Stocks)) d ON c.ticker = d.ticker
   ```
   
   Before Optimization:
   ```sql
   SELECT *
    FROM Companies c
    NATURAL JOIN Daily_Stocks d
    WHERE c.ticker='<ticker>' AND date=(SELECT date
                                FROM Daily_Stocks
                                WHERE ticker= '<ticker>'
                                ORDER BY date DESC
                                LIMIT 1)
   ```
      
9. Stock information on a given day
   
   ```sql
      SELECT ticker, ROUND(open, 2) AS price
        FROM Daily_Stocks
        WHERE ticker='<ticker>' AND date=(SELECT date
                                FROM Daily_Stocks
                                WHERE ticker= '<ticker>'
                                ORDER BY date DESC
                                LIMIT 1)
   ```
   
10. Given a stock, given a starting date, return all dates and values of opening cost. (For plotting purposes)
    
    ```sql
    SELECT open, date
    FROM Daily_Stocks
    WHERE ticker= '<ticker>' AND date >= '<date>'
    ```

11. Given a user's portfolio, return a list of the top 5 headlines related to the tickers in that portfolio. 
    Note: If user has > 5 stocks in portfolio, then only print one headline per stock.

    ```sql
    WITH with_added_row_num
        AS
        (SELECT Date,
                Ticker,
                Title,
                ROW_NUMBER() OVER(PARTITION BY Ticker ORDER BY Date DESC) row_num
        FROM Current_News
        WHERE Ticker in <ticker_list>
        )

        SELECT Date,
                Ticker,
                Title
        FROM with_added_row_num
        WHERE row_num <=2
        ORDER BY row_num
        LIMIT 5
    ```
