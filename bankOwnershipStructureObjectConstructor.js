
function ownershipConstructor (arr) {


	//IMPORTED DATA
	this.name = arr[0]; //company name
	this.id = parseInt(arr[1]); //company's SNL ID
	this.city = arr[2];
	this.state = arr[3];
	this.parentName = arr[4]; //ultimate parent's name
	this.parentID = (arr[5] == "NA") ? 0 : parseInt(arr[5]); //ultimate parent's SNL ID ...if NA or = this entity's snl ID, then this is the top level
	this.midParentID = parseInt(arr[6]); //snl id of mid level parent .. if same as parent ID OR is = NA, then there is no mid level co
	this.ticker = arr[7]; //ticker only shows up at the top level
	this.fedID = (arr[8] == "NA") ? 0 : parseInt(arr[8]); //IF THIS IS NA, SET IT = 0 
	this.mergerTarget = (arr[9] == "No") ? false : true; // Yes or No this company is an announced target
	this.depositorySubCount = parseInt(arr[10]); //number of depository subsidiaries
	this.ownershipStructure = arr[11]; //Mutuals should be filtered out
	this.financialHoldCo = (arr[12] == "No") ? false : true; //Flag that indicates if this is a financial holding company - Yes or No
	this.companyType = arr[13];
	this.unconsolidated = (arr[14] == "Yes") ? false : true; //indicates if they are a Y9 SP or LP filer
	this.filerType = arr[15]; // Y9SP Y9C 041 031 ... those are call reports ... all other types should be filtered out including blank
	this.y9cAssets = (arr[16] == "NA") ? 0 : parseInt(arr[16]);
	this.y9spAssets = (arr[17] == "NA") ? 0 : parseInt(arr[17]);
	this.callFormAssets = (arr[18] == "NA") ? 0 : parseInt(arr[18]);

	//for initial simplicity....could return false if there is a mid-level holcdo id >< parent id

	//check out the bear state case..and boston private financial holdings, inc  [lots of ams and then 1 bank in the middle..]...emswater financial, llc
	
	//KEY CASE - NO Y9C / SP OR CALL REPORT ASSETS AND NO PARENT ID .... MOST ARE NOT BANKS BUT A FEW ARE....

	//SUBSEQUENTLY CALCULATED OR DERIVED FIELDS
	this.topLevel = (this.id == this.parentID || this.parentID == 0) ? true : false;
	this.consolidationArray = [];
	this.treeDepth = 0;

	//in consolidation, if the sub is a y9sp...then skip it?...only do the top co and bottom call form filers??


}

module.exports = ownershipConstructor;

//valuations: bank-level and consolidated level (e.g. you pick?)
	//SELECT - holdco or bank (indicated by call report filer)

