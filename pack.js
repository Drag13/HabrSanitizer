const { execSync } = require('child_process');
const AdmZip = require('adm-zip');
const { existsSync, unlinkSync } = require('fs');

const from = 'dist';
const outputTo = 'sanitizer.zip';

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

cleanup(outputTo);
buildCode();
pack(from, outputTo);
