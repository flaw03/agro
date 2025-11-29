import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const TYPES_DIR = "src/openapi/types";
const OUTPUT_DIR = "src/common/dto";

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function yamlTypeToTS(propSchema, required = false) {
  // Handle $ref to other types
  if (propSchema.$ref) {
    const refMatch = propSchema.$ref.match(/\.\/(.+)\.yaml#\/(.+)/);
    if (refMatch) {
      return refMatch[2]; // Return the type name (e.g., "Address")
    }
  }

  const type = propSchema.type;
  const format = propSchema.format;

  switch (type) {
    case "string":
      if (format === "email") return "string";
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      if (propSchema.items) {
        const itemType = yamlTypeToTS(propSchema.items, true);
        return `Array<${itemType}>`;
      }
      return "Array<any>";
    case "object":
      return "Record<string, any>";
    default:
      return "any";
  }
}

function generateInterface(typeName, schema, imports = new Set()) {
  const properties = schema.properties || {};
  const requiredFields = schema.required || [];

  let interfaceCode = '';

  for (const [propName, propSchema] of Object.entries(properties)) {
    const isRequired = requiredFields.includes(propName);
    const optional = isRequired ? "" : "?";
    const tsType = yamlTypeToTS(propSchema, isRequired);

    // If the type is a reference to another type, add it to imports
    if (propSchema.$ref) {
      const refMatch = propSchema.$ref.match(/\.\/(.+)\.yaml#\/(.+)/);
      if (refMatch) {
        const [, fileName, refTypeName] = refMatch;
        imports.add({ fileName, typeName: refTypeName });
      }
    }

    interfaceCode += `  ${propName}${optional}: ${tsType};\n`;
  }

  return { interfaceCode, imports };
}

async function processFile(file) {
  const filePath = path.join(TYPES_DIR, file);
  const fileName = path.basename(file, '.yaml');

  // Read and parse YAML
  const yamlContent = await fs.promises.readFile(filePath, 'utf-8');
  const parsed = parse(yamlContent);

  // Get the type name (first key in the YAML)
  const typeName = Object.keys(parsed)[0];
  const schema = parsed[typeName];

  // Generate TypeScript interface
  const imports = new Set();
  const { interfaceCode, imports: detectedImports } = generateInterface(typeName, schema, imports);

  // Build the final TypeScript code with imports
  let tsCode = '';

  if (detectedImports.size > 0) {
    const importStatements = Array.from(detectedImports)
      .map(({ fileName: importFileName, typeName: importTypeName }) =>
        `import type { ${importTypeName} } from './${importFileName}';`
      )
      .join('\n');
    tsCode = `${importStatements}\n\n`;
  }

  tsCode += `export interface ${typeName} {\n${interfaceCode}}\n`;

  // Write to file
  const outputPath = path.join(OUTPUT_DIR, `${fileName}.ts`);
  await fs.promises.writeFile(outputPath, tsCode, 'utf-8');

  return { fileName, typeName };
}

async function generateTypes() {
  console.log("\n🚀 Generating TypeScript interfaces from OpenAPI types");

  ensureDir(OUTPUT_DIR);

  // Read all YAML files from types directory
  const files = fs.readdirSync(TYPES_DIR).filter(file => file.endsWith('.yaml'));

  if (files.length === 0) {
    console.log("⚠️  No YAML files found in", TYPES_DIR);
    return;
  }

  // Process all files in parallel using Promise.all
  const generatedFiles = await Promise.all(files.map(file => processFile(file)));

  console.log(`✨ Geanerated ${generatedFiles.length} TypeScript interface(s) !\n`);
}

generateTypes().catch((err) => {
  console.error("❌ Error during types generation:");
  console.error(err);
  process.exit(1);
});