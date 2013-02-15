require(["circuits/plugins/StringPropertyPrefixPlugin"], function (StringPropertyPrefixPlugin) {

    var b,
        prefixPlugin = new StringPropertyPrefixPlugin(),
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
    
    b = new TestCase("TestStringPropertyPrefixPlugin", {
        
        setup: function () {
        },
        
        //Tests that the constructor properly instantiates properties
        testDefaultConstructor: function () {
            assertEquals("read", prefixPlugin.type);
        },
        
        //Tests that the prefix will not be added if the properties array is empty
        testPrefixOnNone: function () {
            prefixPlugin.properties = [];        
            
            assertEquals("abcd", itemA.prop1);
            assertEquals(34, itemA.prop2);
            assertEquals(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assertEquals("abcd", itemA.prop1);
            assertEquals(34, itemA.prop2);
            assertEquals(["ar1", "ar2", "ar3"], itemA.prop3);
        },
        
        //Tests that the prefix can be added to a string
        testPrefixOnString: function () {
            prefixPlugin.properties = ["prop1"];        
            
            assertEquals("abcd", itemA.prop1);
            prefixPlugin.fn(itemA);
            assertEquals("PREFIX_abcd", itemA.prop1);
        },
        
        //Tests that the prefix can be added to a number
        testPrefixOnNumber: function () {
            prefixPlugin.properties = ["prop2"];        
            
            assertEquals(34, itemA.prop2);
            prefixPlugin.fn(itemA);
            assertEquals("PREFIX_34", itemA.prop2);
        },
        
        //Tests that the prefix can be added to an array
        testPrefixOnArray: function () {
            prefixPlugin.properties = ["prop3"];        
            
            assertEquals(["ar1", "ar2", "ar3"], itemA.prop3);
            prefixPlugin.fn(itemA);
            assertEquals(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemA.prop3);
        },
        
        //Tests that the prefix can be added to multiple properties at once.
        //Uses itemB because the properties of itemA have already been affixed with
        //the prefix
        testPrefixOnMultiple: function () {
            prefixPlugin.properties = ["prop1", "prop2", "prop3"];        
            
            assertEquals("abcd", itemB.prop1);
            assertEquals(34, itemB.prop2);
            assertEquals(["ar1", "ar2", "ar3"], itemB.prop3);
            prefixPlugin.fn(itemB);
            assertEquals("PREFIX_abcd", itemB.prop1);
            assertEquals("PREFIX_34", itemB.prop2);
            assertEquals(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"], itemB.prop3);
        },
    });
});

