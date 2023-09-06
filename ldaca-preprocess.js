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


// use crate.addValues here

function add_type(entity, newtype) {
	const type = entity['@type'];
	if( Array.isArray(type) ) {
		if( !entity['@type'].includes(newtype) ) {
			entity['@type'].push(newtype);
		}
	} else {
		if( entity['@type'] !== newtype ) {
			entity['@type'] = [ entity['@type'], newtype ];
		}
	} 
}

// filter all of the graph by a function, and make matching
// nodes a RepositoryObject, adding memberOf relations to their parent

function make_repository_object(crate, fn) {
	crate.graph.filter((entity) => {
		if( fn(entity) ) {
			add_type(entity, "RepositoryObject");
			//const parent = get_parent(crate, entity);
			crate.addValues(crate.rootDataset, 'hasMember', { '@id': entity['@id'] });
		}
	});
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
	add_type(root, "RepositoryCollection");

	make_repository_object(crate, (e) => {
		return e['@id'].substr(0, 4) === '#rec';
	});

	await write_cooked_crate(crate, args.o);


})();