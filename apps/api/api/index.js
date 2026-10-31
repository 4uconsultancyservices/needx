const { bootstrapServer } = require('../dist/serverless');

module.exports = async (req, res) => {
  const app = await bootstrapServer();
  return app(req, res);
};
