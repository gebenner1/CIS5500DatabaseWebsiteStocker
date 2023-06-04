# CIS5500  Final Project

## Team Members

- [Grace Benner](mailto:gebenner@seas.upenn.edu) ([@gebenner1](https://github.com/gebenner1))
- [Natalie Gilbert](mailto:natgil@seas.upenn.edu) ([@nataliegilbert6](https://github.com/nataliegilbert6))
- [Eric Jackson](mailto:ebj29@sas.upenn.edu) ([@ericbj29](https://github.com/ericbj29))
- [Mikaela Spaventa](mailto:mspaventa11@gmail.com)([@mms3333](https://github.com/mms3333))

## Application Description

This web app is designed for people who are new to investing and want to visualize how different portfolios would have performed using historical data. We plan to include the following features:

- Daily returns on a user's portfolio 
- Recommeneded stocks based on a user's portfolio
- Portfolio balances on a given day
- Headlines related to a particular portfolio and day
- Stock predictions

## First Dataset: [yfinance](https://pypi.org/project/yfinance/)

This python script will allow us to scrape historical stock data from [finance.yahoo.com](https://finance.yahoo.com). We will use this to compile a table with seven attributes (ticker, date, open, low, high, close, adjusted close) and roughly 1.8 million rows.

## Second Dataset: [Reddit News](https://www.kaggle.com/datasets/aaron7sun/stocknews?select=RedditNews.csv)

This kaggle dataset contains the top 25 news headlines from Reddit News ranging fring from June 2008 to June 2016. It contains to attributes (date, headline) and roughly 73 thousand rows.

## Queries

1. Given a list of stocks, return an allocation with maximal Sharpe ratio.

2. Given a date, return a list of n stocks experiencing the greatest gains (losses) on that day.

3. Given a keyword and a stock, return the correlation between its presence in news headlines and next-day stock performance.

4. Given a portfolio, return a list of recommended stocks to consider addding.

5. Given a portfolio and date, return the portfolio's balance on that date.

