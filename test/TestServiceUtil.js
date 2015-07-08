require(["circuits/util"], function (Util) {
    var util = new Util(),
        schemaName = "Schema/services/CaseService",
        testString = "asdf",
        testNum = 22,
        arrayWithOneElem = ['a'];
    
    describe("Test the TestServiceUtil", function () {
        it("Verify that fullSchemaName() will return the full schema name when passed a full schema name to begin with, a service class name or, a service \"object\" name.", function () {
          //the other name methods delegate to this one, so we'll use it to test all accepted name forms
            assert.equal(schemaName, util.fullSchemaName("Schema/services/CaseService"));
            assert.equal(schemaName, util.fullSchemaName("CaseService"));
            assert.equal(schemaName, util.fullSchemaName("Case"));
        });
        
        it("/Verify that serviceName() will return the service class name when passed a full schema name as an argument", function () {
            assert.equal("CaseService", util.serviceName(schemaName));
        });
        
        it("Verify that shortName() will return the service \"object\" name when passed a full schema name as an argument", function () {
            assert.equal("Case", util.shortName(schemaName));
        });
    });

});