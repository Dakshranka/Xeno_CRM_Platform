const mongoose = require('mongoose');

const DataSourceSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: String,
  recordCount: Number,
  lastSync: Date,
  config: Object
});

module.exports = mongoose.model('DataSource', DataSourceSchema);
