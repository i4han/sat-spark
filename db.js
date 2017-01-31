

__.Module('graph').mongo(
    __.xmap(['bc', 'ok'], ['Trades', 'Ticker', 'Depth'], (k, j) => k + j)
).build()
