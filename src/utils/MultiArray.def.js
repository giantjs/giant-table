/*global giant */
$oop.postpone(giant, 'MultiArray', function () {
    "use strict";

    var base = $data.Hash;

    /**
     * Instantiates class.
     * @name giant.MultiArray.create
     * @function
     * @param {Array[]} items Array of arrays
     * @returns {giant.MultiArray}
     */

    /**
     * An array that for each of its items holds an even distribution
     * of possible values (represented as arrays).
     * @class giant.MultiArray
     * @extends $data.Hash
     * @example
     * [[1, 2], [3], [4, 5]]
     */
    giant.MultiArray = base.extend()
        .addPrivateMethods(/** @lends giant.MultiArray */{
            /**
             * Measures the number of possibilities for each item
             * and returns the counts in an array
             * @returns {Array}
             * @private
             */
            _getItemLengths: function () {
                var items = this.items,
                    result = [],
                    i;

                for (i = 0; i < items.length; i++) {
                    result.push(items[i].length);
                }

                return result;
            }
        })
        .addMethods(/** @lends giant.MultiArray# */{
            /**
             * @param {Array[]} items Array of arrays
             * @ignore
             */
            init: function (items) {
                $assertion.isArray(items, "Invalid items");

                base.init.apply(this, arguments);
            },

            /**
             * Fetches one specific combination according to the specified indices.
             * @param {number[]} indices Pin-point values for each item to fetch.
             */
            selectCombination: function (indices) {
                $assertion
                    .isArray(indices, "Invalid indices")
                    .assert(this.items.length === indices.length, "Indices length doesn't match list length");

                var items = this.items,
                    result = [],
                    i;

                for (i = 0; i < items.length; i++) {
                    result.push(items[i][indices[i]]);
                }

                return result;
            },

            /**
             * Retrieves all possible combinations for the array
             * @returns {Array[]} Array of all possible outcomes
             */
            getCombinations: function () {
                var result = [],
                    itemLengths = this._getItemLengths(),
                    itemPosition;

                for (itemPosition = giant.IrregularNumber.create(itemLengths);
                     itemPosition.asScalar <= itemPosition.maxValue;
                     itemPosition.inc()
                    ) {
                    result.push(this.selectCombination(itemPosition.asDigits));
                }

                return result;
            },

            /**
             * Retrieves all combinations wrapped in a hash object
             * @returns {$data.Hash}
             */
            getCombinationsAsHash: function () {
                return $data.Hash.create(this.getCombinations());
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash */{
        /**
         * @returns {giant.MultiArray}
         */
        toMultiArray: function () {
            return giant.MultiArray.create(this.items);
        }
    });
});
