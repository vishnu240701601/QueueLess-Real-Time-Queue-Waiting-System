// =====================================================================
// QueueLess – Standalone Local Development Server Runner
// (Used only for local testing: node server/src/local.js)
// =====================================================================

const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 QueueLess Backend API is running locally on: http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Services Endpoint: http://localhost:${PORT}/api/services\n`);
});
