#!/usr/bin/env node

/**
 * Codegen script: reads packages/shared/src/constants/endpoints.ts
 * and generates NACA Watch/Core/Networking/Endpoints.swift
 *
 * Usage: node packages/watch-ios/scripts/generate-endpoints.js
 * Or:    npm run watch:codegen (from monorepo root)
 */

const fs = require('fs');
const path = require('path');

const SHARED_ENDPOINTS = path.resolve(__dirname, '../../shared/src/constants/endpoints.ts');
const OUTPUT_SWIFT = path.resolve(__dirname, '../NACA Watch/Core/Networking/Endpoints.swift');

function parseEndpoints(source) {
  const groups = {};
  let currentGroup = null;

  for (const line of source.split('\n')) {
    const trimmed = line.trim();

    // Match group start: AUTH: {
    const groupMatch = trimmed.match(/^(\w+):\s*\{/);
    if (groupMatch) {
      currentGroup = groupMatch[1];
      groups[currentGroup] = [];
      continue;
    }

    // Match closing brace
    if (trimmed === '},' || trimmed === '}') {
      if (currentGroup) currentGroup = null;
      continue;
    }

    if (!currentGroup) continue;

    // Match static string: KEY: '/path/here',
    const staticMatch = trimmed.match(/^(\w+):\s*'([^']+)',?$/);
    if (staticMatch) {
      groups[currentGroup].push({
        name: staticMatch[1],
        type: 'static',
        path: staticMatch[2],
      });
      continue;
    }

    // Match single-param function: KEY: (param: string) => `/path/${param}/more`,
    const funcMatch = trimmed.match(/^(\w+):\s*\((\w+):\s*string\)\s*=>\s*`([^`]+)`,?$/);
    if (funcMatch) {
      groups[currentGroup].push({
        name: funcMatch[1],
        type: 'func1',
        param: funcMatch[2],
        template: funcMatch[3],
      });
      continue;
    }

    // Match two-param function start: KEY: (p1: string, p2: string) =>
    const func2StartMatch = trimmed.match(/^(\w+):\s*\((\w+):\s*string,\s*(\w+):\s*string\)\s*=>$/);
    if (func2StartMatch) {
      // Next line has the template
      groups[currentGroup].push({
        name: func2StartMatch[1],
        type: 'func2_pending',
        param1: func2StartMatch[2],
        param2: func2StartMatch[3],
      });
      continue;
    }

    // Match template continuation for multi-line functions
    const templateMatch = trimmed.match(/^`([^`]+)`,?$/);
    if (templateMatch && groups[currentGroup].length > 0) {
      const last = groups[currentGroup][groups[currentGroup].length - 1];
      if (last.type === 'func2_pending') {
        last.type = 'func2';
        last.template = templateMatch[1];
      }
    }
  }

  return groups;
}

function toSwiftName(tsName) {
  // Convert SNAKE_CASE to camelCase
  return tsName.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSwiftEnum(tsName) {
  // Convert SNAKE_CASE to PascalCase
  return tsName.charAt(0) + tsName.slice(1).toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function templateToSwift(template, params) {
  let result = template;
  for (const param of params) {
    result = result.replace(`\${${param}}`, `\\(${param})`);
  }
  return result;
}

function generateSwift(groups) {
  const lines = [
    '// AUTO-GENERATED from packages/shared/src/constants/endpoints.ts',
    '// Do not edit manually. Run: npm run watch:codegen',
    '',
    'import Foundation',
    '',
    'enum Endpoints {',
  ];

  for (const [groupName, endpoints] of Object.entries(groups)) {
    lines.push(`    enum ${toSwiftEnum(groupName)} {`);

    for (const ep of endpoints) {
      const swiftName = toSwiftName(ep.name);

      if (ep.type === 'static') {
        lines.push(`        static let ${swiftName} = "${ep.path}"`);
      } else if (ep.type === 'func1') {
        const swiftTemplate = templateToSwift(ep.template, [ep.param]);
        lines.push(`        static func ${swiftName}(_ ${ep.param}: String) -> String { "${swiftTemplate}" }`);
      } else if (ep.type === 'func2') {
        const swiftTemplate = templateToSwift(ep.template, [ep.param1, ep.param2]);
        lines.push(`        static func ${swiftName}(_ ${ep.param1}: String, _ ${ep.param2}: String) -> String {`);
        lines.push(`            "${swiftTemplate}"`);
        lines.push(`        }`);
      }
    }

    lines.push(`    }`);
    lines.push('');
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// Main
const source = fs.readFileSync(SHARED_ENDPOINTS, 'utf-8');
const groups = parseEndpoints(source);
const swift = generateSwift(groups);

fs.mkdirSync(path.dirname(OUTPUT_SWIFT), { recursive: true });
fs.writeFileSync(OUTPUT_SWIFT, swift, 'utf-8');
console.log(`Generated ${OUTPUT_SWIFT}`);
console.log(`  ${Object.keys(groups).length} groups, ${Object.values(groups).flat().length} endpoints`);
