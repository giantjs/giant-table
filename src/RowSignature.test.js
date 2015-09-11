/*global giant */
(function () {
    "use strict";

    module("RowSignature");

    test("Validating constants", function () {
        notEqual(
            giant.RowSignature.FIELD_SEPARATOR_STRING,
            encodeURI(giant.RowSignature.FIELD_SEPARATOR_STRING),
            "Field separator can be URI encoded"
        );

        notEqual(
            giant.RowSignature.SIGNATURE_TYPE_SEPARATOR,
            encodeURI(giant.RowSignature.SIGNATURE_TYPE_SEPARATOR),
            "Type separator can be URI encoded"
        );
    });

    test("URI encoding array", function () {
        var arr = ["§1.", "`foo`", "foo bar", 5];

        deepEqual(
            giant.RowSignature._arrayUriEncoder(arr).sort(),
            ["%C2%A71.", "%60foo%60", "foo%20bar", "5"].sort(),
            "Array URI-encoded"
        );
    });

    test("Instantiation exceptions", function () {
        raises(function () {
            giant.RowSignature.create('fields not array');
        }, "Invalid fields array");

        raises(function () {
            giant.RowSignature.create([]);
        }, "Empty fields array");

        raises(function () {
            giant.RowSignature.create(['a', 'b'], 'foo');
        }, "Invalid signature type");

        raises(function () {
            giant.RowSignature.create(['a', 'b'], 'foo', 'bar');
        }, "Invalid case flag");
    });

    test("Instantiation", function () {
        var signature = giant.RowSignature.create(['a', 'b']);

        equal(signature.signatureType, 'string', "Default signature type");
        deepEqual(signature.fieldNames, ['a', 'b'], "Signature fields");
        deepEqual(signature.fieldNameLookup, {a: '1', b: '1'}, "Signature field lookup");
        equal(signature.fieldSignature, 'a|b%string', "Static field signature");
        equal(signature.isCaseInsensitive, false, "Case sensitive by default");
    });

    test("Row validation", function () {
        var signature = giant.RowSignature.create(['foo', 'bar']);

        equal(signature.containsRow({invalid: 'hello'}), false, "No match");
        equal(signature.containsRow({foo: 'hello', invalid: 'hello'}), false, "Mixed fields");
        equal(signature.containsRow({foo: 'hello'}), true, "Subset of fields");

        equal(signature.containedByRow({foo: 'hello'}), false, "Insufficient fields in row");
        equal(signature.containedByRow({foo: 'hello', bar: 'world'}), true, "Exact match");
        equal(signature.containedByRow({foo: 'hello', bar: 'world', extra: 'field'}), true, "Superset match");
    });

    test("Key extraction", function () {
        var signature;

        signature = giant.RowSignature.create(['foo'], 'number');
        equal(typeof signature.getKeyForRow({bar: 4}), 'undefined',
            "should return undefined for non-matching row expression on single-field signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'number');
        equal(typeof signature.getKeyForRow({}), 'undefined',
            "should return undefined for non-matching row expression on multi-field signature");

        signature = giant.RowSignature.create(['foo'], 'number');
        equal(signature.getKeyForRow({foo: 4}), 4,
            "should return field value on single-field numeric signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'number');
        equal(signature.getKeyForRow({foo: 4, bar: 3, etc: 5}), 4 * signature.FIELD_SEPARATOR_NUMBER + 3,
            "should return combined field values on multi-field numeric signature");

        signature = giant.RowSignature.create(['foo'], 'string');
        equal(signature.getKeyForRow({foo: "A", bar: "B", etc: "C"}), "A",
            "should return field value on single-field string signature");

        signature = giant.RowSignature.create(['foo'], 'string', true);
        equal(signature.getKeyForRow({foo: "A", bar: "B", etc: "C"}), "a",
            "should return lowercase field value on single-field cae insensitive string signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'string');
        equal(signature.getKeyForRow({foo: "A|", bar: "B", etc: "C"}), 'A%7C|B',
            "should URI encode and return combined field values for string signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'string', true);
        equal(signature.getKeyForRow({foo: "A|", bar: "B", etc: "C"}), 'a%7C|b',
            "should URI encode and return lowercase combined field values for case-insensitive string signature");

        signature = giant.RowSignature.create(['foo'], 'fullText');
        raises(function () {
            signature.getKeyForRow({foo: 'hello world'});
        }, "should raise exception on signature types other than number or string");
    });

    test("Multi-key extraction", function () {
        var row,
            signature;

        signature = giant.RowSignature.create(['foo'], 'number');
        deepEqual(
            signature.getKeysForRow({bar: 3, hello: 'world'}),
            [],
            "should return empty array on non-matching row expression");

        signature = giant.RowSignature.create(['foo'], 'number');
        deepEqual(
            signature.getKeysForRow({foo: 4, bar: 3, hello: 'world'}),
            [4],
            "should return singular array with extracted key on single-field numeric signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'string');
        deepEqual(
            signature.getKeysForRow({foo: 4, bar: 3, hello: 'world'}),
            ['4|3'],
            "should return singular array with extracted key on multi-field string signature");

        signature = giant.RowSignature.create(['foo'], 'array');
        deepEqual(
            signature.getKeysForRow({foo: ['Hello|', 'World'], bar: 'Etc'}),
            ['Hello%7C', 'World'],
            "should return array with extracted keys on single-field array signature");

        signature = giant.RowSignature.create(['foo'], 'array', true);
        deepEqual(
            signature.getKeysForRow({foo: ['Hello|', 'World'], bar: 'Etc'}),
            ['hello%7C', 'world'],
            "should return array with extracted lowercase keys on single-field case-insensitive array signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'array');
        row = {foo: ['Hello|', 'World'], bar: ['One', 'Two'], etc: 'Etc'};
        deepEqual(
            signature.getKeysForRow(row),
            ['Hello%7C|One', 'Hello%7C|Two', 'World|One', 'World|Two'],
            "should return array with extracted keys on multi-field array signature");
        deepEqual(row, {foo: ['Hello|', 'World'], bar: ['One', 'Two'], etc: 'Etc'},
            "should not alter original row expression on multi-field array signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'array', true);
        row = {foo: ['Hello|', 'World'], bar: ['One', 'Two'], etc: 'Etc'};
        deepEqual(
            signature.getKeysForRow(row),
            ['hello%7C|one', 'hello%7C|two', 'world|one', 'world|two'],
            "should return array with extracted lowercase keys on multi-field case-insensitive array signature");
        deepEqual(row, {foo: ['Hello|', 'World'], bar: ['One', 'Two'], etc: 'Etc'},
            "should not alter original row expression on multi-field case-insensitive array signature");

        signature = giant.RowSignature.create(['foo'], 'fullText');
        deepEqual(
            signature.getKeysForRow({foo: 'Hello| World', bar: 'Etc'}),
            ['Hello%7C', 'World'],
            "should return array with extracted keys on single-field full text signature");

        signature = giant.RowSignature.create(['foo'], 'fullText', true);
        deepEqual(
            signature.getKeysForRow({foo: 'Hello| World', bar: 'Etc'}),
            ['hello%7C', 'world'],
            "should return array with extracted lowercase keys on single-field case-insensitive full text signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'fullText');
        row = {foo: "Hello| World", bar: "Howdy All", etc: 5};
        deepEqual(
            signature.getKeysForRow(row),
            ['Hello%7C|Howdy', 'Hello%7C|All', 'World|Howdy', 'World|All'],
            "should return array with extracted keys on multi-field full text signature");
        deepEqual(row, {foo: "Hello| World", bar: "Howdy All", etc: 5},
            "should not alter original row expression on multi-field full text signature");

        signature = giant.RowSignature.create(['foo', 'bar'], 'fullText', true);
        row = {foo: "Hello| World", bar: "Howdy All", etc: 5};
        deepEqual(
            signature.getKeysForRow(row),
            ['hello%7C|howdy', 'hello%7C|all', 'world|howdy', 'world|all'],
            "should return array with extracted lowercase keys on multi-field case-insensitive full text signature");
        deepEqual(row, {foo: "Hello| World", bar: "Howdy All", etc: 5},
            "should not alter original row expression on multi-field case-insensitive full text signature");
    });
}());
