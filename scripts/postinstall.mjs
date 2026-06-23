/**
 * Postinstall: Create chromium-pack.tar from @sparticuz/chromium for Vercel.
 * Used by @sparticuz/chromium-min at runtime to fetch the Chromium binary.
 * Runs on Vercel build (Linux); may skip on Windows if tar unavailable.
 */
import { execSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const projectRoot = dirname(__dirname);

async function main() {
    // In production, prefer a prebuilt hosted pack over rebuilding Chromium on every deploy.
    if (process.env.CHROMIUM_PACK_URL || process.env.SKIP_CHROMIUM_PACK === "1") {
        console.log("Skipping chromium-pack.tar generation");
        return;
    }

    try {
        const chromiumEntry = require.resolve("@sparticuz/chromium");
        const chromiumDir = dirname(dirname(dirname(chromiumEntry)));
        const binDir = join(chromiumDir, "bin");
        if (!existsSync(binDir)) {
            console.log("Chromium bin directory not found, skipping");
            return;
        }
        const publicDir = join(projectRoot, "public");
        const outputPath = join(publicDir, "chromium-pack.tar");
        if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
        if (existsSync(outputPath)) {
            console.log("chromium-pack.tar already exists, skipping");
            return;
        }
        execSync(`tar -cf "${outputPath}" -C "${binDir}" .`, {
            stdio: "inherit",
            cwd: projectRoot,
        });
        console.log("chromium-pack.tar created");
    } catch (err) {
        console.warn("Chromium archive creation skipped:", err.message);
        process.exit(0);
    }
}

main();
