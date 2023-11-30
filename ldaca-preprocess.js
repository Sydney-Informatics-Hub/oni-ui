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



function get_parent(crate, entity) {
	const eid = entity['@id'];
	const parents = crate.graph.filter((e) => {
		const parts = crate.getProperty(e, 'hasPart');
		if( parts ) {
			const of_e = parts.filter((p) => p['@id'] === eid);
			return of_e.length > 0;
		}
		return false;
	});
	if( parents.length > 1 ) {
		console.log(`entity with more than one parent: ${eid}`);
	}
	if( parents < 1 ) {
		console.log(`entity ${eid} has no parents`);
		return null;
	}
	return parents[0];
}


// add RepositoryObject type / conformance to an entity, and add a 
// 'hasMember' link coming from its parent

function make_repository_object(crate, entity) {
	add_ldaca_type(crate, entity, "RepositoryObject");
	const parent = get_parent(crate, entity);
	if( parent ) {
		crate.addValues(parent, 'hasMember', { '@id': entity['@id'] });
	}
}



(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir] -o [outdir] -n [name]')
		.demandOption(['i', 'o', 'n'])
		.argv;
	
	const crate = await load_raw_crate(args.i);
	const root = crate.rootDataset;

	const arcp_id = `arcp://name,${args.n}`; // normalise name
	root['@id'] = arcp_id;

	add_ldaca_type(crate, root, "RepositoryCollection");

	crate.graph.filter((e) => e['@id'].substr(0, 4) === '#rec').map((e) => {
		make_repository_object(crate, e);
		if (e["nameOrTitle"] !== undefined) {
			e["name"] = e["nameOrTitle"];
		}
	});

	await write_cooked_crate(crate, args.o);


})();