// This file acts as a bridge for Vercel to find the serverless function.
const app = require('../server/server.js');

// Export the app
module.exports = app;