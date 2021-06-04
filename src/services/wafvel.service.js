import got from 'got';

export default class WafvelService {

  /**
   * Send the account verification email
   *
   * @param {String} to
   * @param {String} subject
   * @param {String} html
   */
  static async sendWhatsapp(phone, message) {
    const { WAFVEL_TOKEN, DEBUG } = process.env;
    const url = 'https://api.wafvel.com/api/whatsapp/async/send';

    const toStrip = ['+', '-', '(', ')', ' '];
    // eslint-disable-next-line prefer-const
    let formatedPhone = phone;
    // eslint-disable-next-line no-restricted-syntax
    for await (const x of toStrip) {
      formatedPhone = formatedPhone.replace(x, '');
    }

    const data = {
      token: WAFVEL_TOKEN,
      phone: formatedPhone,
      message,
    };

    if (DEBUG === 'true') console.info(phone);
    if (DEBUG === 'true') console.info(data);

    try {
      const { body } = await got.post(url, {
        json: data,
        responseType: 'json',
      });
      if (DEBUG === 'true') console.info(body);
      return body;
    }
    catch (error) {
      if (DEBUG === 'true') console.error(error);
      return error;
    }
  }

}