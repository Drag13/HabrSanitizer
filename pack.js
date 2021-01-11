const { execSync } = require('child_process');
const { existsSync, unlinkSync, readFileSync } = require('fs');
const { resolve } = require('path');

const AdmZip = require('adm-zip');

const from = 'dist';
const outputTo = 'sanitizer.zip';
const optionsBundle = 'options.js';
const pageBundle = 'sanitizer.js';

function checkRegenrationRuntime(pathToFile) {
    process.stdout.write(`start checking presence of the regenration runtime for ${pathToFile}...`);
    const isFileExists = existsSync(pathToFile);
    if (!isFileExists) {
        throw new Error(`File ${pathToFile} not exists`);
    }

    const data = readFileSync(pathToFile, { encoding: 'utf-8' });

    const isRegenrationRuntimeExists = /regenerationruntime/i.test(data);

    if (isRegenrationRuntimeExists) {
        throw new Error('Regeneration runtime found in build, aborting');
    }

    process.stdout.write('OK \n');
}

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

function pack({ from, to, filesToCheck }) {
    console.log('start packing');
    filesToCheck.map((fileName) => resolve(from, fileName)).forEach(checkRegenrationRuntime);

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

cleanup(outputTo);
buildCode();
pack({ from, to: outputTo, filesToCheck: [optionsBundle, pageBundle] });
