import { checkSchema, validationResult } from 'express-validator'

const customSanitizers = {
  toLowerCase: (value) => value?.toString().toLocaleLowerCase(),
}

const customValidators = {
  isMongoId: (value) => validateCustomField(value),
}

/**
 * A factory for request-validation middleware stacks to be put before any
 * relevant route handler.
 *
 * @see https://express-validator.github.io/docs/schema-validation.html
 *
 * @param {Object} schema - an express-validator validation schema.
 * @param {Object} [options] - schema-tweaking options.
 * @param {String|String[]} [options.limitTo] - a convenience for limiting all
 * schema properties to a specific set of sources (e.g. `body`) instead of
 * having to manually specify the `in` property for all schema descriptors.
 * @param {Boolean} [options.withPagination] - a boolean value that determines
 * whether the ensureFields validator should also validate the request's pagination
 * parameters, such as `limit` and `page`.
 * @returns {Function[]} a stack of middleware functions.
 */
export default function ensureFields(schema, { withPagination, limitTo } = {}) {
  const paginationSchema = {
    page: {
      optional: true,
      isInt: true,
      toInt: true,
    },
    limit: {
      optional: true,
      isInt: true,
      toInt: true,
    },
  }

  schema = {
    ...adjustSchemaScopes(schema, limitTo, withPagination),
    ...(withPagination && { ...paginationSchema }),
  }

  return [checkSchema(schema), verifyValidationResult]
}

// Internal helpers
// ----------------

const validateCustomField = (value) => {
  // Check if it's a string of 12 bytes
  if (/^[a-fA-F0-9]{24}$/.test(value)) {
    return true
  }

  // Check if it's a string of 24 hex characters
  if (
    typeof value === 'string' &&
    value.length === 24 &&
    /^[a-fA-F0-9]+$/.test(value)
  ) {
    return true
  }

  // Check if it's an integer
  if (Number.isInteger(value)) {
    return true
  }

  return false
}

/**
 * Adjusts a given schema to ensure all its root-property descriptors limit
 * their scope to the provided one (if there *is* a provided scope in
 * `limitTo`).  This is useful when all root properties are expected in a single
 * source (e.g. request body), to avoid having to manually specify the `in`
 * option for all properties.
 *
 * @see https://express-validator.github.io/docs/schema-validation.html
 *
 * @param {Object} schema - The validation schema.
 * @param {String|String[]} [limitTo] - The source(s) to limit all root
 * properties to.
 * @return {Object} the origin schema (if no limitTo was provided) or a new
 * schema with adjusted property descriptors.
 */
function adjustSchemaScopes(schema, limitTo, withPagination) {
  if (!limitTo) {
    return schema
  }

  if (typeof limitTo === 'string') {
    limitTo = [limitTo]
  }

  const paginationFieldsScope = 'query'

  if (withPagination && !limitTo.includes(paginationFieldsScope)) {
    limitTo.push(paginationFieldsScope)
  }

  return Object.fromEntries(
    Object.entries(schema).map(([key, descriptor]) => {
      // Using custom validators
      if (descriptor.custom) {
        schema[key].custom.options =
          customValidators[schema[key].custom.options]
      }

      // Using custom sanitizers
      if (descriptor.customSanitizer) {
        schema[key].customSanitizer.options =
          customSanitizers[schema[key].customSanitizer.options]
      }
      return [key, { ...descriptor, in: limitTo }]
    })
  )
}

/**
 * A validation-checking middleware that is appended to the schema validation
 * itself, in order to react to invalid requests appropriately.
 *
 * @param {Request} req - the Express request object.
 * @param {Respone} res - the Express response object.
 * @param {Function} next - the middleware stack continuation callback.
 */
function verifyValidationResult(req, res, next) {
  const invalidFields = validationResult(req)

  if (invalidFields.isEmpty()) {
    return next()
  }

  return res.status(400).send({
    fields: invalidFields.array(),
    data: req.body,
    message: 'invalidFields',
    display: 'error.invalidFields',
    error: new Error('invalidFields'),
  })
}
