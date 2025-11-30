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

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function yamlTypeToTS(propSchema, propName = '', parentTypeName = '', enums = new Map()) {
  // Handle $ref to other types
  if (propSchema.$ref) {
    const refMatch = propSchema.$ref.match(/\.\/(.+)\.yaml#\/(.+)/);
    if (refMatch) {
      return refMatch[2]; // Return the type name (e.g., "Address")
    }
  }

  const type = propSchema.type;
  const format = propSchema.format;

  // Handle enums
  if (propSchema.enum && Array.isArray(propSchema.enum)) {
    const enumName = `${parentTypeName}${toPascalCase(propName)}`;
    enums.set(enumName, propSchema.enum);
    return enumName;
  }

  switch (type) {
    case "string":
      if (format === "email") return "string";
      if (format === "date-time") return "string";
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      if (propSchema.items) {
        const itemType = yamlTypeToTS(propSchema.items, propName, parentTypeName, enums);
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
  let extendsTypes = [];
  let properties = schema.properties || {};
  let requiredFields = schema.required || [];
  const enums = new Map();

  // Handle allOf (inheritance/composition)
  if (schema.allOf) {
    for (const item of schema.allOf) {
      if (item.$ref) {
        // This is an extends reference
        const refMatch = item.$ref.match(/\.\/(.+)\.yaml#\/(.+)/);
        if (refMatch) {
          const [, fileName, refTypeName] = refMatch;
          extendsTypes.push(refTypeName);
          imports.add({ fileName, typeName: refTypeName });
        }
      } else if (item.properties) {
        // Additional properties defined inline
        properties = { ...properties, ...item.properties };
        requiredFields = [...requiredFields, ...(item.required || [])];
      }
    }
  }

  let interfaceCode = '';

  for (const [propName, propSchema] of Object.entries(properties)) {
    const isRequired = requiredFields.includes(propName);
    const optional = isRequired ? "" : "?";
    const tsType = yamlTypeToTS(propSchema, propName, typeName, enums);

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

  return { interfaceCode, imports, extendsTypes, enums };
}

function generateEnum(enumName, enumValues) {
  let enumCode = `export enum ${enumName} {\n`;
  for (const value of enumValues) {
    enumCode += `  ${value} = '${value}',\n`;
  }
  enumCode += '}\n';
  return enumCode;
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

  let tsCode = '';

  // Check if this is a root-level enum definition
  if (schema.type === 'string' && schema.enum && Array.isArray(schema.enum)) {
    // Generate standalone enum
    tsCode = generateEnum(typeName, schema.enum);
  } else {
    // Generate TypeScript interface
    const imports = new Set();
    const { interfaceCode, imports: detectedImports, extendsTypes, enums } = generateInterface(typeName, schema, imports);

    if (detectedImports.size > 0) {
      const importStatements = Array.from(detectedImports)
        .map(({ fileName: importFileName, typeName: importTypeName }) =>
          `import type { ${importTypeName} } from './${importFileName}';`
        )
        .join('\n');
      tsCode = `${importStatements}\n\n`;
    }

    // Generate enums first
    if (enums.size > 0) {
      for (const [enumName, enumValues] of enums) {
        tsCode += generateEnum(enumName, enumValues);
        tsCode += '\n';
      }
    }

    // Build interface declaration with extends if applicable
    const extendsClause = extendsTypes.length > 0 ? ` extends ${extendsTypes.join(', ')}` : '';

    if (interfaceCode.trim()) {
      tsCode += `export interface ${typeName}${extendsClause} {\n${interfaceCode}}\n`;
    } else {
      // If there are no additional properties, just extend
      tsCode += `export interface ${typeName}${extendsClause} {}\n`;
    }
  }

  // Write to file
  const outputPath = path.join(OUTPUT_DIR, `${fileName}.ts`);
  await fs.promises.writeFile(outputPath, tsCode, 'utf-8');

  return { fileName, typeName };
}

async function generateTypes() {
  console.log("\n🚀 Generating TypeScript interfaces from OpenAPI types");

  // Clean output directory before generation
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log("🧹 Cleaning output directory...");
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

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