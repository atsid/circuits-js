require(["circuits/util"], function (Util) {
    var b,
        util = new Util(),
        schemaName = "Schema/services/CaseService",
        testString = "asdf",
        testNum = 22,
        arrayWithOneElem = ['a'];
    
    b = new TestCase("TestServiceUtil", {
    
        setUp: function () {
        },
    
        //Verify that fullSchemaName() will return the full schema name when
        //passed a full schema name to begin with, a service class name or,
        //a service "object" name.
        testFullSchemaName: function () {
    
            //the other name methods delegate to this one, so we'll use it to test all accepted name forms
            assertEquals(schemaName, util.fullSchemaName("Schema/services/CaseService"));
            assertEquals(schemaName, util.fullSchemaName("CaseService"));
            assertEquals(schemaName, util.fullSchemaName("Case"));
        },
    
        //Verify that serviceName() will return the service class name when passed
        //a full schema name as an argument
        testServiceName: function () {
            assertEquals("CaseService", util.serviceName(schemaName));
        },
    
        //Verify that shortName() will return the service "object" name when passed
        //a full schema name as an argument
        testShortName: function () {
            assertEquals("Case", util.shortName(schemaName));
        }
    
    });

});