# ajv-validate

A small wrapper for [AJV](https://github.com/epoberezkin/ajv) designed to validate request bodies and query parameters.

# Install

```
$ npm install --save @yahapi/ajv-validate
```

# Example

```js
import { bodyValidator } from 'ajv-validate';

const schema = {
  id: 'bodySchema',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
    },
  },
};

bodyValidator.addSchema(schema);

const body = {
  name: 'a',
};
const throwError = false;

// {
//   path: '/name',
//   code: 'min_length',
//   message: 'should NOT be shorter than 2 characters',
// }
console.log(bodyValidator.validate('bodySchema', body, throwError));
```

# Description

This library manages two AJV validation instances, one for validating a request body and one for validating query parameters. The difference between them are:

                 | bodyValidator | queryValidator
-----------------|---------------|-----------------------
**coerceTypes**  | false         | true
**pointerType**  | jsonPointer   | queryPath

*Explanation options*

- **coerceTypes**: automatically attempt to convert properties to their expected types.
- **pointerType**: defines `path` format. Either `jsonPointer` as formatted by the [JSON Pointer spec](https://tools.ietf.org/html/rfc6901) or `queryPath` which prefixed error paths with a question mark, e.g. `?name`. Default is `jsonPointer`.

## addSchema()

Alias for [AJV](https://github.com/epoberezkin/ajv) `addSchema()`.

Registers a JSON schema to validate.

```js
import { queryValidator } from '@yahapi/ajv-validate';

const schema = {
  id: 'testBody',
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 0 },
  },
};
queryValidator.addSchema(schema);
```

## addKeyword()

Alias for [AJV](https://github.com/epoberezkin/ajv) `addKeyword()`.

## addFormat()

Alias for [AJV](https://github.com/epoberezkin/ajv) `addFormat()`.

## validate(schemaName, body, [throwError = true])

Validates a message body against specified schema. A schema is referenced by its id or keyword.

Throws a [ValidationErrors](https://github.com/yahapi/errors) by default. To simply return the validation errors set `throwError` to `false`.

```js
import { bodyValidator } from '@yahapi/ajv-validate';

const schema = {
  id: 'testBody',
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 0 },
  },
};
bodyValidator.addSchema(schema);

const errors = bodyValidator.validate('testBody', { name: 'test' }, false);
console.log(errors);
```

`validate()` returns an array of errors formatted as follows:

```js
{
  code: 'minimum',
  path: '?limit',
  message: 'should be >= 0',
}
```

Property | Description
---------|------------------------
code     | Error code formatted in snake_case.
path     | JSON pointer or query parameter name indicating which property validation failed.
message  | Human-readable error message.

# Additional formats

The following formats overwrite or are in addition to those specified in AJV:

- **date-time**: the standard `date-time` format is replaced by a `moment(...).isValid()` which accepts any IS0-8601 string.

# Keywords

The keywords listed in this section are in addition to those specified by AJV.

## sortOptions

When you specify sort order in an url like this `?sort=a,-b` you can use the schema keyword `sortOptions` to validate which sorts are allowed. Example:

```js
const schema = {
  type: 'object',
  properties: {
    sort: {
      type: 'string',
      sortOptions: ['a', '-b', '+c'],
    },
  },
};
addQuerySchema(schema, 'testQuery');
validateQuery('testQuery', { sort: '+a,-b,c' }); // This is valid
validateQuery('testQuery', { sort: '+b' }); // This is invalid
validateQuery('testQuery', { sort: '+a,-a' }); // This is invalid
```
