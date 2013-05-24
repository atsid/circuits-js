define({
    "id": "Schema/YqlSchema",
    "SMDVersion": "2.0",
    "$schema": "http://json-schema.org/draft-03/schema",
    "transport": "JSONP",
    "envelope": "URL",
    "description": "Service to pull data yahoo's rest api.",
    "contentType": "application/json",
    "jsonpCallbackParameter": "callback",
    "target": "https://query.yahooapis.com/v1/public/yql",
    "services": {
        "getModel": {
            "parameters": [
                {
                    "name": "q",
                    "type": "string",
                    "envelope": "URL",
                    "description": "test parameter.",
                    "optional": false
                }, {
                    "name": "diagnostics",
                    "type": "boolean",
                    "envelope": "URL",
                    "description": "When true, additional diagnostic info is returned in results",
                    "optional": true
                }, {
                    "name": "format",
                    "type": "string",
                    "envelope": "URL",
                    "description": "Should be either JSON or XML to specify return format.",
                    "optional": false,
                    "default": "json"
                }, {
                    "name": "env",
                    "type": "string",
                    "envelope": "URL",
                    "description": "eviroment or table space at yahoo",
                    "optional": false,
                    "default": "store://datatables.org/alltableswithkeys"
                }
            ],
            "transport": "JSONP",
            "description": "get a Model.",
            "payload": "",
            "returns": {
                "$ref": "schema/ExampleStockModel"
            }
        }
    }
});