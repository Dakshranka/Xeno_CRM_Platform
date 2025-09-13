const mongoose = require('mongoose');

const DataRecordSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  attributes: Object,
  segments: [String],
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('DataRecord', DataRecordSchema);
