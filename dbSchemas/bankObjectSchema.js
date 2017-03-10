var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('connected');
});

//consider whether to require and/or warn if fields missing
var bankFinancialSchema = mongoose.Schema({
    id: Number,
    filterType: String,
    subS: String,

    cash: Number,
    cashWithSubs: Number,

    fedFundsRevRepo: Number,
    totalSecurities: Number,
    treasuries: Number,
    munis: Number,
    foreignSecurities: Number,
    otherSecurities: Number,

    subsidiaryInvestment: Number,
    subsidiaryLoans: Number,
    subsidiaryGoodwill: Number,
    subsidiaryNonBanks: Number,

    loansHFS: Number,
    loansGross: Number,
    allowance: Number,
    loansNet: Number,

    oreo: Number,
    goodwill: Number,
    otherIntangibles: Number,
    fixedAssets: Number,
    otherAssets: Number,
    realEstateJV: Number,
    tradingAssets: Number,

    totalAssets: Number,

    totalDeposits: Number,
    depositsInterestBearing: Number,

    fedFundsAndRepo: Number,
    tradingLiabilities: Number,
    otherBorrowings: Number,
    subDebt: Number,
    trups: Number,
    otherLiabs: Number,
    totalLiabilities: Number,

    totalEquity: Number,
    preferredEquity: Number,
    minorityInterest: Number,
    commonEquity: Number,
    totalLiabilitiesAndEquity: Number,

    interestIncome: Number,
    iiLoans: Number,
    iiLeases: Number,

    iiTaxExemptLoans: Number,
    iiSecurities: Number,
    iiTreasuries: Number,
    iiMBS: Number,
    iiOtherSecurities: Number,
    iiTaxExemptSecurities: Number,

    iiFedFundsAndRevRepo: Number,
    iiDueFromBanks: Number,
    iiTrading: Number,
    iiAllOther: Number,

    interestExpense: Number,
    ieDeposits: Number,
    ieFedFundsAndRepo: Number,
    ieSubAndTrups: Number,
    ieOther: Number,

    netInterestIncome: Number,

    provision: Number,
    totalGains: Number,
    afsGains: Number,
    htmGains: Number,
    dividendIncome: Number,

    nii: Number,
    nie: Number,
    preTaxIncome: Number,

    tax: Number,
    incomeBeforeSubsidiary: Number,
    subsidiaryEarnings: Number,
    nonRecurring: Number,
    minorityIncome: Number,

    netIncome: Number,
    subSAdjustedNetIncome: Number,
    dividends: Number,

    npl: Number,
    coreDeposits: Number,

    rwa: Number,
    regCapital: Number,
    leverageAssets: Number,
    leverageRatio: Number,
    regCapitalRatio: Number,

    balanceCheck: Boolean,
    incomeCheck: Boolean,

    netDTA: Number,
    netDTL: Number,

    avgCashAndSecurities: Number,
    avgLoans: Number,
    avgEarningAssets: Number,
    avgIbDeposits: Number,
    vgTotalDeposits: Number,
    avgTrups: Number,
    avgSubDebt: Number,
    vgIbLiabilities: Number,
    avgEquity: Number,
    avgTCE: Number,

    intangibleAmort: Number,
    dilutedEPS: Number,
    prefDiv: Number,
    nco: Number,
    tangibleEquity: Number,
    commonShares: Number,
    avgDilutedShares: Number,
    sharePrice: Number

});

//create a parent bank scheme with the bankFinancials as a sub-doc
var Bank = mongoose.Schema({
	//desriptive information about the bank - generally static
    id: { type: Number, index: true },

    //financials - time series
    FY2016: bankFinancialSchema   //ca
 });



//bankFinancialSchema.set('toJSON', { getters: true, virtuals: false });

var bank = mongoose.model('Bank', bankFinancialSchema);

var b123 = new bank({
    id: 123,
    FY2016: {
    id: 123,
    filterType: 'Y9C',
    subS: 'No',
    cash: 1234,
    cashWithSubs: 00,
    fedFundsRevRepo: 17.2344,
    totalSecurities: 163
}

});


console.log(b123.toJSON());  //turns into json via getters



// NOTE: methods must be added to the schema before compiling it with mongoose.model()



/*   must save them..
b123.save(function (err, fluffy) {
  if (err) return console.error(err);
});
*/
