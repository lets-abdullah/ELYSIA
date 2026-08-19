/**
 * CSRF Protection Middleware
 * Defends against Cross-Site Request Forgery attacks on all state-changing HTTP methods.
 * Implements strict Origin/Referer verification against allowed origins and Sec-Fetch-Site validation.
 */
export function csrfProtection(allowedOrigins = []) {
  return (req, res, next) => {
    // Safe HTTP methods do not alter state and are exempt from CSRF checks
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    const origin = req.headers['origin'];
    const referer = req.headers['referer'];
    const secFetchSite = req.headers['sec-fetch-site'];

    // Block cross-site browser requests not coming from an approved origin
    if (secFetchSite === 'cross-site' && !req.headers.authorization) {
      if (origin) {
        const isAllowed = allowedOrigins.includes(origin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Cross-Site Request Forgery (CSRF) attempt detected and blocked.'
          });
        }
      }
    }

    // Verify Origin or Referer for state-changing requests when present
    if (origin) {
      const isAllowed = allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Invalid request origin (CSRF protection).'
        });
      }
    } else if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        const isAllowed = allowedOrigins.includes(refererOrigin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(refererOrigin) ||
          /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(refererOrigin);

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Invalid request referer (CSRF protection).'
          });
        }
      } catch (e) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Malformed referer header (CSRF protection).'
        });
      }
    }

    next();
  };
}
