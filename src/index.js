import Ajv from 'ajv';
import _ from 'lodash';
import moment from 'moment';
import { ValidationErrors } from '@yahapi/errors';

const defaultOptions = {
  allErrors: true,
  jsonPointers: true,
  format: 'full',
  useDefaults: true,
  formats: {
    'date-time': (value) => moment(value, moment.ISO_8601, true).isValid(),
  },
};

/**
 * Validator class.
 */
export default class Validator {
  constructor(options = {}) {
    const opts = _.clone(options); // Make mutable clone
    this.pointerType = opts.pointerType || 'jsonPointer';

    if (opts.pointerType === 'queryPath') {
      opts.pointerType = 'object';
    }

    this.ajv = new Ajv(Object.assign({}, defaultOptions, options));
    this._initSortOptions();
  }

  validate(schemaName, data, throwError = true) {
    const errors = this._ajvValidate(schemaName, data, false);
    if (throwError && errors) throw new ValidationErrors(errors);
    return errors;
  }

  addSchema(...args) {
    this.ajv.addSchema(...args);
  }

  addKeyword(...args) {
    this.ajv.addKeyword(...args);
  }

  addFormat(...args) {
    this.ajv.addFormat(...args);
  }

  _ajvValidate(schemaName, data) {
    const valid = this.ajv.validate(schemaName, data);
    if (!valid) {
      return this._formatErrors(this.ajv.errors);
    }
    return null;
  }

  _formatErrors(errors) {
    return errors.map((error) => {
      let path = error.dataPath;
      if (this.pointerType === 'queryPath' && path.length > 0) {
        path = '?' + path.substr(1);
      }

      return {
        code: _.snakeCase(error.keyword),
        path,
        message: error.message,
      };
    });
  }

  /**
   * Sort options is designed to validate a `?sort=a,-b,+c` query parameter.
   */
  _initSortOptions() {
    this.ajv.addKeyword('sortOptions', {
      type: 'string',
      errors: true,
      metaSchema: {
        type: 'array',
        uniqueItems: true,
      },
      validate: function validation(sortOptions, data) {
        // Prefix `+` for each sort option that has no modifier specified
        const values = data.split(',').map((sort) => {
          if (!sort.startsWith('+') && !sort.startsWith('-')) {
            return `+${sort}`;
          }
          return sort;
        });

        // Check if all specified sort options are allowed
        for (const sort of values) {
          if (!sortOptions.includes(sort) && !sortOptions.includes(sort.substring(1))) {
            validation.errors = [{
              keyword: 'sort_options',
              message: 'Sort option is not supported',
            }];
            return false;
          }
        }

        // Check if there are any duplicate sorts that might conflict with each other
        const unique = _.uniqBy(values, (e) => e.substring(1));
        if (unique.length < values.length) {
          validation.errors = [{
            keyword: 'sort_options',
            message: 'Cannot specify sort option more than once',
          }];
          return false;
        }
        return true;
      },
    });
  }
};

/**
 * Validates an object against a JSON Schema.
 *
 * Validating a request body does not attempt to coerce types.
 */
export const bodyValidator =  new Validator();

/**
 * Validates a request query against a JSON Schema.
 *
 * Validating a request query attempts to coerce types. Modifies original data.
 */
export const queryValidator = new Validator({
  coerceTypes: true,
  pointerType: 'queryPath',
});
