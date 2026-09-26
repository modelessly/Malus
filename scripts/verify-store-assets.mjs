import { readFileSync } from "node:fs";
import { stdout } from "node:process";

const expectedImages = new Map([
  ["public/icons/icon-16.png", [16, 16]],
  ["public/icons/icon-32.png", [32, 32]],
  ["public/icons/icon-48.png", [48, 48]],
  ["public/icons/icon-128.png", [128, 128]],
  ["store-assets/store-icon-128.png", [128, 128]],
  ["store-assets/store-screenshot-01.png", [1280, 800]],
  ["store-assets/store-screenshot-02.png", [1280, 800]],
  ["store-assets/promo-small-440x280.png", [440, 280]],
  ["store-assets/promo-marquee-1400x560.png", [1400, 560]],
]);

const requiredDocuments = [
  "PRIVACY.md",
  "SUPPORT.md",
  "store/listing.md",
  "store/privacy-practices.md",
  "store/test-instructions.md",
  "store/submission-checklist.md",
];

const pngDimensions = (path) => {
  const bytes = readFileSync(path);
  const signature = bytes.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error(`${path} is not PNG`);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};

for (const [path, expected] of expectedImages) {
  const actual = pngDimensions(path);
  if (actual[0] !== expected[0] || actual[1] !== expected[1]) {
    throw new Error(
      `${path} is ${actual.join("x")}; expected ${expected.join("x")}`,
    );
  }
}

for (const path of requiredDocuments) readFileSync(path);

const manifest = JSON.parse(readFileSync("public/manifest.json", "utf8"));
for (const size of ["16", "32", "48", "128"]) {
  if (manifest.icons?.[size] !== `icons/icon-${size}.png`) {
    throw new Error(`Manifest icon ${size} is missing or incorrect`);
  }
}

stdout.write(
  `Verified ${expectedImages.size} PNG assets, ${requiredDocuments.length} store documents, and manifest icon declarations.\n`,
);
