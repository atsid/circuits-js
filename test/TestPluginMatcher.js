define([
    "circuits/PluginMatcher",
    "circuits/util",
    "circuits/declare"
], function (
    PluginMatcher,
    Util,
    declare
) {

    var util = new Util(), b,
        matcher,
        plugins = [
            {
                type: "read",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "read",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "write",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "response",
                fn: function () {
                },
                pointcut: "*.*"
            }
        ],
        fullPlugins = [
            {
                type: "read",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "write",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "request",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "url",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "mixin",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "response",
                fn: function () {
                },
                pointcut: "*.*"
            }
        ],
        defaults = {
            read: [],
            write: [],
            url: [],
            request: [],
            response: [],
        },
        plugins_write = [
            {
                type: "write",
                fn: function () {
                },
                pointcut: "*.*"
            },
            {
                type: "write",
                fn: function () {
                },
                pointcut: "Specific.Pointcut"
            },
            {
                type: "write",
                fn: function () {
                },
                pointcut: "Specific.*"
            }
        ];


    describe("TestPluginMatcher", function() {

        //Create a new PluginMatcher to test with
        beforeEach(function () {
            matcher = new PluginMatcher();
        });

        //Check that wildcards are matched to appropriately
        it("testMatchGlobalTrue",  function () {
            assert.isTrue(matcher.match("CaseService.readCase")); //default pointcut, if not specified, is global
            assert.isTrue(matcher.match("CaseService.readCase", "*.*"));
            assert.isTrue(matcher.match("CaseService.readCase", "*"));
        });

        //Check that match correctly checks whether service names match. CaseService = CaseService
        it("testMatchServiceNameTrue",  function () {
            assert.isTrue(matcher.match("CaseService.readCase", "CaseService.*"));
        });

        //tests for cases used in PE2E
        it("testPE2ECases",  function () {
            // optional matches
            var reg = "(CaseService.*CaseList)|(CaseService.*Case)";
            assert.isFalse(matcher.match("CaseService.readCaseNote", reg));
            assert.isFalse(matcher.match("CaseService.createCaseNote", reg));
            assert.isFalse(matcher.match("CaseService.updateCaseNote", reg));
            assert.isFalse(matcher.match("CaseService.deleteCaseNote", reg));
            assert.isFalse(matcher.match("CaseService.readCaseNoteList", reg));
            assert.isFalse(matcher.match("CaseService.readPatent", reg));
            assert.isTrue(matcher.match("CaseService.readCase", reg));
            assert.isTrue(matcher.match("CaseService.readCaseList", reg));
            assert.isTrue(matcher.match("CaseService.updateCase", reg));
        });

        //tests full regex pattern matching with matchPattern
        it("testMatchPattern",  function () {
            var pattern = "";
            assert.isTrue(matcher.matchPattern("match.anything"));

            assert.isTrue(matcher.matchPattern("should.match", "s.*h"));
            assert.isTrue(matcher.matchPattern("should.match", "d\\..*h"));
            assert.isTrue(matcher.matchPattern("should.match", "\\bs.*h\\b"));
            assert.isTrue(matcher.matchPattern("should.match", "h.*c"));

            pattern = "\\bNoteService\\.(read|create|update|batchUpdate)";
            assert.isTrue(matcher.matchPattern("NoteService.readNote", pattern));
            assert.isFalse(matcher.matchPattern("NoteService.deleteNote", pattern));
            assert.isFalse(matcher.matchPattern("NoteService.batchDeleteNotes", pattern));

        });

        //Check that match correctly considers wildcards (*) to be equal as method names
        it("testMatchServiceNameWithWildcardMethodTrue",  function () {
            assert.isTrue(matcher.match("CaseService.*", "CaseService.*"));
        });

        //Checks that having different service names makes match return false, regardless of method name equality
        it("testMatchServiceNameWithWildcardMethodFalse",  function () {
            assert.isFalse(matcher.match("CaseService.*", "NoteService.*"));
        });

        //Checks that service name wildcards are equal
        it("testMatchServiceNameWithWildcardServiceTrue",  function () {
            assert.isTrue(matcher.match("*.readCase", "*.*"));
        });

        //More checks with wildcards and method names
        it("testMatchMethodNameTrue",  function () {
            assert.isTrue(matcher.match("CaseService.readCase", "*.readCase"));
            assert.isTrue(matcher.match("CaseService.readCase", "*.*Case"));
        });

        //Check that non-wildcard service and method names will match if equal
        it("testMatchServiceAndMethodNameTrue",  function () {
            assert.isTrue(matcher.match("CaseService.readCase", "CaseService.readCase"));
        });

        //Check that matching only one of the non-wildcard names is not sufficient
        it("testMatchServiceAndMethodNameFalse",  function () {
            assert.isFalse(matcher.match("CaseService.readCase", "NoteService.readCase"));
            assert.isFalse(matcher.match("CaseService.readCase", "CaseService.readNote"));
        });

        //Check that the empty string is valid as a name and matches the wildcard
        it("testMatchServiceAndMethodNameEmptyString",  function () {
            assert.isTrue(matcher.match("", "*"));
            assert.isFalse(matcher.match("", "*.*"));
        });

        //Check that the dot is valid as a name and matches the wildcard as well as *.*
        it("testMatchServiceAndMethodNameDot",  function () {
            assert.isTrue(matcher.match(".", "*"));
            assert.isTrue(matcher.match(".", "*.*"));
        });

        //Lots of tests to verify that certain patterns of partial matching do not
        //pass the matcher
        it("testMatchWithPartialMatches",  function () {
            assert.isFalse(matcher.match("123Yes.Match", "Yes.Match"));
            assert.isFalse(matcher.match("Yes.Match123", "Yes.Match"));
            assert.isFalse(matcher.match("123Yes.Match123", "Yes.Match"));
            assert.isFalse(matcher.match("123Yes.Match", "Yes.*"));
            assert.isFalse(matcher.match("Yes.Match123", "*.Match"));

            assert.isFalse(matcher.match("No123.Match", "No.Match"));
            assert.isFalse(matcher.match("No.123Match", "No.Match"));
            assert.isFalse(matcher.match("No123.123Match", "No.Match"));
            assert.isFalse(matcher.match("No123.Match", "No.*"));
            assert.isFalse(matcher.match("No.123Match", "*.Match"));

            assert.isFalse(matcher.match("No.Match", "123No.Match"));
            assert.isFalse(matcher.match("No.Match", "No.Match123"));
            assert.isFalse(matcher.match("No.Match", "123No.Match123"));
            assert.isFalse(matcher.match("No.Match", "No123.Match"));
            assert.isFalse(matcher.match("No.Match", "No.123Match"));
            assert.isFalse(matcher.match("No.Match", "No123.123Match"));
            assert.isFalse(matcher.match("*.Match", "No.Match123"));
            assert.isFalse(matcher.match("*.Match", "No.123Match"));

            assert.isFalse(matcher.match("No.Ma123tch", "No.Match"));
            assert.isFalse(matcher.match("N123o.Match", "No.Match"));
            assert.isFalse(matcher.match("No.Match", "No.Ma123tch"));
            assert.isFalse(matcher.match("No.Match", "N123o.Match"));

            assert.isFalse(matcher.match("OADocumentService.service", "DocumentService.*"));
            assert.isFalse(matcher.match("oaDocumentService.service", "DocumentService.*"));

            assert.isFalse(matcher.match("No.*", "123No.Match"));
            assert.isFalse(matcher.match("No.*", "No123.Match"));
        });

        // test list using a pattern.
        it("testListWithPattern",  function () {
            var plug = {
                pattern: "\\bClaimSetService\\.readClaimSet\\b|\\bClaimSetService\\.readClaimSetClaims\\b",
                type: "read",
                name: "ErrorRemoval",
                fn: function (data) {
                }
            };

            assert.equal(0, matcher.list("CaseService", "readCase", "read", [plug]).length);
            assert.equal(1, matcher.list("ClaimSetService", "readClaimSet", "read", [plug]).length);
            assert.equal(1, matcher.list("ClaimSetService", "readClaimSetClaims", "read", [plug]).length);
        });

        //Check various argument combinations with the list() function that should all result in an empty array
        //This means that none of the plugins in the passed array matched the requiremeents set by the other arguments
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        it("testListZeroMatches",  function () {
            assert.equal(0, matcher.list("CaseService", "readCase", "mixin", plugins).length);
            assert.equal(0, matcher.list("CaseService", "readCase", "read", undefined).length);
            assert.equal(0, matcher.list("CaseService", "readCase", "read", []).length);
            assert.equal(0, matcher.list("CaseService", "readCase", "read", plugins_write).length);
        });

        //Sample arguments passed to list that result in exactly one of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        it("testListOneMatch",  function () {
            assert.equal(1, matcher.list("CaseService", "readCase", "write", plugins).length);
            assert.equal(1, matcher.list("CaseService", "readCase", "write", plugins_write).length);
        });

        //Sample arguments passed to list that result in exactly two of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        it("testListTwoMatches",  function () {
            assert.equal(2, matcher.list("CaseService", "readCase", "read", plugins).length);
            assert.equal(2, matcher.list("Specific", "readCase", "write", plugins_write).length);
            assert.equal(2, matcher.list("", "", "read", plugins).length);
        });

        //Sample arguments passed to list that result in all of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        it("testListAllMatches",  function () {
            assert.equal(plugins_write.length, matcher.list("Specific", "Pointcut", "write", plugins_write).length);
        });

        //Given separate arrays of factoryPlugins, servicePlugins, and invocationPlugins, tests whether the
        //PluginMatcher.getPhaseChains() method correctly groups them into one object and in the proper order
        it("testSimpleGetPhaseChains",  function () {
            var factoryPlugins = [
                    {
                        name: "fRead1",
                        type: "read",
                        pointcut: "*.*"
                    }
                ],
                servicePlugins = [
                    {
                        name: "sRead1",
                        type: "read",
                        pattern: "est\\..*v"
                    }
                ],
                invocationPlugins = [
                    {
                        name: "iRead1",
                        type: "read",
                        pointcut: "*.*"
                    }
                ],
                phaseChains = matcher.getPhaseChains("test", "service", factoryPlugins, servicePlugins, invocationPlugins);

            assert.equal(3, phaseChains.read.length);
            assert.equal(0, phaseChains.write.length);
            assert.equal("fRead1", phaseChains.read[0].name);
            assert.equal("sRead1", phaseChains.read[1].name);
            assert.equal("iRead1", phaseChains.read[2].name);
        });

        // Test that the phase chains have the correct order based on when they
        // were added, what level they were defined for and what order they were passed.
        it("testPhaseChainOrder",  function () {
            var idx, factoryPlugins = [],
                servicePlugins = [],
                phaseChains,
                invocationPlugins = [];

            // setup a full set of plugins. 3 of each type at each level.
            // "defaults" contains all of the types that can be supported.
            Object.keys(matcher.defaults).forEach(function (key, index, obj) {
                for (idx = 0; idx < 3; idx += 1) {
                    factoryPlugins.push({name: idx + key, type: key});
                    servicePlugins.push({name: idx + "s" + key, type: key});
                    invocationPlugins.push({name: idx + "i" + key, type: key});
                }
            });

            phaseChains = matcher.getPhaseChains("test", "service", factoryPlugins, servicePlugins, invocationPlugins);

            // check that they were all returned in the right order.
            Object.keys(matcher.defaults).forEach(function (key, index, obj) {
                phaseChains[key].forEach(function (item, idx) {
                    // check that factories are first.
                    if (idx < 3) {
                        assert.equal(idx + key, item.name);
                        // services are next
                    } else if (idx < 6) {
                        assert.equal((idx - 3) + "s" + key, item.name);
                        // invokes are last
                    } else if (idx < 9) {
                        assert.equal((idx - 6) + "i" + key, item.name);
                    }
                });
            });
        });
    });
});
