import { expect } from 'chai';
import { bodyValidator } from '../src';

const schema = {
  id: 'bodySchema',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 5,
    },
  },
};

bodyValidator.addSchema(schema);

describe('bodyValidator', () => {
  it('should fail if body is invalid', () => {
    const body = {
      name: '1',
    };
    const errors = bodyValidator.validate('bodySchema', body, false);
    expect(errors.length).to.equal(1);
    expect(errors[0].code).to.equal('min_length');
    expect(errors[0].path).to.equal('/name');
    expect(errors[0].message).to.equal('should NOT be shorter than 2 characters');
  });
});
