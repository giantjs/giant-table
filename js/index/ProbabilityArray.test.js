/*global module, test, raises, equal, strictEqual, deepEqual */
/*global jorder */
(function () {
    "use strict";

    module("ProbabilityArray");

    test("Instantiation", function () {
        raises(function () {
            jorder.ProbabilityArray.create('foo');
        }, "Invalid items");

        var arr = [
                [1, 2],
                [3],
                [4, 5]
            ],
            list = jorder.ProbabilityArray.create(arr);

        strictEqual(list.items, arr, "Item buffer added");
    });

    test("Item length measurement", function () {
        var list = jorder.ProbabilityArray.create([
            [1, 2],
            [3],
            [4, 5]
        ]);

        deepEqual(list._getItemLengths(), [2, 1, 2], "Item lengths");
    });

    test("Selection", function () {
        var list = jorder.ProbabilityArray.create([
            [1, 2],
            [3],
            [4, 5]
        ]);

        deepEqual(list.selectCombination([1, 0, 0]), [2, 3, 4], "Selected combination");
    });

    test("Combination", function () {
        var list = jorder.ProbabilityArray.create([
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