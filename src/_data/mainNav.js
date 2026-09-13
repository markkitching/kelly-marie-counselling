const fs = require("fs");
const path = require("path");

const menuItems = require("./menuItems.js");

// The editor's menu (content.json → menu) says which items appear and in what order.
// Labels and destinations come from menuItems.js, so the CMS can't change them.
// Rows naming an item that no longer exists are skipped rather than breaking the build.
module.exports = () => {
  const content = JSON.parse(
    fs.readFileSync(path.join(__dirname, "content.json"), "utf8")
  );
  const items = menuItems();

  return (content.menu || [])
    .filter((row) => row.visible !== false && items[row.item])
    .map((row) => ({ ...items[row.item], id: row.item }));
};
