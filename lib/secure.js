import crypto from 'crypto';

export const secret = 'blackmore';

export const encrypt = value => crypto.createHmac('sha512', secret)
  .update(value)
  .digest('hex');
