module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URL:
    process.env.DB_URL || "postgresql://dunder-mifflin@localhost/bookmarks",
  TEST_DB_UR: process.env.TEST_DB_URL,
};
