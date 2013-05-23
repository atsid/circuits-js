define({
    "id": "schema/ExampleStockModel",
    "description": "A simple model for a yahoo stock quote",
    "$schema": "http://json-schema.org/draft-03/schema",
    "type": "object",
    "properties": {
        "sym":  {
            "type": "string",
            "description": "The stock symbol",
            "required": true
        },
        "price":  {
            "type": "string",
            "description": "The price of the stock.",
            "required": false
        },
        "change": {
            "type": "string",
            "description": "The price change of the stock.",
            "required": false
        },
        "prevClose": {
            "type": "string",
            "description": "The price of the stock during previous close.",
            "required": false
        },
        "open": {
            "type": "string",
            "description": "The price of the stock at open.",
            "required": false
        },
        "bid": {
            "type": "string",
            "description": "The current bid price of the stock.",
            "required": false
        },
        "ask": {
            "type": "string",
            "description": "The asking price of the stock.",
            "required": false
        },
        "strike": {
            "type": "string",
            "description": "Strike of the stock.",
            "required": false
        },
        "expire": {
            "type": "string",
            "description": "expire of stock.",
            "required": false
        },
        "volume": {
            "type": "string",
            "description": "stock volume",
            "required": false
        },
        "openInterest": {
            "type": "string",
            "description": "Stock's open interest",
            "required": false
        }
    }
});

