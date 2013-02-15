require(["circuits/plugins/UrlPrefixPlugin"], function (UrlPrefixPlugin) {
    
    var b,
        urlPlugin = new UrlPrefixPlugin(),
        urlItem = {
            url: "thisisaurl.com"
        };

    urlPlugin.prefix = "URL_PR_";
    
    b = new TestCase("TestUrlPrefixPlugin", {
        
        setup: function () {
        },
        
        //Tests that the constructor properly instantiates properties
        testDefaultConstructor: function () {
            assertEquals("url", urlPlugin.type);
        },
        
        //Tests that the prefix will be added to the passed url of an item
        testPrefixOnUrl: function () {
            var returnedURL;
            
            assertEquals("thisisaurl.com", urlItem.url);
            returnedURL = urlPlugin.fn(urlItem.url);
            assertEquals("URL_PR_thisisaurl.com", returnedURL);
        }
            
    });
});



