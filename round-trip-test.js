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
        }
    } catch(error) {
        console.error("Error querying elasticsearch")
        console.error(error);
        return false;
    }
}

(async () => {

	const args = yargs(process.argv.slice(2))
		.usage('Usage: $0 -i [indir]')
		.demandOption(['i'])
		.argv;
	
	const crate = await load_crate(args.i);

    //Iterate over the RO crate to find every RepositoryObject
    crate.graph.filter((e) => e['@type'][1] === 'RepositoryObject').map((e) => {
        elastic_query(e['@id'])
    })

})();