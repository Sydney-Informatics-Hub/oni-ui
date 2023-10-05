// Given an RO-crate and an indexed version in oni, a node script which traverses the graph, identifies the items in the
// graph that should be indexed, and searches for them

const {ROCrate} = require('ro-crate');
const axios = require('axios');
const fs = require('fs-extra');
const yargs = require('yargs/yargs');

async function load_crate(dir) {
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

async function elastic_query(q) {
    try {
        const config = {
            query: {
                match: {
                    "@id": q
                }
            }
        }
        const response = await axios.post('http://localhost:9200/_search/', config)

        // Handle Elasticsearch response
        const hits = response.data.hits.hits;

        if (hits.length === 0) {
            console.log(q, 'not indexed in Elasticsearch.')
        } else {
            console.log(hits)
        }
    } catch(error) {
        console.error("Error querying elasticsearch")
        console.error(error);
        return false;
    }
}

(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir] -q [query]')
		.demandOption(['i', 'q'])
		.argv;
	
	const crate = await load_crate(args.i);
	const root = crate.rootDataset;

    const resp = elastic_query(args.q)


	// const arcp_id = `arcp://name,${args.n}`; // normalise name
	// root['@id'] = arcp_id;

	// add_ldaca_type(crate, root, "RepositoryCollection");

	// crate.graph.filter((e) => e['@id'].substr(0, 4) === '#rec').map((e) => {
	// 	make_repository_object(crate, e);
	// 	e["name"] = e["nameOrTitle"];
	// });

	// await write_cooked_crate(crate, args.o);


})();