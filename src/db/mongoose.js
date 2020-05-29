const mongoose = require(`mongoose`);
const validator = require(`validator`);

const DbUrl = process.env.DB_URL;

mongoose.connect(DbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify:false
});

