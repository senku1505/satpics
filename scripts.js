// build.js
const fs = require('fs-extra');
const path = require('path');
const sass = require('sass');
const terser = require('terser');
const sharp = require('sharp');
const del = require('del');

// Directories
const imgDir = 'images';
const fullsDir = path.join(imgDir, 'fulls');
const thumbsDir = path.join(imgDir, 'thumbs');

// Task: Clean images
async function deleteImages() {
    await del([`${fullsDir}/*.*`, `${thumbsDir}/*.*`]);
    console.log('🧹 Deleted old resized images.');
}

// Task: Resize images
async function resizeImages() {
    const files = await fs.readdir(imgDir);

    await fs.ensureDir(fullsDir);
    await fs.ensureDir(thumbsDir);

    for (const file of files) {
        const filePath = path.join(imgDir, file);
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        const fullOutput = path.join(fullsDir, file);
        const thumbOutput = path.join(thumbsDir, file);

        await sharp(filePath)
            .resize({ width: 1024 })
            .toFile(fullOutput);

        await sharp(filePath)
            .resize({ width: 512 })
            .toFile(thumbOutput);
    }

    console.log('🖼️ Images resized.');
}

// Task: Compile SCSS
async function compileSass() {
    const result = sass.compile('./assets/sass/main.scss', {
        style: 'compressed'
    });

    await fs.outputFile('./assets/css/main.min.css', result.css);
    console.log('🎨 SCSS compiled.');
}

// Task: Minify JS
async function minifyJS() {
    const inputPath = './assets/js/main.js';
    const outputPath = './assets/js/main.min.js';

    const code = await fs.readFile(inputPath, 'utf8');
    const minified = await terser.minify(code);

    if (minified.code) {
        await fs.outputFile(outputPath, minified.code);
        console.log('📦 JS minified.');
    } else {
        console.error('❌ JS minification failed:', minified.error);
    }
}

// Run all tasks
async function buildAll() {
    await deleteImages();
    await compileSass();
    await minifyJS();
    await resizeImages();
}

buildAll().catch(err => {
    console.error('🚨 Build failed:', err);
});
