

__.Module('graph').collections(
    __.xmap(['bc', 'ok'], ['Trades', 'Ticker', 'Depth'], (k, j) => k + j)
).build()
