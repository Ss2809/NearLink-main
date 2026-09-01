let app;
let initError = null;

try {
  app = require("../server/server.js");
} catch (error) {
  console.error("Critical error loading server.js:", error);
  initError = error;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      message: "Server failed to initialize on Vercel",
      error: initError.message,
      stack: initError.stack,
    });
  }
  return app(req, res);
};
