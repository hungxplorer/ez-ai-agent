// Register module aliases for production mode
const moduleAlias = require("module-alias");

// Register aliases
moduleAlias.addAliases({
  "~": __dirname,
});
