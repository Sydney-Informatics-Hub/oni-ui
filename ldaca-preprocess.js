// LDaCA-readiness transform

const {ROCrate} = require('ro-crate');
const fs = require('fs-extra');
const yargs = require('yargs/yargs');

const omaa_crate = './samples/heurist/ro-crate-medat';




const args = yargs(process.argv.slice(2))
	.usage('Usage: $0 -i [indir] -o [outdir]')
	.demandOption(['i', 'o'])
	.argv;

console.log(args);