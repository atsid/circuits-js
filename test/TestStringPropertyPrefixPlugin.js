define(["circuits/plugins/StringPropertyPrefixPlugin"], function (StringPropertyPrefixPlugin) {

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

    describe("TestStringPropertyPrefixPlugin", function() {

        //Tests that the constructor properly instantiates properties
        it("testDefaultConstructor",  function () {
            assert.equal("read", prefixPlugin.type);
        });


        //Tests that the prefix will not be added if the properties array is empty
        it("testPrefixOnNone",  function () {
            prefixPlugin.properties = [];

            assert.equal("abcd", itemA.prop1);
            assert.equal(34, itemA.prop2);
            assert.equal(["ar1", "ar2", "ar3"].join(":"), itemA.prop3.join(":"));
            prefixPlugin.fn(itemA);
            assert.equal("abcd", itemA.prop1);
            assert.equal(34, itemA.prop2);
            assert.equal(["ar1", "ar2", "ar3"].join(":"), itemA.prop3.join(":"));
        });


        //Tests that the prefix can be added to a string
        it("testPrefixOnString",  function () {
            prefixPlugin.properties = ["prop1"];

            assert.equal("abcd", itemA.prop1);
            prefixPlugin.fn(itemA);
            assert.equal("PREFIX_abcd", itemA.prop1);
        });


        //Tests that the prefix can be added to a number
        it("testPrefixOnNumber",  function () {
            prefixPlugin.properties = ["prop2"];

            assert.equal(34, itemA.prop2);
            prefixPlugin.fn(itemA);
            assert.equal("PREFIX_34", itemA.prop2);
        });


        //Tests that the prefix can be added to an array
        it("testPrefixOnArray",  function () {
            prefixPlugin.properties = ["prop3"];

            assert.equal(["ar1", "ar2", "ar3"].join(":"), itemA.prop3.join(":"));
            prefixPlugin.fn(itemA);
            assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"].join(":"), itemA.prop3.join(":"));
        });


        //Tests that the prefix can be added to multiple properties at once.
        //Uses itemB because the properties of itemA have already been affixed with
        //the prefix
        it("testPrefixOnMultiple",  function () {
            prefixPlugin.properties = ["prop1", "prop2", "prop3"];

            assert.equal("abcd", itemB.prop1);
            assert.equal(34, itemB.prop2);
            assert.equal(["ar1", "ar2", "ar3"].join(":"), itemB.prop3.join(":"));
            prefixPlugin.fn(itemB);
            assert.equal("PREFIX_abcd", itemB.prop1);
            assert.equal("PREFIX_34", itemB.prop2);
            assert.equal(["PREFIX_ar1", "PREFIX_ar2", "PREFIX_ar3"].join(":"), itemB.prop3.join(":"));
        });

    });
});

