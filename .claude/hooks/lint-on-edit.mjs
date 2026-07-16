#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write to a src TS/TSX file, run ESLint on just
// that file and surface any problems back to Claude. Advisory — the edit has
// already happened; this only reports. Exits 0 (silent) when the file is clean
// or out of scope, exit 2 (with stderr) when ESLint finds issues.
import { execSync } from "node:child_process"

let input = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (c) => (input += c))
process.stdin.on("end", () => {
  let data
  try {
    data = JSON.parse(input)
  } catch {
    process.exit(0) // no/invalid payload — nothing to do
  }

  const file = data?.tool_input?.file_path
  if (!file) process.exit(0)

  const norm = String(file).replace(/\\/g, "/")
  if (!/\/src\/.+\.(ts|tsx)$/.test(norm)) process.exit(0) // only src TS/TSX

  try {
    execSync(`npx eslint "${file}"`, { stdio: ["ignore", "pipe", "pipe"] })
    process.exit(0) // clean
  } catch (e) {
    const out =
      (e.stdout?.toString() || "") + (e.stderr?.toString() || "")
    if (!out.trim()) process.exit(0) // eslint not available / no output — don't nag
    process.stderr.write(`ESLint found issues in ${norm}:\n${out}\n`)
    process.exit(2) // feed the problems back to Claude
  }
})
