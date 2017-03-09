const fs = require('fs');
const BANK_DATA_IMPORT_FILE = 'bankDataImport.csv'
const bankConstructor = require('./bankDataConstructor.js');

//==============CONTSTANTS AND DATA ARRAY VARIABLE DECLARARIONS================================================================================================

let bankDataArray = [];


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

let bankData = getData(BANK_DATA_IMPORT_FILE);


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
