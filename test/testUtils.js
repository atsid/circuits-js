define([],
    function() {
        return {
            /**
             * Asserts that two arrays are equal deeply
             */
            arrayEquals: function(arr, arr2) {
                assert.equal(arr.length, arr2.length, "Array lengths differ");
                arr.forEach(function (item, i) {
                    assert.equal(item, arr2[i]);
                });
            },
            assertException: function(message, exFunc) {
                try {
                    exFunc();
                    assert.fail("Exception \"" + message + "\" not thrown!");
                } catch(e) {
                    assert.equal(e.message, message);
                }
            },

            /**
             * Provides a very basic clone method
             *
             */
            clone: function(e) {
                return JSON.parse(JSON.stringify(e));
            }
        }
    });