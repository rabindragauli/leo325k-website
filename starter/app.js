// cPanel "Setup Node.js App" startup file.
// Passenger (used by cPanel/CloudLinux) loads this file and handles the port itself.
// It starts the Next.js standalone server produced by `npm run build` (output: 'standalone').
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
require('./.next/standalone/server.js');
