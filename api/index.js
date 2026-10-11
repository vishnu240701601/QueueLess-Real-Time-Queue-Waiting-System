// =====================================================================
// QueueLess – Vercel Serverless Entry Point
// Bridges incoming serverless HTTP invocations to Express application
// =====================================================================

const app = require('../server/src/app');

module.exports = app;
