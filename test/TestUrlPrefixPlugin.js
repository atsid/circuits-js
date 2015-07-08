define(["circuits/plugins/UrlPrefixPlugin"], function (UrlPrefixPlugin) {
    
    var b,
        urlPlugin = new UrlPrefixPlugin(),
        urlItem = {
            url: "thisisaurl.com"
        };

    urlPlugin.prefix = "URL_PR_";
    
    describe("Test the UrlPrefixPlugin", function () {
        it("Test that the constructor properly instantiates properties", function () {
            assert.equal("url", urlPlugin.type);
        });
        
        it("Test that the prefix will be added to the passed url of an item", function () {
            assert.equal("thisisaurl.com", urlItem.url);
            returnedURL = urlPlugin.fn(urlItem.url);
            assert.equal("URL_PR_thisisaurl.com", returnedURL);
        });
    });
    
});



