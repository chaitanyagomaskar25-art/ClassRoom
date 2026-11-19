import HttpError from './httpError.js';

function validate(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten()));
    }
    req[target] = result.data;
    next();
  };
}

export default validate;
