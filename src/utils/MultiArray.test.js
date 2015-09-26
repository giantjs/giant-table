(function () {
    "use strict";

    module("MultiArray");

    test("Instantiation", function () {
        throws(function () {
            $table.MultiArray.create('foo');
        }, "Invalid items");

        var arr = [
                [1, 2],
                [3],
                [4, 5]
            ],
            list = $table.MultiArray.create(arr);

        strictEqual(list.items, arr, "Item buffer added");
    });

    test("Type conversion", function () {
        var hash = $data.Hash.create([
                [1, 2],
                [3],
                [4, 5]
            ]),
            multiArray = hash.toMultiArray();

        ok(multiArray.isA($table.MultiArray), "Hash converted to prob. array");
    });

    test("Item length measurement", function () {
        var list = $table.MultiArray.create([
            [1, 2],
            [3],
            [4, 5]
        ]);

        deepEqual(list._getItemLengths(), [2, 1, 2], "Item lengths");
    });

    test("Selection", function () {
        var list = $table.MultiArray.create([
            [1, 2],
            [3],
            [4, 5]
        ]);

        deepEqual(list.selectCombination([1, 0, 0]), [2, 3, 4], "Selected combination");
    });

    test("Combination", function () {
        var list = $table.MultiArray.create([
            [1, 2],
            [3],
            [4, 5]
        ]);

        deepEqual(
            list.getCombinations(),
            [
                [1, 3, 4],
                [1, 3, 5],
                [2, 3, 4],
                [2, 3, 5]
            ],
            "All available combinations"
        );
    });
}());