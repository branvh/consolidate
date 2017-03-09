//function takes snl tree data that PT produces -  an array of arrays - and a single-level array of top-level entities' snl ids
function treeConstructor(treeData, ownershipDataArray) {

	//position 0 is the snl tree # that pt produces
	//position 1 is the snl id of the top level of the tree
	//2 is the 
	//3 is the entities in the tree
	//4 is the id of the entity in the tree - this is the # to append to the consolidation hierarchy array for the top level entitiy
	//5 is the name of the snl key to be put in consolidation array
	//6 is the snl company type of the ' '
	//7 is the # of levels deep this goes
	//console.log(treeData[0][5]  + treeData[0][6]);
	
	//outer loop - go through each object and if its a top level, look for subsidiaries to include in its consolidation array
	ownershipDataArray.forEach((entity) => {

		//only build consolidation arrays at top level - this will skip those that aren't top levels
		if (entity['topLevel']) {

			let topLevelID = entity['id'];
			//move through the tree data to find itself and subs; map will return an array of consolidation entities
			let filteredList = treeData.filter((cur, ind) => cur[1] == topLevelID);

			let output = filteredList.map((cur, ind) => {

					return cur[4]

			});

			//remove all of the items just matched from treeData - to speed up performance
			treeData = treeData.filter((cur, ind) => cur[1] != topLevelID);

		entity['consolidationArray'] = entity['consolidationArray'].concat(output);

		}


	});

	ownershipDataArray.forEach((cur) => console.log(cur['consolidationArray']));
}

module.exports = treeConstructor;

/*
need a list of top-level snl ids

	//based on the current get data function structure, this tree constructor would be passed an array of arrays

	need to search this data set and match snl id's in my top level array with the topSNLKeyID in the tree data set

	if there is a match, i then need to then look in the snlKeyID and append this key to my consolidation array

	


*/