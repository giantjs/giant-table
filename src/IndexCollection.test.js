(function () {
    "use strict";

    module("Index Collection");

    test("Index containment", function () {
        expect(2);

        var myRow = {},
            index = $table.Index.create(['foo', 'bar']);

        $table.RowSignature.addMocks({
            containedByRow: function (row) {
                strictEqual(row, myRow, "Row passed");
                strictEqual(this, index.rowSignature, "Index matches");
            }
        });

        $table.IndexCollection._isIndexContainedByRow(myRow, index);

        $table.RowSignature.removeMocks();
    });

    test("Field count mapper", function () {
        var index = $table.Index.create(['foo', 'bar']);

        equal(
            $table.IndexCollection._indexFieldCountMapper(index),
            index.rowSignature.fieldNames.length,
            "Index signature field count"
        );
    });

    test("DESC Numeric comparator", function () {
        equal($table.IndexCollection._descNumericComparator(1, 2), 1, "First is lower");
        equal($table.IndexCollection._descNumericComparator(3, 2), -1, "First is higher");
        equal($table.IndexCollection._descNumericComparator(3, 3), 0, "Equal");
    });

    test("Index addition", function () {
        var index = $table.Index.create(['foo', 'bar']),
            indexCollection = $table.IndexCollection.create();

        indexCollection.setItem(index);

        deepEqual(
            indexCollection.items,
            {
                'foo|bar%string%ascending': index
            },
            "Index added to collection"
        );
    });

    test("Exact index lookup by field names", function () {
        var index1 = $table.Index.create(['foo', 'bar']),
            index2 = $table.Index.create(['field1', 'field2']),
            indexCollection = $table.IndexCollection.create();

        indexCollection
            .setItem(index1)
            .setItem(index2);

        equal(typeof indexCollection.getIndexForFields(['foo']), 'undefined', "No matching index");

        strictEqual(
            indexCollection.getIndexForFields(['foo', 'bar']),
            index1,
            "Index retrieved"
        );
    });

    test("Fetching indexes matching a row", function () {
        var indexCollection = $table.IndexCollection.create()
                .setItem($table.Index.create(['foo', 'bar']))
                .setItem($table.Index.create(['foo']))
                .setItem($table.Index.create(['foo', 'baz']))
                .setItem($table.Index.create(['foo', 'moo'])),
            result;

        // full match (ie. all index fields are present in row)
        result = indexCollection.getIndexesForRow({foo: 'hello', bar: 'world'});

        ok(result.isA($table.IndexCollection), "Return type IndexCollection");
        deepEqual(
            result.getKeys().sort(),
            ['foo%string%ascending', 'foo|bar%string%ascending'],
            "Only fully matching indexes returned"
        );
    });

    test("Fetching index for row", function () {
        var indexCollection = $table.IndexCollection.create()
                .setItem($table.Index.create(['foo', 'bar']))
                .setItem($table.Index.create(['foo']))
                .setItem($table.Index.create(['foo', 'baz']))
                .setItem($table.Index.create(['foo', 'moo'])),
            result;

        // could yield any of the first 3 indexes
        result = indexCollection.getIndexForRow({foo: 'hello', bar: 'world', baz: '!!!'});

        ok(result.isA($table.Index), "Return type Index");
        ok(
            result.rowSignature.fieldSignature === 'foo|bar%string' ||
            result.rowSignature.fieldSignature === 'foo%string' ||
            result.rowSignature.fieldSignature === 'foo|baz%string',
            "Result index signature"
        );
    });

    test("Fetching best index for row", function () {
        var indexCollection = $table.IndexCollection.create()
                .setItem($table.Index.create(['foo', 'bar']))
                .setItem($table.Index.create(['foo']))
                .setItem($table.Index.create(['foo', 'bar', 'baz'])),
            result;

        result = indexCollection.getBestIndexForRow({hello: 'world'});

        equal(typeof result, 'undefined', "No fitting index");

        // yields the one with the most matching fields
        result = indexCollection.getBestIndexForRow({foo: 'hello', bar: 'world', baz: '!!!'});

        ok(result.isA($table.Index), "Return type");
        equal(result.rowSignature.fieldSignature, 'foo|bar|baz%string', "Result index signature");

        result = indexCollection.getBestIndexForRow({foo: 'hello', bar: 'world'});
        equal(result.rowSignature.fieldSignature, 'foo|bar%string', "Result index signature");
    });

    test("Fetching best index for multiple fields", function () {
        expect(2);

        var indexCollection = $table.IndexCollection.create(),
            bestIndex = {};

        indexCollection.addMocks({
            getBestIndexForRow: function (row) {
                deepEqual(row, {foo: '0', 'bar': '1', baz: '2'}, "should pass dummy row to index-by-row getter");
                return bestIndex;
            }
        });

        strictEqual(
            indexCollection.getBestIndexForFields(['foo', 'bar', 'baz']),
            bestIndex,
            "should return index returned by by-row getter");
    });

    test("Row addition", function () {
        var index1 = $table.Index.create(['foo', 'bar']),
            index2 = $table.Index.create(['foo', 'moo']),
            indexCollection = $table.IndexCollection.create()
                .setItem(index1)
                .setItem(index2);

        indexCollection.addRow({foo: 'hello', bar: 'world', moo: 'cow'}, 0);

        deepEqual(
            index1.rowIdLookup.items,
            {
                'hello|world': 0
            },
            "First lookup index"
        );

        deepEqual(
            index2.rowIdLookup.items,
            {
                'hello|cow': 0
            },
            "Second lookup index"
        );
    });
}());
