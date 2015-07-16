require(["circuits/plugins/StringPropertyPrefixPlugin"], function (StringPropertyPrefixPlugin) {
    
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;       
            }           
            else if (this[i] != array[i]) { 
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;   
            }           
        }       
        return true;
    }   
    

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
            assert.isTrue(["ar1", "ar2", "ar3"].equals(itemA.prop3));
            //assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assert.equal("abcd", itemA.prop1);
            assert.equal(34, itemA.prop2);
            assert.isTrue(["ar1", "ar2", "ar3"].equals(itemA.prop3));
            //assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
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
            
            assert.isTrue(["ar1", "ar2", "ar3"].equals(itemA.prop3));
            //assert.equal(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assert.isTrue(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"].equals(itemA.prop3));
            //assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemA.prop3);
        });
        
        it("Tests that the prefix can be added to multiple properties at once.", function () {
          //Uses itemB because the properties of itemA have already been affixed with
          //the prefix
            prefixPlugin.properties = ["prop1", "prop2", "prop3"];        
            
            assert.equal("abcd", itemB.prop1);
            assert.equal(34, itemB.prop2);
            assert.isTrue(["ar1", "ar2", "ar3"].equals(itemB.prop3));
            //assert.equal(["ar1", "ar2", "ar3"], itemB.prop3);
            prefixPlugin.fn(itemB);
            assert.equal("PREFIX_abcd", itemB.prop1);
            assert.equal("PREFIX_34", itemB.prop2);
            assert.isTrue(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"].equals(itemB.prop3));
            //assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemB.prop3);  
        });
    });
    
});

