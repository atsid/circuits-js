define([],
    function() {
        return {

            /**
             * Asserts that two arrays are equal deeply
             * @param {Array} arr The first array to compare
             * @param {Array} arr2 The second array to compare
             */
            arrayEquals: function(arr, arr2) {
                assert.equal(arr.length, arr2.length, "Array lengths differ");
                arr.forEach(function (item, i) {
                    assert.equal(item, arr2[i]);
                });
            },

            /**
             * Asserts that when the given function is run, it throws an exception with a message containing the given message
             * @param {String} message The expected message
             * @param {Function} exFunc The function that should thrown an exception
             */
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
             * @param {Object} e The object to clone
             */
            clone: function(e) {
                return JSON.parse(JSON.stringify(e));
            }
        }
    });