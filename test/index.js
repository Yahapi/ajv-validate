import { addQuerySchema, validateQuery } from '../src';
import { expect } from 'chai';

const schema = {
  type: 'object',
  properties: {
    sort: {
      type: 'string',
      sortOptions: ['a', '-b', '+c'],
    },
  },
};

addQuerySchema(schema, 'querySchema');

describe('Keyword "sortOptions"', () => {
  it('should succeed if all sortOptions are valid', () => {
    const query = {
      sort: '+a,-b,c',
    };
    const errors = validateQuery('querySchema', query, false);
    expect(errors).to.equal(null);
  });

  it('should fail if sort option does not exist', () => {
    const query = {
      sort: 'd',
    };
    const errors = validateQuery('querySchema', query, false);
    expect(errors.length).to.equal(1);
    expect(errors[0].code).to.equal('sort_options');
    expect(errors[0].path).to.equal('?sort');
    expect(errors[0].message).to.equal('Sort option is not supported');
  });

  it('should fail if sort option exists but with different modifier', () => {
    const query = {
      sort: '+b',
    };
    const errors = validateQuery('querySchema', query, false);
    expect(errors.length).to.equal(1);
    expect(errors[0].code).to.equal('sort_options');
    expect(errors[0].path).to.equal('?sort');
    expect(errors[0].message).to.equal('Sort option is not supported');
  });

  it('should fail if there are duplicate sort values', () => {
    const query = {
      sort: '+a,-a',
    };
    const errors = validateQuery('querySchema', query, false);
    expect(errors.length).to.equal(1);
    expect(errors[0].code).to.equal('sort_options');
    expect(errors[0].message).to.equal('Cannot specify sort option more than once');
  });
});
