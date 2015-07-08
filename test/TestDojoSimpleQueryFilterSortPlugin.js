require([
    "circuits/plugins/DojoSimpleQueryFilterSortPlugin",
    "circuits/ServiceFactory",
    "Schema/services/CaseService"
], function (
    FilterSortPlugin,
    Factory,
    CaseService
) {
    
        var b,
            queryPlugin = new FilterSortPlugin(),
            factory = new Factory(),
            data1 = [
                {id: 1, name: "a"},
                {id: 2, name: "b"},
                {id: 3, name: "c"},
                {id: 4, name: "d"}
            ],
            data2 = [
                {id: 1, name: "c"},
                {id: 2, name: "d"},
                {id: 3, name: "b"},
                {id: 4, name: "a"},  
            ],
            data3 = [
                {id: 3, name: "a"},
                {id: 2, name: "b"},
                {id: 1, name: "c"},
                {id: 4, name: "d"},  
            ];
        
        describe("test DojoSimpleQueryFilterSortPlugin", function () {
            it("Tests that the constructor properly instantiates properties", function () {
                var service = factory.getService(CaseService, {});
                
                assert.equal("mixin", queryPlugin.type);
                assert.notEqual(undefined, queryPlugin.queryEngine);
                
                assert.equal(undefined, service.filterAndSort);
                queryPlugin.fn(service);
                assert.notEqual(undefined, service.filterAndSort);
            });
            
            it("Verify that the default queryEngine was instantiated correctly from dojo.store.util.SimpleQueryEngine by doing some simple queries with the data1 array defined above", function () {
                var arrayWithOne = [],
                arrayWithTwo = [],
                arrayWithBoth = [];
            
                arrayWithOne = queryPlugin.queryEngine({name: "a"})(data1);
                arrayWithTwo = queryPlugin.queryEngine(function (obj) {
                    return obj.id === 2;
                })(data1);
                arrayWithBoth = queryPlugin.queryEngine(function (obj) {
                    return obj.id < 3;
                })(data1);
                
                assert.equal(1, arrayWithOne.length);
                assert.equal(1, arrayWithOne[0].id);
                assert.equal(1, arrayWithTwo.length);
                assert.equal("b", arrayWithTwo[0].name);
                assert.equal(2, arrayWithBoth.length);
                assert.equal("a", arrayWithBoth[0].name);
                assert.equal("b", arrayWithBoth[1].name);
            });
            
            it("Check that the filter method works as expected by testing it with an all-inclusive filter function and sorting the data by the \"name\" field with descending order on the data2 array defined above", function () {
                var filter = function (obj) { return true; },
                sort = [{attribute: 'name', descending: true}],
                newData;
            
                newData = queryPlugin.filter(filter, sort, data2);
                
                assert.equal("d", newData[0].name);
                assert.equal(2, newData[0].id);
                assert.equal("c", newData[1].name);
                assert.equal(1, newData[1].id);
                assert.equal("b", newData[2].name);
                assert.equal(3, newData[2].id);
                assert.equal("a", newData[3].name);
                assert.equal(4, newData[3].id);
            });
            
            it("Check that the filter method works as expected by testing it with an all-inclusive filter function and sorting the data by the \"id\" field with ascending order", function () {
                var filter = function (obj) { return true; },
                sort = [{attribute: 'id', descending: false}],
                newData;
        
                newData = queryPlugin.filter(filter, sort, data3);
            
                assert.equal("c", newData[0].name);
                assert.equal(1, newData[0].id);
                assert.equal("b", newData[1].name);
                assert.equal(2, newData[1].id);
                assert.equal("a", newData[2].name);
                assert.equal(3, newData[2].id);
                assert.equal("d", newData[3].name);
                assert.equal(4, newData[3].id);
            });
            
            it("Check that the filter method works as expected by testing it with an all- exclusive filter (nothing passes)", function () {
                var filter = function (obj) { return false; },
                sort = [{attribute: 'id', descending: true}],
                newData;
            
                newData = queryPlugin.filter(filter, sort, data1);
                
                assert.equal(0, newData.length);
            });
            
            it("Check that the filter method works as expected by testing it with a filter that only accepts objects with an even id number.  It sorts the new data by id number in descending order", function () {
                var filter = function (obj) { return obj.id % 2 === 0; },
                sort = [{attribute: 'id', descending: true}],
                newData;
            
                newData = queryPlugin.filter(filter, sort, data1);
                
                assert.equal(2, newData.length);
                assert.equal(4, newData[0].id);
                assert.equal("d", newData[0].name);
                assert.equal(2, newData[1].id);    
                assert.equal("b", newData[1].name); 
            });
            
            it("Check that the filter method works as expected by testing it with a filter function that accepts names of either 'a' or 'c'.  It then sorts these by name in ascending order", function () {
                var filter = function (obj) {
                    return obj.name === "a" || obj.name === "c";
                },
                sort = [{attribute: 'name', descending: false}],
                newData;
            
                newData = queryPlugin.filter(filter, sort, data2);
                
                assert.equal(2, newData.length);
                assert.equal("a", newData[0].name);
                assert.equal(4, newData[0].id);
                assert.equal("c", newData[1].name);
                assert.equal(1, newData[1].id);
            });
            
          //TO-DO: test filterAndSort with a service and test data
        });
        
       
    });
