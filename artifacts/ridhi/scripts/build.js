const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

function getDeploymentDomain() {
  // Production domain (set during deployment)
  if (process.env.REPLIT_INTERNAL_APP_DOMAIN) {
    return process.env.REPLIT_INTERNAL_APP_DOMAIN.replace(/^https?:\/\//, "");
  }
  // Dev domain fallback
  if (process.env.REPLIT_DEV_DOMAIN) {
    return process.env.REPLIT_DEV_DOMAIN.replace(/^https?:\/\//, "");
  }
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return process.env.EXPO_PUBLIC_DOMAIN.replace(/^https?:\/\//, "");
  }
  console.error("ERROR: No deployment domain found. Set REPLIT_INTERNAL_APP_DOMAIN, REPLIT_DEV_DOMAIN, or EXPO_PUBLIC_DOMAIN");
  process.exit(1);
}

function getExpoPublicReplId() {
  return process.env.REPL_ID || process.env.EXPO_PUBLIC_REPL_ID || "";
}

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      cwd: projectRoot,
      ...options,
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

async function main() {
  const domain = getDeploymentDomain();
  const replId = getExpoPublicReplId();
  const baseUrl = `https://${domain}`;

  console.log("Building Ridhi Expo app for production...");
  console.log(`Domain: ${domain}`);
  console.log(`Base URL: ${baseUrl}`);

  // Set env vars for the export
  const env = {
    ...process.env,
    EXPO_PUBLIC_DOMAIN: domain,
    EXPO_PUBLIC_REPL_ID: replId,
    NODE_ENV: "production",
  };

  // Export for all platforms
  const exportDir = path.join(projectRoot, "dist");
  if (fs.existsSync(exportDir)) {
    fs.rmSync(exportDir, { recursive: true });
  }

  console.log("\nExporting with expo export...");
  await runCommand("pnpm", ["exec", "expo", "export", "-p", "all", "--output-dir", "dist"], { env });

  // Create static-build directory for serve.js
  const staticBuild = path.join(projectRoot, "static-build");
  if (fs.existsSync(staticBuild)) {
    fs.rmSync(staticBuild, { recursive: true });
  }

  // Create the expected structure
  const iosDir = path.join(staticBuild, "ios");
  const androidDir = path.join(staticBuild, "android");
  fs.mkdirSync(iosDir, { recursive: true });
  fs.mkdirSync(androidDir, { recursive: true });

  // Copy manifest.json from the export output
  const iosManifest = path.join(exportDir, "_expo", "static", "js", "ios", "manifest.json");
  const androidManifest = path.join(exportDir, "_expo", "static", "js", "android", "manifest.json");

  if (fs.existsSync(iosManifest)) {
    const manifest = JSON.parse(fs.readFileSync(iosManifest, "utf-8"));
    // Update URLs to point to production domain
    if (manifest.launchAsset) {
      manifest.launchAsset.url = manifest.launchAsset.url.replace(/^https?:\/\/[^\/]+/, baseUrl);
    }
    if (manifest.assets) {
      for (const asset of manifest.assets) {
        if (asset.url) {
          asset.url = asset.url.replace(/^https?:\/\/[^\/]+/, baseUrl);
        }
      }
    }
    fs.writeFileSync(path.join(iosDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("iOS manifest created");
  } else {
    // Create minimal manifest
    const iosBundle = path.join(exportDir, "_expo", "static", "js", "ios", "entry");
    const iosBundleFile = findBundleFile(exportDir, "ios");
    const manifest = createMinimalManifest("ios", domain, iosBundleFile, replId);
    fs.writeFileSync(path.join(iosDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("iOS manifest created (minimal)");
  }

  if (fs.existsSync(androidManifest)) {
    const manifest = JSON.parse(fs.readFileSync(androidManifest, "utf-8"));
    if (manifest.launchAsset) {
      manifest.launchAsset.url = manifest.launchAsset.url.replace(/^https?:\/\/[^\/]+/, baseUrl);
    }
    if (manifest.assets) {
      for (const asset of manifest.assets) {
        if (asset.url) {
          asset.url = asset.url.replace(/^https?:\/\/[^\/]+/, baseUrl);
        }
      }
    }
    fs.writeFileSync(path.join(androidDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("Android manifest created");
  } else {
    const androidBundleFile = findBundleFile(exportDir, "android");
    const manifest = createMinimalManifest("android", domain, androidBundleFile, replId);
    fs.writeFileSync(path.join(androidDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("Android manifest created (minimal)");
  }

  // Copy the expo-exported static files to serve.js's expected location
  // serve.js expects all static files in static-build/
  // We need to copy the _expo folder structure and assets
  const exportExpoDir = path.join(exportDir, "_expo");
  if (fs.existsSync(exportExpoDir)) {
    copyDirectory(exportExpoDir, path.join(staticBuild, "_expo"));
  }

  // Copy assets
  const exportAssets = path.join(exportDir, "assets");
  if (fs.existsSync(exportAssets)) {
    copyDirectory(exportAssets, path.join(staticBuild, "assets"));
  }

  // Copy HTML files and public static assets (images, icons, manifests)
  const STATIC_ROOT_EXTS = new Set([
    ".html", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".webp", ".txt", ".xml", ".json", ".webmanifest",
  ]);
  const STATIC_ROOT_FILES = new Set(["robots.txt", "sitemap.xml"]);
  const entries = fs.readdirSync(exportDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (STATIC_ROOT_FILES.has(entry.name) || STATIC_ROOT_EXTS.has(ext)) {
        fs.copyFileSync(path.join(exportDir, entry.name), path.join(staticBuild, entry.name));
      }
    } else if (entry.isDirectory() && entry.name !== "_expo" && entry.name !== "assets") {
      copyDirectory(path.join(exportDir, entry.name), path.join(staticBuild, entry.name));
    }
  }

  console.log("\nBuild complete!");
  console.log(`Static output: ${staticBuild}`);
  process.exit(0);
}

function findBundleFile(exportDir, platform) {
  const jsDir = path.join(exportDir, "_expo", "static", "js", platform);
  if (!fs.existsSync(jsDir)) return null;
  const files = fs.readdirSync(jsDir);
  const bundleFile = files.find(f => f.startsWith("entry") && (f.endsWith(".js") || f.endsWith(".hbc")));
  return bundleFile ? path.join(jsDir, bundleFile) : null;
}

function createMinimalManifest(platform, domain, bundleFile, replId) {
  const baseUrl = `https://${domain}`;
  const bundlePath = bundleFile
    ? bundleFile.replace(/^.*_expo\/static\/js\//, "_expo/static/js/")
    : `_expo/static/js/${platform}/entry.js`;
  return {
    id: `ridhi-${platform}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    runtimeVersion: "1.0.0",
    launchAsset: {
      hash: `bundle-${platform}-${Date.now()}`,
      key: `bundle-${platform}`,
      fileExtension: ".js",
      contentType: "application/javascript",
      url: `${baseUrl}/${bundlePath}`,
      launchedDuringStartup: false,
    },
    assets: [],
    metadata: {},
    extra: {
      expoClient: {
        name: "Ridhi - India's Social Universe",
        slug: "ridhi",
        version: "1.0.0",
        hostUri: `${domain}/${platform}`,
      },
      expoGo: {
        debuggerHost: `${domain}/${platform}`,
        packagerOpts: {
          dev: false,
        },
      },
    },
  };
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch((error) => {
  console.error("Build failed:", error.message);
  process.exit(1);
});
