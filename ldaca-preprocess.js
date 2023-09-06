// LDaCA-readiness transform

const {ROCrate} = require('ro-crate');
const fs = require('fs-extra');
const yargs = require('yargs/yargs');

const LDACA_PROFILE = {
	RepositoryCollection: "https://purl.archive.org/language-data-commons/profile#Collection",
	RepositoryObject: "https://purl.archive.org/language-data-commons/profile#Object"
}


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


function add_ldaca_type(crate, entity, ldaca_type) {
	crate.addValues(entity, "@type", ldaca_type);
	crate.addValues(entity, 'conformsTo', { '@id': LDACA_PROFILE[ldaca_type] });
}


// filter all of the graph by a function, and make matching
// nodes a RepositoryObject, adding memberOf relations to the root

// 

function make_repository_object(crate, fn) {
	crate.graph.filter((entity) => {
		if( fn(entity) ) {
			add_ldaca_type(crate, entity, "RepositoryObject");
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

	add_ldaca_type(crate, root, "RepositoryCollection");

	make_repository_object(crate, (e) => {
		return e['@id'].substr(0, 4) === '#rec';
	});

	await write_cooked_crate(crate, args.o);


})();