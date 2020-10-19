module.exports = {
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  APOLLO_HOST: process.env.APOLLO_HOST,
  APOLLO_PORT: process.env.APP_PORT,
  // -----------------------------------------------------
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  // БД авторизации
  DB_USER_AUTH: process.env.DB_USER_AUTH,
  DB_PSWD_AUTH: process.env.DB_PSWD_AUTH,
  DB_AUTH: process.env.DB_AUTH,
  // БД документооборот
  DB_USER_DOCS: process.env.DB_USER_DOCS,
  DB_PSWD_DOCS: process.env.DB_PSWD_DOCS,
  DB_DOCS: process.env.DB_DOCS,
  // -----------------------------------------------------
  SESSION_KEY: process.env.SESSION_KEY,
  JWT: process.env.JWT,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  // -----------------------------------------------------
  STATIC_DIR: process.env.STATIC_DIR,
  UPLOAD_STORAGE: process.env.UPLOAD_STORAGE,
  EXT_INC_FILE_STORAGE: process.env.EXT_INC_FILE_STORAGE,
  EXT_OUT_FILE_STORAGE: process.env.EXT_OUT_FILE_STORAGE,
  INT_INC_FILE_STORAGE: process.env.INT_INC_FILE_STORAGE,
  INT_OUT_FILE_STORAGE: process.env.INT_OUT_FILE_STORAGE,
  INTERNAL_FILE_STORAGE: process.env.INTERNAL_FILE_STORAGE,
  AVATAR_STORAGE: process.env.AVATAR_STORAGE
}
