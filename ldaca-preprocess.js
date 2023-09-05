// LDaCA-readiness transform

const {ROCrate} = require('ro-crate');
const fs = require('fs-extra');
const yargs = require('yargs/yargs');

async function load_raw_crate(dir) {
	try {
		const crateJson = await fs.readJson(dir + '/ro-crate-metadata.json');
		const crate = new ROCrate(crateJson);
		return crate;
	} catch(error) {
		console.error("Error loading ro-crate-metadata.json");
		console.error(error);
		return false;
	}
}






(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir] -o [outdir]')
		.demandOption(['i', 'o'])
		.argv;
	
	const raw_crate = await load_raw_crate(args.i);

	console.log(raw_crate);

})();