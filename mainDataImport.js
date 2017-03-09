const fs = require('fs');
const OWNERSHIP_FILE = './rawCSVFiles/ownershipData.csv';
const SNL_TREE_DATA = './rawCSVFiles/currentSNLTree.csv';
const BANK_DATA_IMPORT_FILE = './rawCSVFiles/bankDataImport.csv'
const FILTERED_COMPANY_FILE = './rawCSVFiles/listOfSNLIDsForDataImport.csv';  //this is currently used as an output file

const ownershipConstructor = require('./dataConstructors/bankOwnershipStructureObjectConstructor.js');
const treeConstructor = require('./dataConstructors/treeConstructor.js');
const bankConstructor = require('./dataConstructors/bankDataConstructor.js');
const childProcess = require('child_process');
const NOT_BANKS = new RegExp(/L\.P|GP|Mutual|Partners,* LLC|Investments,* LLC|Limited|Equity Fund|Partners Fund|Partners\s*,* Inc|Fund I+|Partners* I+|Capital Group|Capital Holdings|Bancfund|\(Thrift\)/gi);

//==============CONTSTANTS AND DATA ARRAY VARIABLE DECLARARIONS================================================================================================
const MAX_ASSETS = 10000000; //10 billion  //used to open files to check if they rendered correctly
const WRITE_FILE = false; //triggers whither i output files to .csv

//These arrays will house ownership data objects and snl tree data objects, respectively
let ownershipArray = [];
let treeArray = [];
let topLevelIDs = [];
let allValidIDs = [];
let bankDataArray = [];

//used to filter data out of the snl tree input file
let nonApplicableCompanyTypes = ["NULL", "Unknown","Nondepository Trust","Industrial Bank","Credit Union","Corporate Credit Union","Industrial Loan HC"];

//=========================================IMPORT DATA FROM DATA SOURCE FILES===================================================================================

//helper function to input raw .csv file inputs, which will return -- commas will bust this
let getData = (file) => {

    //enable async reading of the raw data import file
    return new Promise((resolve, reject) => {

        fs.readFile(file, 'utf-8',(err, data) => {

    if (err) reject(err)

    //get rid of uneeded quote marks
    data.replace(/["']/g, "");

    //turn CSV string into an array with each line break representing a large data string that is turned into an array element
    let arr = data.split("\r\n");

    //break dowwn array of data strings into an array of arrays, with the 2nd level array being a bunch of related data elements
    let outputArr = arr.map((cur, ind) => {

        let data= cur.split(',');
        return data

    });

    //send the array of data arrays to the next step, likely to create objects based on it
    resolve(outputArr);

})

});
}

//Get ownership data
let ownershipData = getData(OWNERSHIP_FILE);

//Get snl ownership trees
let snlTrees = getData(SNL_TREE_DATA);

//get bank data to then create bank financial statement objects
let bankData = getData(BANK_DATA_IMPORT_FILE);


//=========================================BUILD BANK ENTITY OBJECTS CAPTURING BASIC OWNERSHIP INFORMATION=====================================================

//once we have the data, move into the main function
ownershipData.then((data) => {
    
    //create bank data objects
    let passed = 0;
    let failed = 0;

    let objectArray = data.forEach((cur, ind) => { //this will be an array of bank ownership objects

        //SERIES OF FILTERS - IF ALL ARE PASSED, AN OBJECT IS CONSTRUCTED
        if ((cur[13] == "Bank Holding Company" || cur[13] == "Savings & Loan HC") && parseInt(cur[10]) == 0) {
         //console.log('failed company type test');
            failed ++;
            return  //don't want shell hold-cos that don't hold a bank
        }

        //filter out anything that is too big for our scope
        if (cur[16] > MAX_ASSETS || cur[17] > MAX_ASSETS || cur[18] > MAX_ASSETS) {   //slight issue remains - we keep subs that fall under this threshold...they just won't be consolidated so only impact is slight performance and memory hit
            failed++;
            return 
        }

        //CONSIDER Y9 L IN FUTURE
        let validFilerType = (cur[15] == "Y9C" || cur[15] == "Y9SP" || cur[15] == 31 || cur[15] == 41);
         if (!validFilerType){
            failed++; //these are obscure companies or data set errors - as they don't file call report or y9 c/sp
            return
         }

        //Check for more 'bad' names that indicate PE ownership
        //var bankText = cur[0].match(/L\.P|GP|Mutual|Partners,* LLC|Investments,* LLC|Limited|Equity Fund|Partners Fund|Partners\s*,* Inc|Fund I+|Partners* I+|Capital Group|Capital Holdings|Bancfund|\(Thrift\)/gi);

        if (NOT_BANKS.test(cur[0])) {
        //console.log('failed bank text test ' + bankText);
            failed ++;
            return //means that we had a hit on any of the "bad name" strings above
        }



        //CREATE BANK OBJECT IF ALL FILTERS PASSED
        let bankObj = new ownershipConstructor(cur);  //here, cur is a nested array

        if (bankObj !== false) {  //so that we avoid banks with NA data  -- MUST UPDATE THE CONSTRUCTOR FUNCTIONs ACCORDINGLY

            ownershipArray.push(bankObj);  //add object to the ownership array
            passed++;
            return 
        }

    })



    // console.log(ownershipArray.length + ' objects created');
    // console.log(`${failed} entities failed`);

    //create an array of just top level ids which will be used to create a list of entities to be consolidated under a given top-level entity (through snlTrees function)
    let topCount = 0;
    ownershipArray.forEach((cur, ind) => {

        if (cur['topLevel']){
            topCount++;
            topLevelIDs.push(cur['id']);
        }

        allValidIDs.push(cur['id']);

    });

    console.log(`${topCount} top level entities identified`);

    //write this list of valid snl ids to a .csv file
    if (WRITE_FILE) {
        writeValidCompaniesToFile(allValidIDs);
    }

}).catch((err) => {

    console.log(err);

})

//========================================================================BUILD SUBSIDIARY TREES UNDER TOP LEVEL BANK ENTITIES - FOR CONSOLIDATIONS=========================================

//Update all top-level objects with list of entities that full under a 'consolidation hierarchy' - this hierarchy will only live on top level entities
snlTrees.then((data) => {

    //remove all the credit unions to cut down on search times
    data = data.filter((cur, ind) => {

        return nonApplicableCompanyTypes.indexOf(cur[6]) === -1;

    });

    treeConstructor(data, ownershipArray);

}).catch((err) => {

    console.log(err);

})


//======================================================================CREATE BANK DATASET OBJECTS========================================================================================

bankData.then((data) => {

    //make bank data objects

    data.forEach((cur, ind) => {

        let bankObj = new bankConstructor(cur);  //here, cur is a nested array

        if (bankObj !== false) {  //so that we avoid banks with NA data  -- MUST UPDATE THE CONSTRUCTOR FUNCTIONs ACCORDINGLY

            bankDataArray.push(bankObj);  //add object to the ownership array

        }
    });

    console.log(bankDataArray[1]);


}).catch((err) => {

    console.log(err);

});





//======================================================================HELPER FUNCTIONS===================================================================================================

//used to generate a list of valid SNL ids to then use in data imports
function writeValidCompaniesToFile(arr) {


    let output = '';

    arr.forEach((cur) => {

        output += cur + '\r\n'; 

    });
    console.log(output)
    //write the huge string to the .csv file
    fs.appendFile(FILTERED_COMPANY_FILE,output, (err) => {

    });

    childProcess.exec(FILTERED_COMPANY_FILE, function (err, stdout, stderr) {
        if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
    process.exit(0);// exit process once it is opened
})

}
