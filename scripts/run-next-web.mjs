#!/usr/bin/env node
/**
 * # scripts/run-next-web.mjs
 *
 * ## Purpose
 * This helper bootstraps Fusion Futures' Next.js web application commands with
 * reliable, cross-platform port handling. It ensures developers on Windows,
 * macOS, and Linux can provide a desired port via environment variables or CLI
 * flags without shell-specific syntax glitches.
 *
 * ## Structure
 * 1. Parse command-line intent (which Next.js sub-command to run and any
 *    additional flags provided by the developer).
 * 2. Resolve the most appropriate port using CLI flags, environment variables,
 *    and project defaults while validating the value for safety.
 * 3. Spawn the local `next` binary through `npx`, forwarding all other options
 *    unchanged and providing visibility via debug logs.
 *
 * ## Usage
 * Invoked automatically through npm scripts, for example:
 * `npm run dev --prefix apps/web -- --port 4100`. The script also respects the
 * `PORT` environment variable (e.g. `PORT=4200 npm run dev --prefix apps/web`).
 *
 * ## Debugging Aids
 * The script prints the resolved port/hostname combination before delegating to
 * Next.js, making it simple to confirm runtime configuration.
 */

import { spawn } from 'node:child_process';
import process from 'node:process';

const DEFAULT_PORT = 3000;
const DEFAULT_HOSTNAME = '0.0.0.0';

/**
 * Extract a flag (and optional value) from an arguments array.
 *
 * @param {string[]} args - Remaining CLI arguments.
 * @param {string[]} flagNames - Accepted flag names (e.g. ['--port', '-p']).
 * @param {boolean} requiresValue - Whether the flag requires a value.
 * @returns {{ value: string | boolean | undefined, args: string[] }}
 */
function pullFlag(args, flagNames, requiresValue = true) {
  const clonedArgs = [...args];
  let extractedValue;

  for (const flag of flagNames) {
    const index = clonedArgs.indexOf(flag);
    if (index !== -1) {
      clonedArgs.splice(index, 1);
      if (requiresValue) {
        if (index >= clonedArgs.length) {
          console.error(`Missing value after ${flag}. Please supply a value.`);
          process.exit(1);
        }
        extractedValue = clonedArgs.splice(index, 1)[0];
      } else {
        extractedValue = true;
      }
      break;
    }
  }

  return { value: extractedValue, args: clonedArgs };
}

function resolvePort(cliValue, envValue) {
  const selected = cliValue ?? envValue ?? String(DEFAULT_PORT);
  const portNumber = Number(selected);

  if (!Number.isInteger(portNumber) || portNumber < 0) {
    console.error(
      `Invalid port value "${selected}". Please provide a non-negative integer.`,
    );
    process.exit(1);
  }

  return portNumber;
}

function ensureHostname(args, envHostname) {
  const hostnameFlags = ['--hostname', '-H'];
  const hasHostnameFlag = args.some((arg, index) =>
    hostnameFlags.includes(arg) && index < args.length - 1,
  );

  if (hasHostnameFlag) {
    return args;
  }

  const hostname = envHostname ?? DEFAULT_HOSTNAME;
  return ['--hostname', hostname, ...args];
}

function extractHostname(args) {
  const longIndex = args.indexOf('--hostname');
  if (longIndex !== -1 && longIndex < args.length - 1) {
    return args[longIndex + 1];
  }

  const shortIndex = args.indexOf('-H');
  if (shortIndex !== -1 && shortIndex < args.length - 1) {
    return args[shortIndex + 1];
  }

  return DEFAULT_HOSTNAME;
}

function main() {
  const [, , nextSubCommand = 'dev', ...rawArgs] = process.argv;
  const sanitizedArgs = rawArgs.filter(Boolean);

  const { value: cliPort, args: argsWithoutPort } = pullFlag(
    sanitizedArgs,
    ['--port', '-p'],
  );

  const port = resolvePort(cliPort, process.env.PORT);
  const argsWithHostname = ensureHostname(argsWithoutPort, process.env.HOST);
  const finalArgs = [nextSubCommand, '--port', String(port), ...argsWithHostname];
  const resolvedHostname = extractHostname(argsWithHostname);

  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  console.info(
    `[run-next-web] Launching "next ${nextSubCommand}" on ${resolvedHostname}:${port}.`,
  );

  const child = spawn(npxCommand, ['next', ...finalArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.warn(`[run-next-web] Next.js exited due to signal ${signal}.`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });
}

main();
