const { execSync } = require('child_process');
const { existsSync, unlinkSync, readFileSync } = require('fs');
const { resolve } = require('path');

const AdmZip = require('adm-zip');

const from = 'dist';
const outputTo = 'sanitizer.zip';
const optionsBundle = 'options.js';
const pageBundle = 'sanitizer.js';

/**
 * Checks if regeneratorRuntime present in the code
 * @param {string} pathToFile path to js file to be checked
 */
function checkRegenrationRuntime(pathToFile) {
    process.stdout.write(`start checking presence of the regenration runtime for ${pathToFile}...`);
    const isFileExists = existsSync(pathToFile);
    if (!isFileExists) {
        throw new Error(`File ${pathToFile} not exists`);
    }

    const data = readFileSync(pathToFile, { encoding: 'utf-8' });

    const isRegenrationRuntimeExists = /regeneratorRuntime/i.test(data);

    if (isRegenrationRuntimeExists) {
        throw new Error('Regeneration runtime found in build, aborting');
    }

    process.stdout.write('OK \n');
}

/**
 * Removes specefied folder
 * @param {string} output Path to folder to clean
 */
function cleanup(output) {
    console.log('starting cleanup');
    if (existsSync(output)) {
        unlinkSync(output);
        console.log('cleanup is done');
    } else {
        console.log('nothing to cleanup');
    }
}

function buildCode() {
    console.log('start building');
    execSync(`npm run build`);
    console.log('building is done');
}

/**
 * Packs files into archive for publishing
 * @param {{from:string, to: string, filesToCheck:string[]}} p
 */
function pack(from, to) {
    console.log('start packing');

    var zip = new AdmZip();

    zip.addLocalFolder(from);
    zip.writeZip(to, (err) => {
        if (err) {
            console.log('something went wrong: ', err);
        } else {
            console.log('packing is done');
            console.log(`don't forget to check in Chrome and FireFox :)`);
        }
    });
}

/**
 * Tests final build
 * @param {string[]} filesToCheck  Files to be checked
 */
function testBuildFiles(filesToCheck) {
    filesToCheck.map((fileName) => resolve(from, fileName)).forEach(checkRegenrationRuntime);
}

cleanup(outputTo);
buildCode();
testBuildFiles([optionsBundle, pageBundle]);
pack(from, outputTo);
