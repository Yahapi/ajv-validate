# ajv-validate

A wrapper for [AJV](https://github.com/epoberezkin/ajv) designed to validate request bodies and query parameters.

# Install

```
$ npm install --save @yahapi/ajv-validate
```

# Usage

This library manages two AJV validation instances, one for validating a request body and one for validating query parameters. The difference between them are:

- The *body validator* returns [JSON pointers](https://tools.ietf.org/html/rfc6901) in error paths to indicate which property failed, e.g. `/name`. The *query validator* prefixes error paths with a question mark, e.g. `?name`.
- The *query validator* will attempt to convert properties to their expected types, the *body validator* does not.

## addBodySchema(schema, schemaName)

Registers a JSON schema to validate the message body.

```js
import { addBodySchema } from '@yahapi/ajv-validate';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 10 },
  },
};
addBodySchema(schema, 'testBody');

```

## validateBody(schemaName, body, throwError = true)

Validates a message body against specified schema. A schema is referenced by its name.

Throws a [ValidationErrors](https://github.com/yahapi/errors) with error by default. To not throw an error but return the validation errors instead set `throwError` to `false`.

```js
import { validateBody } from '@yahapi/ajv-validate';

const errors = validateBody('testBody', { name: 'test' }, false);
console.log(errors);
```

## addQuerySchema(schema, schemaName)

Registers a JSON schema to validate query parameters.

```js
import { addQuerySchema } from '@yahapi/ajv-validate';

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 0 },
  },
};
addQuerySchema(schema, 'testBody');
```

## validateQuery(schemaName, query, throwError = true)

Validates a querystring object against specified schema. A schema is referenced by its name.

Throws a [ValidationErrors](https://github.com/yahapi/errors) with error by default. To not throw an error but return the validation errors instead set `throwError` to `false`.

```js
import { validateQuery } from '@yahapi/ajv-validate';

const errors = validateQuery('testBody', { limit: -1 }, false);
console.log(errors);
```

## Formats

- **date-time**: the standard `date-time` format is replaced by a `moment(...).isValid()` check which accepts any IS0-8601 string.

## Keywords

### sortOptions

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

## Error format

`validateBody` and `validateQuery` return an array of errors formatted as follows:

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
