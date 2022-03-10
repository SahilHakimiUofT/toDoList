const mongoose = require("mongoose");
const Items = require("./Items");

const listSchema = new mongoose.Schema({
  name: String,
  items: [Items.schema],
});

module.exports = mongoose.model("Lists", listSchema);
