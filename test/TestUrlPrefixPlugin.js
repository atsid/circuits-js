define(["circuits/plugins/UrlPrefixPlugin"], function (UrlPrefixPlugin) {

    var b,
        urlPlugin = new UrlPrefixPlugin(),
        urlItem = {
            url: "thisisaurl.com"
        };

    urlPlugin.prefix = "URL_PR_";

    describe("TestUrlPrefixPlugin", function() {


        //Tests that the constructor properly instantiates properties
        it("testDefaultConstructor",  function () {
            assert.equal("url", urlPlugin.type);
        });


        //Tests that the prefix will be added to the passed url of an item
        it("testPrefixOnUrl",  function () {
            var returnedURL;

            assert.equal("thisisaurl.com", urlItem.url);
            returnedURL = urlPlugin.fn(urlItem.url);
            assert.equal("URL_PR_thisisaurl.com", returnedURL);
        });

    });
});



