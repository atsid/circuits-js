require([
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


    b = new TestCase("TestPluginMatcher", {

        //Create a new PluginMatcher to test with
        setUp: function () {
            matcher = new PluginMatcher();
        },

        //Check that wildcards are matched to appropriately
        testMatchGlobalTrue: function () {
            assertTrue(matcher.match("CaseService.readCase")); //default pointcut, if not specified, is global
            assertTrue(matcher.match("CaseService.readCase", "*.*"));
            assertTrue(matcher.match("CaseService.readCase", "*"));
        },

        //Check that match correctly checks whether service names match. CaseService = CaseService
        testMatchServiceNameTrue: function () {
            assertTrue(matcher.match("CaseService.readCase", "CaseService.*"));
        },

        //tests for cases used in PE2E
        testPE2ECases: function () {
            // optional matches
            var reg = "(CaseService.*CaseList)|(CaseService.*Case)";
            assertFalse(matcher.match("CaseService.readCaseNote", reg));
            assertFalse(matcher.match("CaseService.createCaseNote", reg));
            assertFalse(matcher.match("CaseService.updateCaseNote", reg));
            assertFalse(matcher.match("CaseService.deleteCaseNote", reg));
            assertFalse(matcher.match("CaseService.readCaseNoteList", reg));
            assertFalse(matcher.match("CaseService.readPatent", reg));
            assertTrue(matcher.match("CaseService.readCase", reg));
            assertTrue(matcher.match("CaseService.readCaseList", reg));
            assertTrue(matcher.match("CaseService.updateCase", reg));
        },

        //tests full regex pattern matching with matchPattern
        testMatchPattern: function () {
            var pattern = "";
            assertTrue(matcher.matchPattern("match.anything"));

            assertTrue(matcher.matchPattern("should.match", "s.*h"));
            assertTrue(matcher.matchPattern("should.match", "d\\..*h"));
            assertTrue(matcher.matchPattern("should.match", "\\bs.*h\\b"));
            assertTrue(matcher.matchPattern("should.match", "h.*c"));

            pattern = "\\bNoteService\\.(read|create|update|batchUpdate)";
            assertTrue(matcher.matchPattern("NoteService.readNote", pattern));
            assertFalse(matcher.matchPattern("NoteService.deleteNote", pattern));
            assertFalse(matcher.matchPattern("NoteService.batchDeleteNotes", pattern));

        },

        //Check that match correctly considers wildcards (*) to be equal as method names
        testMatchServiceNameWithWildcardMethodTrue: function () {
            assertTrue(matcher.match("CaseService.*", "CaseService.*"));
        },

        //Checks that having different service names makes match return false, regardless of method name equality
        testMatchServiceNameWithWildcardMethodFalse: function () {
            assertFalse(matcher.match("CaseService.*", "NoteService.*"));
        },

        //Checks that service name wildcards are equal
        testMatchServiceNameWithWildcardServiceTrue: function () {
            assertTrue(matcher.match("*.readCase", "*.*"));
        },

        //More checks with wildcards and method names
        testMatchMethodNameTrue: function () {
            assertTrue(matcher.match("CaseService.readCase", "*.readCase"));
            assertTrue(matcher.match("CaseService.readCase", "*.*Case"));
        },

        //Check that non-wildcard service and method names will match if equal
        testMatchServiceAndMethodNameTrue: function () {
            assertTrue(matcher.match("CaseService.readCase", "CaseService.readCase"));
        },

        //Check that matching only one of the non-wildcard names is not sufficient
        testMatchServiceAndMethodNameFalse: function () {
            assertFalse(matcher.match("CaseService.readCase", "NoteService.readCase"));
            assertFalse(matcher.match("CaseService.readCase", "CaseService.readNote"));
        },

        //Check that the empty string is valid as a name and matches the wildcard
        testMatchServiceAndMethodNameEmptyString: function () {
            assertTrue(matcher.match("", "*"));
            assertFalse(matcher.match("", "*.*"));
        },

        //Check that the dot is valid as a name and matches the wildcard as well as *.*
        testMatchServiceAndMethodNameDot: function () {
            assertTrue(matcher.match(".", "*"));
            assertTrue(matcher.match(".", "*.*"));
        },

        //Lots of tests to verify that certain patterns of partial matching do not
        //pass the matcher
        testMatchWithPartialMatches: function () {
            assertFalse(matcher.match("123Yes.Match", "Yes.Match"));
            assertFalse(matcher.match("Yes.Match123", "Yes.Match"));
            assertFalse(matcher.match("123Yes.Match123", "Yes.Match"));
            assertFalse(matcher.match("123Yes.Match", "Yes.*"));
            assertFalse(matcher.match("Yes.Match123", "*.Match"));

            assertFalse(matcher.match("No123.Match", "No.Match"));
            assertFalse(matcher.match("No.123Match", "No.Match"));
            assertFalse(matcher.match("No123.123Match", "No.Match"));
            assertFalse(matcher.match("No123.Match", "No.*"));
            assertFalse(matcher.match("No.123Match", "*.Match"));

            assertFalse(matcher.match("No.Match", "123No.Match"));
            assertFalse(matcher.match("No.Match", "No.Match123"));
            assertFalse(matcher.match("No.Match", "123No.Match123"));
            assertFalse(matcher.match("No.Match", "No123.Match"));
            assertFalse(matcher.match("No.Match", "No.123Match"));
            assertFalse(matcher.match("No.Match", "No123.123Match"));
            assertFalse(matcher.match("*.Match", "No.Match123"));
            assertFalse(matcher.match("*.Match", "No.123Match"));

            assertFalse(matcher.match("No.Ma123tch", "No.Match"));
            assertFalse(matcher.match("N123o.Match", "No.Match"));
            assertFalse(matcher.match("No.Match", "No.Ma123tch"));
            assertFalse(matcher.match("No.Match", "N123o.Match"));

            assertFalse(matcher.match("OADocumentService.service", "DocumentService.*"));
            assertFalse(matcher.match("oaDocumentService.service", "DocumentService.*"));

            assertFalse(matcher.match("No.*", "123No.Match"));
            assertFalse(matcher.match("No.*", "No123.Match"));
        },

        // test list using a pattern.
        testListWithPattern: function () {
            var plug = {
                pattern: "\\bClaimSetService\\.readClaimSet\\b|\\bClaimSetService\\.readClaimSetClaims\\b",
                type: "read",
                name: "ErrorRemoval",
                fn: function (data) {
                }
            };

            assertEquals(0, matcher.list("CaseService", "readCase", "read", [plug]).length);
            assertEquals(1, matcher.list("ClaimSetService", "readClaimSet", "read", [plug]).length);
            assertEquals(1, matcher.list("ClaimSetService", "readClaimSetClaims", "read", [plug]).length);
        },

        //Check various argument combinations with the list() function that should all result in an empty array
        //This means that none of the plugins in the passed array matched the requiremeents set by the other arguments
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        testListZeroMatches: function () {
            assertEquals(0, matcher.list("CaseService", "readCase", "mixin", plugins).length);
            assertEquals(0, matcher.list("CaseService", "readCase", "read", undefined).length);
            assertEquals(0, matcher.list("CaseService", "readCase", "read", []).length);
            assertEquals(0, matcher.list("CaseService", "readCase", "read", plugins_write).length);
        },

        //Sample arguments passed to list that result in exactly one of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        testListOneMatch: function () {
            assertEquals(1, matcher.list("CaseService", "readCase", "write", plugins).length);
            assertEquals(1, matcher.list("CaseService", "readCase", "write", plugins_write).length);
        },

        //Sample arguments passed to list that result in exactly two of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        testListTwoMatches: function () {
            assertEquals(2, matcher.list("CaseService", "readCase", "read", plugins).length);
            assertEquals(2, matcher.list("Specific", "readCase", "write", plugins_write).length);
            assertEquals(2, matcher.list("", "", "read", plugins).length);
        },

        //Sample arguments passed to list that result in all of the plugins being pushed on the new array
        //The "plugins" and "plugins_write" arrays can be viewed at the top of this file where they are instantiated
        testListAllMatches: function () {
            assertEquals(plugins_write.length, matcher.list("Specific", "Pointcut", "write", plugins_write).length);
        },

        //Given separate arrays of factoryPlugins, servicePlugins, and invocationPlugins, tests whether the
        //PluginMatcher.getPhaseChains() method correctly groups them into one object and in the proper order
        testSimpleGetPhaseChains: function () {
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

            assertEquals(3, phaseChains.read.length);
            assertEquals(0, phaseChains.write.length);
            assertEquals("fRead1", phaseChains.read[0].name);
            assertEquals("sRead1", phaseChains.read[1].name);
            assertEquals("iRead1", phaseChains.read[2].name);
        },

        // Test that the phase chains have the correct order based on when they
        // were added, what level they were defined for and what order they were passed.
        testPhaseChainOrder: function () {
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
                        assertEquals(idx + key, item.name);
                        // services are next
                    } else if (idx < 6) {
                        assertEquals((idx - 3) + "s" + key, item.name);
                        // invokes are last
                    } else if (idx < 9) {
                        assertEquals((idx - 6) + "i" + key, item.name);
                    }
                });
            });
        }
    });
});
