import moment from 'moment-timezone';



type ExpireAtInput =  {
    value: number,
}




export const calculateUrlExpiry = (expireAt: ExpireAtInput) => {
    if (!expireAt || typeof expireAt !== 'object') return undefined;

    const { value } = expireAt;

    if (typeof value !== 'number' || value <= 0) return undefined;


    const expirationDate = moment.tz('Asia/Kolkata').add(value, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    return expirationDate;
}