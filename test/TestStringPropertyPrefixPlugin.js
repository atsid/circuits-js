require(["circuits/plugins/StringPropertyPrefixPlugin"], function (StringPropertyPrefixPlugin) {

    var prefixPlugin = new StringPropertyPrefixPlugin(),
        itemA = {
            prop1: "abcd",
            prop2: 34,
            prop3: ["ar1", "ar2", "ar3"]
        },
        itemB = {
            prop1: "abcd",
            prop2: 34,
            prop3: ["ar1", "ar2", "ar3"]
        };
    
    prefixPlugin.prefix = "PREFIX_";
    
    describe("Test the StringPropertyPrefixPlugin", function () {
        it("Tests that the constructor properly instantiates properties", function () {
            assert.equal("read", prefixPlugin.type);
        });
        
        it("Tests that the prefix will not be added if the properties array is empty", function () {
            prefixPlugin.properties = [];        
            
            assert.equal("abcd", itemA.prop1);
            assert.equal(34, itemA.prop2);
            assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assert.equal("abcd", itemA.prop1);
            assert.equal(34, itemA.prop2);
            assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
        });
        
        it("Tests that the prefix can be added to a string", function () {
            prefixPlugin.properties = ["prop1"];        
            
            assert.equal("abcd", itemA.prop1);
            prefixPlugin.fn(itemA);
            assert.equal("PREFIX_abcd", itemA.prop1);
        });
        
        it("Tests that the prefix can be added to a number", function () {
            prefixPlugin.properties = ["prop2"];        
            
            assert.equal(34, itemA.prop2);
            prefixPlugin.fn(itemA);
            assert.equal("PREFIX_34", itemA.prop2);
        });
        
        it("Tests that the prefix can be added to an array", function () {
            prefixPlugin.properties = ["prop3"];        
            
            assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemA.prop3);
        });
        
        it("Tests that the prefix can be added to multiple properties at once.", function () {
          //Uses itemB because the properties of itemA have already been affixed with
          //the prefix
            prefixPlugin.properties = ["prop1", "prop2", "prop3"];        
            
            assert.equal("abcd", itemB.prop1);
            assert.equal(34, itemB.prop2);
            assert.equal(["ar1", "ar2", "ar3"], itemB.prop3);
            prefixPlugin.fn(itemB);
            assert.equal("PREFIX_abcd", itemB.prop1);
            assert.equal("PREFIX_34", itemB.prop2);
            assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemB.prop3);  
        });
    });
    
});

