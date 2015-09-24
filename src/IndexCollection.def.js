/*global giant */
$oop.postpone(giant, 'IndexCollection', function () {
    "use strict";

    var base = giant.Collection;

    /**
     * Instantiates class.
     * @name giant.IndexCollection.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {giant.IndexCollection}
     */

    /**
     * Collection of indexes. Selects index(es) contained by the collection that fit data row(s).
     * @class giant.IndexCollection
     * @extends giant.Collection
     * @extends giant.Index
     */
    giant.IndexCollection = giant.Collection.of(giant.Index).extend()
        .addPrivateMethods(/** @lends giant.IndexCollection */{
            /**
             * Determines whether all fields of the specified index
             * are present in the specified row.
             * @param {object} row Table row
             * @param {giant.Index} index
             * @returns {Boolean}
             * @private
             */
            _isIndexContainedByRow: function (row, index) {
                return index.rowSignature.containedByRow(row);
            },

            /**
             * Returns the field count for the specified index.
             * @param {giant.Index} index
             * @returns {Number}
             * @private
             */
            _indexFieldCountMapper: function (index) {
                return index.rowSignature.fieldNames.length;
            },

            /**
             * Array.sort() comparator for descending order.
             * @param {number} a
             * @param {number} b
             * @returns {Number}
             * @private
             */
            _descNumericComparator: function (a, b) {
                return a < b ? 1 : a > b ? -1 : 0;
            },

            /**
             * @param {giant.Index} index
             * @private
             */
            _getIndexSignature: function (index) {
                return index.rowSignature.fieldSignature + '%' + index.sortedKeys.orderType;
            },

            /**
             * @param {giant.RowSignature} rowSignature
             * @param {string} orderType
             * @returns {string}
             * @private
             */
            _getIndexSignatureFromRowSignature: function (rowSignature, orderType) {
                return rowSignature.fieldSignature + '%' + (orderType || giant.OrderedList.orderTypes.ascending);
            }
        })
        .addMethods(/** @lends giant.IndexCollection# */{
            /**
             * Sets an index in the collection.
             * Item key is calculated based index signature.
             * @param {giant.Index} index
             * @returns {giant.IndexCollection}
             */
            setItem: function (index) {
                $assertion.isIndex(index, "Invalid index");

                base.setItem.call(this, this._getIndexSignature(index), index);

                return this;
            },

            /**
             * Retrieves a collection of indexes that fully match the specified row.
             * @param {object} row
             * @returns {giant.IndexCollection}
             */
            getIndexesForRow: function (row) {
                return /** @type {giant.IndexCollection} */ this
                    .filterBySelector(this._isIndexContainedByRow.bind(this, row));
            },

            /**
             * Retrieves the first index matching the specified row.
             * @param {object} row
             * @returns {giant.Index}
             */
            getIndexForRow: function (row) {
                return this
                    // keeping indexes that match row
                    .getIndexesForRow(row)
                    // picking first we can find
                    .getFirstValue();
            },

            /**
             * Retrieves the index best matching the specified row
             * @param {object} row
             * @returns {giant.Index}
             */
            getBestIndexForRow: function (row) {
                return this
                    // keeping indexes that match row
                    .getIndexesForRow(row)
                    // assigning number of matching fields to each value
                    .mapKeys(this._indexFieldCountMapper)
                    // picking index with highest field count
                    .getSortedValues(this._descNumericComparator)[0];
            },

            /**
             * Retrieves the index best matching the specified field names.
             * @param {string[]} fieldNames
             * @returns {giant.Index}
             */
            getBestIndexForFields: function (fieldNames) {
                var rowExpr = fieldNames.toStringDictionary().reverse();
                return this.getBestIndexForRow(rowExpr.items);
            },

            /**
             * Retrieves an index matching the specified fields
             * @param {string[]} fieldNames
             * @param {string} [signatureType]
             * @param {string} [orderType]
             * @returns {giant.Index}
             */
            getIndexForFields: function (fieldNames, signatureType, orderType) {
                var rowSignature = giant.RowSignature.create(fieldNames, signatureType);
                return this.getItem(this._getIndexSignatureFromRowSignature(rowSignature, orderType));
            }
        });
});
