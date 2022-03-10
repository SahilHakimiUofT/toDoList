//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Items = require("./Items");
const Lists = require("./Lists");
const { resolveInclude } = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:Test123@cluster0.0e4qu.mongodb.net/todolistDB");
const defaultItems = [{ name: "soap" }, { name: "loofa" }, { name: "toothbrush" }];

function addDefaultItems() {
  const arr = [{ name: "soap" }, { name: "loofa" }, { name: "toothbrush" }];
  return Items.insertMany(arr);
}

function addNewItem(itemName) {
  const item = { name: itemName };
  return Items.create(item);
}

async function deleteItem(itemId, listName) {
  try {
    if (listName == "Today") {
      await Items.deleteOne({ _id: itemId });
    } else {
      await Lists.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemId } } });
    }
  } catch (err) {
    console.log(err.message);
  }
  // return new Promise((resolve) => {
  //   resolve("resolved");
  // });
}

// addDefaultItems();

app.get("/", async (req, res) => {
  try {
    const items = await Items.find();
    if (items.length == 0) {
      await addDefaultItems();
      res.redirect("/");
    } else {
      //console.log(items);
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  if (listName == "Today") {
    await addNewItem(itemName);
    res.redirect("/");
  } else {
    console.log(listName);
    const foundList = await Lists.findOne({ name: listName });
    console.log(foundList);
    foundList.items.push({ name: itemName });
    await foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  await deleteItem(checkedItem, listName);
  res.redirect("/" + listName);
});

app.get("/:listName", async (req, res) => {
  try {
    const listName = req.params.listName;
    const listCheck = await Lists.findOne({ name: listName });
    if (listCheck == null) {
      const list = new Lists({
        name: listName,
        items: defaultItems,
      });
      await list.save();
      res.redirect("/" + listName);
    } else {
      res.render("list", {
        listTitle: listCheck.name,
        newListItems: listCheck.items,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
