import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import createHttpError from 'http-errors';
import { parsePhoneNumberWithError, isValidPhoneNumber, ParseError } from 'libphonenumber-js';

const { DEBUG } = process.env;
export default class VerifyValidator {

  static async initRequest(req) {
    const ajv = new Ajv({ allErrors: true });

    ajv.addFormat(
      'international-phone-number', (data) => {
        try {
          const phoneNumber = parsePhoneNumberWithError(data);
          if (DEBUG === 'true') console.info(`Phone Format Validation : ${isValidPhoneNumber(phoneNumber.number)}`);
          return isValidPhoneNumber(phoneNumber.number);
        }
        catch (error) {
          if (error instanceof ParseError) {
            // Not a phone number, non-existent country, etc.
            if (DEBUG === 'true') console.error(`Phone Format Error : ${data} ${error.message}`);
            return false;
          }
        }
        return false;
      },
    );

    addFormats(ajv, ['email']);

    const schema = {
      type: 'object',
      required: ['target'],
      properties: {
        target: {
          oneOf: [
            { type: 'string', format: 'international-phone-number' },
            { type: 'string', format: 'email' },
          ],
        },
        target_type: {
          type: 'string',
          enum: ['email', 'whatsapp'],
        },
        expires_in: {
          type: 'integer',
          minimum: 0,
          maximum: 604_800, // 7 days, in seconds
        },
        subject: {
          type: 'string',
          maxLength: 256,
        },
        content: {
          type: 'string',
          pattern: '\%code\%',
          maxLength: 1000,
        },
      },
    };

    if (!ajv.validate(schema, req.body)) {
      throw createHttpError(400, ajv.errorsText(ajv.errors, { separator: ', ' }));
    }
  }

  static async validateRequest(req) {

    const ajv = new Ajv({ allErrors: true });

    ajv.addFormat(
      'international-phone-number', (data) => {
        try {
          const phoneNumber = parsePhoneNumberWithError(data);
          console.log(phoneNumber.number);
          return isValidPhoneNumber(phoneNumber.number);
        }
        catch (error) {
          if (error instanceof ParseError) {
            // Not a phone number, non-existent country, etc.
            console.log(`Phone Format Error : ${data} ${error.message}`);
            return false;
          }
        }
        return false;
      },
    );

    addFormats(ajv, ['email']);

    const schema = {
      type: 'object',
      required: ['target', 'code'],
      properties: {
        target: {
          oneOf: [
            { type: 'string', format: 'international-phone-number' },
            { type: 'string', format: 'email' },
          ],
        },
        target_type: {
          type: 'string',
          enum: ['email', 'whatsapp'],
        },
        code: {
          oneOf: [
            { type: 'integer' },
            { type: 'string' },
          ],
        },
      },
    };

    if (!ajv.validate(schema, req.body)) {
      throw createHttpError(400, ajv.errorsText(ajv.errors, { separator: ', ' }));
    }
  }

}
