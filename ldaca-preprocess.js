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

async function write_cooked_crate(crate, dir) {
	try {
		await fs.writeFile(dir + '/ro-crate-metadata.json', JSON.stringify(crate, null, 2));
	} catch(error) {
		console.error(`Error writing ${dir}/ro-crate-metadata.json`);
		console.error(error);
		return false;
	}
}



function add_repo_objects(crate, types) {

}



(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir] -o [outdir]')
		.demandOption(['i', 'o', 'n'])
		.argv;
	
	const crate = await load_raw_crate(args.i);
	const root = crate.rootDataset;

	const arcp_id = `arcp://name,${args.n}`; // normalise name
	root['@id'] = arcp_id;

	await write_cooked_crate(crate, args.o);


})();