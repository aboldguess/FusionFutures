#!/usr/bin/env node
/**
 * ============================================================================
 * File: scripts/generate-types.mjs
 * Purpose: Fetch FastAPI OpenAPI schema and generate TypeScript definitions for the monorepo.
 * Structure: Uses openapi-typescript to convert the schema, writes output into packages/types.
 * Usage: Invoked via `node scripts/generate-types.mjs`, `npm run types`, or automatically during
 *        `scripts/fusionfutures_setup.py` execution.
 * ============================================================================
 */
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { fileURLToPath } from "node:url";
import openapiTS from "openapi-typescript";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const schemaUrl = process.env.OPENAPI_SCHEMA_URL ?? "http://localhost:8000/api/openapi.json";
const outputPath = resolve(__dirname, "../packages/types/src/openapi-types.ts");

async function fetchSchema(url) {
  return new Promise((resolvePromise, rejectPromise) => {
    const target = new URL(url);
    const requester = target.protocol === "https:" ? httpsRequest : httpRequest;
    const req = requester(target, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        rejectPromise(new Error(`Failed to fetch OpenAPI schema: ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolvePromise(Buffer.concat(data).toString("utf-8")));
    });
    req.on("error", rejectPromise);
    req.end();
  });
}

async function main() {
  try {
    const rawSchema = await fetchSchema(schemaUrl);
    const parsed = JSON.parse(rawSchema);
    const types = await openapiTS(parsed, {
      exportType: true,
      alphabetize: true,
      additionalProperties: false,
    });
    const header = `/**\n * ============================================================================\n * File: packages/types/src/openapi-types.ts\n * Purpose: Auto-generated TypeScript types from FastAPI OpenAPI schema.\n * Structure: Created by scripts/generate-types.mjs. Do not edit manually.\n * Usage: Imported by applications to align client/server contracts.\n * ============================================================================\n */\n`;
    const stream = createWriteStream(outputPath, { flags: "w" });
    stream.write(header + types);
    stream.close();
    console.info(`✅ Generated types to ${outputPath}`);
  } catch (error) {
    console.error("❌ Failed to generate types", error);
    process.exitCode = 1;
  }
}

await main();
