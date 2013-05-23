define({
    "id": "Schema/StockJsonpSchema",
    "SMDVersion": "2.0",
    "$schema": "http://json-schema.org/draft-03/schema",
    "transport": "JSONP",
    "envelope": "URL",
    "description": "Service to pull stock quote from yahoo's rest api.",
    "contentType": "application/json",
    "jsonpCallbackParameter": "callback",
    "target": "http://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20yahoo.finance.oquote%20WHERE%20symbol%20%3D%20'YHOO'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
    "parameters": [
        {
            "name": "file",
            "type": "string",
            "envelope": "PATH",
            "description": "test parameter."
        }
    ],
    "services": {
        "getModel": {
            "target": "{file}",
            "transport": "GET",
            "description": "get a Model.",
            "payload": "",
            "returns": {
                "$ref": "schema/ExampleStockModel"
            }
        }
    }
});