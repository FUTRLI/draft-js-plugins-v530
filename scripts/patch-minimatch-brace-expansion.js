const fs = require('fs');

const minimatchPath = require.resolve('minimatch');
const legacyImport = "var expand = require('brace-expansion')";
const compatibleImport = [
  "var braceExpansion = require('brace-expansion')",
  'var expand = braceExpansion.expand || braceExpansion',
].join('\n');
const source = fs.readFileSync(minimatchPath, 'utf8');

if (source.includes(compatibleImport)) {
  process.exit(0);
}

if (!source.includes(legacyImport)) {
  throw new Error(`Unable to patch brace-expansion import in ${minimatchPath}`);
}

fs.writeFileSync(
  minimatchPath,
  source.replace(legacyImport, compatibleImport),
  'utf8'
);
