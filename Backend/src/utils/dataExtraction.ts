import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import logger from './logger';


interface ClickTrackingData {
  browser?: string;
  os?: string;
  deviceType?: string;
  ip?: string;
  country?: string;
  city?: string;
  referer?: string;
  userAgent?: string;
  isBot?: boolean;
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}


// Extract comprehensive data from request
export const extractClickData = (req: Request): ClickTrackingData => {
  const userAgent = req.get('User-Agent') || '';
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  // Enhanced IP extraction with validation
  const getClientIP = (req: Request): string => {
  const headersToCheck = [
    'CF-Connecting-IP',
    'X-Real-IP',
    'X-Forwarded-For',
    'X-Client-IP',
    'True-Client-IP'
  ];

  console.log('🟦 Full IP Header Dump:');
  logger.info('Full IP Header Dump:');
  headersToCheck.forEach(header => {
    console.log(`${header}:`, req.get(header));
  });

  console.log('req.ip:', req.ip);
  logger.info('req.ip:', req.ip)
  console.log('req.socket.remoteAddress:', req.socket?.remoteAddress);
  logger.info('req.socket.remoteAddress:', req.socket?.remoteAddress)

  for (const header of headersToCheck) {
    const value = req.get(header);
    if (value) {
      const ip = value.split(',')[0].trim().replace(/^::ffff:/, '');
      if (isValidIP(ip)) return ip;
    }
  }

  const socketIP = req.socket?.remoteAddress?.replace(/^::ffff:/, '') || '';
  return isValidIP(socketIP) ? socketIP : '';
  };


  // IP validation helper
  const isValidIP = (ip: string): boolean => {
    if (!ip) return false;
    
    // Skip local/private IPs
    const privateRanges = [
      /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./,
      /^::1$/, /^fc00:/
    ];
    
    if (privateRanges.some(range => range.test(ip))) {
      return false;
    }
    
    // Basic format validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  // Enhanced device type detection
  const getDeviceType = (result: any, userAgent: string): string => {
    if (result.device.type) {
      switch (result.device.type.toLowerCase()) {
        case 'mobile': return 'Mobile';
        case 'tablet': return 'Tablet';
        case 'smarttv': return 'TV';
        case 'wearable': return 'Wearable';
      }
    }
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    if (ua.includes('tv') || ua.includes('smart-tv')) {
      return 'TV';
    }
    
    return 'Desktop';
  };

  const ip = getClientIP(req);
  console.log('Extracted IP:', ip); // Debug log
  logger.info('Extracted IP:', ip);
  
  const geo = ip ? geoip.lookup(ip) : null;
  console.log('Geo data:', geo); // Debug log
  
  // Bot detection
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /facebook/i, /twitter/i, /linkedin/i,
    /googlebot/i, /bingbot/i, /slurp/i
  ];
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  // Extract UTM parameters
  const utmParams = {
    utm_source: req.query.utm_source as string,
    utm_medium: req.query.utm_medium as string,
    utm_campaign: req.query.utm_campaign as string,
    utm_term: req.query.utm_term as string,
    utm_content: req.query.utm_content as string,
  };

  const cleanUtmParams = Object.fromEntries(
    Object.entries(utmParams).filter(([_, value]) => value !== undefined)
  );

  const trackingData = {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    deviceType: getDeviceType(result, userAgent),
    ip: ip || undefined,
    country: geo?.country || undefined,
    city: geo?.city || undefined,
    referer: req.get('Referer') || req.get('Referrer') || undefined,
    userAgent,
    isBot,
    utmParams: Object.keys(cleanUtmParams).length > 0 ? cleanUtmParams : undefined
  };

  console.log('Final tracking data:', trackingData); // Debug log
  return trackingData;
};
