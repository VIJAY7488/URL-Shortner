import { addMinutes } from 'date-fns';
import logger from './logger';

export const calculateUrlExpiry = (expireAt: number): Date | undefined => {
  if (typeof expireAt !== 'number' || isNaN(expireAt) || expireAt <= 0) {
    logger.warn('Invalid expireAt input:', expireAt);
    return undefined;
  }

  const expirationDate = addMinutes(new Date(), expireAt);
  logger.info('Calculated Expiry Date:', expirationDate);

  return expirationDate;
};
