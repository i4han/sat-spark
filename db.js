

__.Module('web')  //__.xmap(['bc', 'ok'], ['Trades', 'Ticker', 'Depth'], (k, j) => k + j)
.mongo( ['bcTradesClean', 'okTradesClean', 'Depth'] )
.build()
