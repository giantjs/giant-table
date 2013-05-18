/**
 * Collection of Indexes
 */
/*global dessert, troop, sntls, jorder */
troop.promise(jorder, 'IndexCollection', function () {
    "use strict";

    var base = sntls.Collection;

    /**
     * @class jorder.IndexCollection
     * @extends sntls.Collection
     * @extends jorder.Index
     */
    jorder.IndexCollection = sntls.Collection.of(jorder.Index)
        .addPrivateMethod(/** @lends jorder.IndexCollection */{
            /**
             * Determines whether all fields of the specified index
             * are present in the specified row.
             * @param {object} row Table row
             * @param {jorder.Index} index
             * @return {Boolean}
             * @private
             */
            _isIndexContainedByRow: function (row, index) {
                return index.rowSignature.containedByRow(row);
            },

            /**
             * Returns the field count for the specified index.
             * @param {jorder.Index} index
             * @return {Number}
             * @private
             */
            _indexFieldCountMapper: function (index) {
                return index.rowSignature.fieldNames.length;
            },

            /**
             * Array.sort() comparator for descending order.
             * @param {number} a
             * @param {number} b
             * @return {Number}
             * @private
             */
            _descNumericComparator: function (a, b) {
                return a < b ? 1 : a > b ? -1 : 0;
            }
        })
        .addMethod(/** @lends jorder.IndexCollection */{
            /**
             * @name jorder.IndexCollection.create
             * @return {jorder.IndexCollection}
             */

            /**
             * Sets an index in the collection.
             * Item key is calculated based index signature.
             * @param {jorder.Index} index
             * @return {jorder.IndexCollection}
             */
            setItem: function (index) {
                dessert.isIndex(index, "Invalid index");

                base.setItem.call(this, index.rowSignature.fieldSignature, index);

                return this;
            },

            /**
             * Retrieves a collection of indexes that fully match the specified row.
             * @param {object} row
             * @return {jorder.IndexCollection}
             */
            getIndexesForRow: function (row) {
                return /** @type {jorder.IndexCollection} */ this
                    .filterByExpr(this._isIndexContainedByRow.bind(this, row));
            },

            /**
             * Retrieves the first index matching the specified row.
             * @param {object} row
             * @return {jorder.Index}
             */
            getIndexForRow: function (row) {
                return this
                    // keeping indexes that match row
                    .getIndexesForRow(row)
                    // picking first we can find
                    .getValues()[0];
            },

            /**
             * Retrieves the index best matching the specified row
             * @param {object} row
             * @return {jorder.Index}
             */
            getBestIndexForRow: function (row) {
                return this
                    // keeping indexes that match row
                    .getIndexesForRow(row)
                    // getting number of matching fields for each
                    .mapContents(this._indexFieldCountMapper)
                    // flipping to field count -> index ID
                    .toStringDictionary()
                    .reverse()
                    // assigning indexes to field counts
                    .combineWith(this.toDictionary())
                    // picking index with highest field count
                    .toCollection()
                    .getSortedValues(this._descNumericComparator)[0];
            },

            /**
             * Retrieves an index matching the specified fields
             * @param {string[]} fieldNames
             * @param {string} [signatureType]
             * @return {jorder.Index}
             */
            getIndexForFields: function (fieldNames, signatureType) {
                var rowSignature = jorder.RowSignature.create(fieldNames, signatureType);
                return this.getItem(rowSignature.fieldSignature);
            }
        });
});