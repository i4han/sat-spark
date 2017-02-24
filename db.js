

__.Module('web').mongo(
    //__.xmap(['bc', 'ok'], ['Trades', 'Ticker', 'Depth'], (k, j) => k + j)
        ['bcTradesClean', 'okTradesClean', 'Depth']
).build()
