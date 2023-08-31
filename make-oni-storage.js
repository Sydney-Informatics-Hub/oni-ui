// utility to add a single RO-Crate to an oni-storage

const ocfl = require('@ocfl/ocfl-fs');

const oni_config = require('./configuration.json');

const config = {
	root: oni_config.api.ocfl.ocflPath,
	layout: 'PathDirectStorageLayout'
};

const object_name = 'heurist-omaa';
const object_dir = './inbox/heurist';

let storage;

(async () => {

	try {
		storage = await ocfl.createStorage(config);
		console.log(`created storage ${storage}`);
	} catch(error) {
		try {
			storage = await ocfl.loadStorage(config);
		console.log(`loaded storage ${storage}`);
		} catch(error) {
			console.error(`invalid storage root`);
		}
	}

	const o = storage.object(object_name);
	console.log(`importing ${object_dir}`);
	await o.import(object_dir);

	for await ( const obj of storage ) {
		console.log(await obj.count());
	}

})();
