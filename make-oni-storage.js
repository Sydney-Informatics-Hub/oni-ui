// utility to add a single RO-Crate to an oni-storage

const ocfl = require('@ocfl/ocfl-fs');
const {ROCrate} = require('ro-crate');
const fs = require('fs-extra');
const yargs = require('yargs/yargs');


const oni_config = require('./configuration.json');


const config = {
	root: oni_config.api.ocfl.ocflPath,
	layout: 'PathDirectStorageLayout'
};

const object_dir = './samples/heurist-cooked';

let storage;

async function get_arcp_path(dir) {
	try {
		const crateJson = await fs.readJson(dir + '/ro-crate-metadata.json');
		const crate = new ROCrate(crateJson);
		const crate_id = crate.rootDataset['@id'];

		const parts = crate_id.split(',');
		if( parts[0] !== 'arcp://name' ) {
			console.log('Root dataset ID must be an arcp://name');
			return false;
		}
		return `arcp_name_${parts[1]}`;
	} catch(error) {
		console.error("Error trying to parse ro-crate-metadata.json");
		console.error(error);
		return false;
	}
}

(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir]')
		.demandOption(['i'])
		.argv;


	const object_name = await get_arcp_path(args.i);

	if( object_name ) {

		try {
			storage = await ocfl.createStorage(config);
			console.log(`Created ocfl storage ${config.root}`);
		} catch(error) {
			try {
				storage = await ocfl.loadStorage(config);
			console.log(`Connected to ocfl storage ${config.root}`);
			} catch(error) {
				console.error(`invalid storage root`);
			}
		}

		const o = storage.object(object_name);
		console.log(`Importing ro-crate from ${args.i}`);
		console.log(`importing ${object_dir}`);
		await o.import(object_dir);
		console.log(`Imported as ${object_name}`);
	} else {
		console.log(`Couldn't import, arcp name identifier not found`);
	}
})();
