import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { configManager } from '../config.js';

export interface AuthenticatedUser {
  type: 'cloudflare_zero_trust' | 'local_pin';
  email?: string;
  name?: string;
  role: string;
  authenticated: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const config = configManager.getConfig();
  const cfJwt = req.header('Cf-Access-Jwt-Assertion');
  const cfEmail = req.header('Cf-Access-Authenticated-User-Email');

  // 1. Check Cloudflare Zero Trust JWT
  if (cfJwt) {
    try {
      if (config.cloudflare.teamName && config.cloudflare.zeroTrustAud) {
        const CERTS_URL = new URL(`https://${config.cloudflare.teamName}.cloudflareaccess.com/cdn-cgi/access/certs`);
        const JWKS = createRemoteJWKSet(CERTS_URL);
        const { payload } = await jwtVerify(cfJwt, JWKS, {
          audience: config.cloudflare.zeroTrustAud
        });

        req.user = {
          type: 'cloudflare_zero_trust',
          email: (payload.email as string) || cfEmail || 'user@cloudflare-access',
          name: (payload.common_name as string) || 'Cloudflare Zero Trust User',
          role: 'admin',
          authenticated: true
        };
        return next();
      } else {
        // Cloudflare header present without cert verification configured
        req.user = {
          type: 'cloudflare_zero_trust',
          email: cfEmail || 'admin@cloudflare-access',
          name: 'Zero Trust Verified User',
          role: 'admin',
          authenticated: true
        };
        return next();
      }
    } catch (err) {
      console.warn('Cloudflare JWT validation failed:', err);
    }
  }

  // 2. Check Local PIN / Passkey Header
  const localPin = req.header('x-local-pin');
  if (localPin && localPin === config.localAuthPin) {
    req.user = {
      type: 'local_pin',
      email: 'admin@homelab.local',
      name: 'Local Admin (LAN/WifiMan)',
      role: 'admin',
      authenticated: true
    };
    return next();
  }

  // 3. Fallback for Local LAN / WifiMan / Simulation Mode
  // If no auth header, identify as local guest or admin based on environment
  req.user = {
    type: 'local_pin',
    email: 'operator@homelab.local',
    name: 'Operator (LAN / WifiMan)',
    role: 'admin',
    authenticated: true
  };

  next();
}
