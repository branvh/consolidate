//IF IMPORTING DATA FROM A .CSV FILE:

	//REMOVE ALL COMMAS BEFORE IMPORT
	//SET ALL NUMBER CELLS = NUMERIC AND FORMAT SUCH THAT THERE ARE NO COMMAS AND NO DECIMALS - ALL INTEGERS


function bankDataConstructor(arr) {

	let subSTaxRate = .27; //WATCH MAY NEED TO PULL THIS OUT SOMEWHERE ELSE FOR CONSISTENCY / SAFETY

	//import array is setup of 3 sequences of 79 fields
	//only 79 need to be captured for a given bank, based on whether they file a y9-c, y9-sp, or are just 'bank level' data from call reports

	//y9-c: elements 2-80    y9-sp: 81-159    bank-level: 160 - 237
	//array field 1 - regulatory filer type, tells us where to look - how much to offset
	var numericFields = 78;
	var offset = (arr[1] === "Y9C") ? 0 : ((arr[1] === "Y9SP") ? numericFields : numericFields*2);
	this.id = parseInt(arr[0]); //snl id 
	this.filerType = arr[1]; //filing type
	this.subS = (arr[71] === "Yes") ? "Yes" : "No"; // Yes / No flag to indicate current sub-chatper "S" status

	//now, we slice the array keeping only what we need
	var startPosition = 2 + offset;   //should start at 2, 80, 158
	var endPosition = offset + numericFields + 2;  // +2 is since the slice function would otherwise exclude the last element ... math would say it should be +1, so this is the adjustment so we don't cutoff last field
	arr = arr.slice(startPosition, endPosition);   //should end at 79, 157, 235

		//now we turn all the NA and empties into 0
	arr = arr.map((cur) => {

		if (cur == "" || cur == NaN || !cur || cur === "NA") {
			cur = 0;
		}
		return cur

	});	

	//now we begin assigning fields
	//==================================================================================ASSETS===============================================================
	this.cash = parseInt(arr[0]); //cash and due from banks
	this.cashWithSubs = parseInt(arr[1]); //cash balances at subs
	this.fedFundsRevRepo = parseInt(arr[2]); //fed funds sold and reverse repo
	this.totalSecurities = parseInt(arr[3]); //   MUST SUM UP FOR BANK LEVEL

		//securities portfolio - will be blank for all but bank level
	this.treasuries = parseInt(arr[4]);
	this.munis = parseInt(arr[5]);
	this.foreignSecurities = parseInt(arr[6]);
	this.otherSecurities = parseInt(arr[7]);

		//subsidiary assets entries at holdco ... won't appear in anything but y9-sp
	this.subsidiaryInvestment = parseInt(arr[8]); // equity in subsidiaries
	this.subsidiaryLoans = parseInt(arr[9]); // loans to subs
	this.subsidiaryGoodwill = parseInt(arr[10]); //goodwill from investment in subs - usually pretty small - included b/c of y9-sp
	this.subsidiaryNonBanks = parseInt(arr[11]); //investments in non-bank subs

		//loans
	this.loansHFS = parseInt(arr[12]); //loans held for sale - SNL excludes these from gross and net loans
	this.loansGross = parseInt(arr[13]); //groans loans held for investment - bread and butter for banks
	this.allowance = parseInt(arr[14]); //loan loss allowance
	this.loansNet = parseInt(arr[15]); //gross loans - allownace; excludes loans HFS

		//misc assets
	this.oreo = parseInt(arr[16]); //other real estate owned 
	this.goodwill = parseInt(arr[17]); // WATCH - THIS TYPICALLY IS A SUB COMPONENT OF INTANGIBLES OR OTHER ASSETS
	this.otherIntangibles = parseInt(arr[18]); //anything aside from goodwill
	this.fixedAssets = parseInt(arr[19]); //net of deprecation in this #
	this.otherAssets = parseInt(arr[20]); //hodge podge 
	this.realEstateJV = parseInt(arr[21]); //real estate investment joint ventures
	this.tradingAssets = parseInt(arr[22]);

	this.totalAssets = parseInt(arr[23]);

	//==================================================================================LIABILITIES AND EQUITY=================================================
	this.totalDeposits = parseInt(arr[24]);
	this.depositsInterestBearing = parseInt(arr[25]); //sub component of deposits
	
		//other IB liabilities
	this.fedFundsAndRepo = parseInt(arr[26]);  //fed funds borrowed and repurchase agreements
	this.tradingLiabilities = parseInt(arr[27]); //
	this.otherBorrowings = parseInt(arr[28]); //
	this.subDebt = parseInt(arr[29]); //subordinated debt
	this.trups = parseInt(arr[30]); //trust preferred - just found at holdo-co levels (y9-c/sp)
	this.otherLiabs = parseInt(arr[31]); //hodge podge

	this.totalLiabilities = parseInt(arr[32]); //

		//equity
	this.totalEquity = parseInt(arr[33]); //grand total, the remainder are sub components that don't necessariy tie out as we don't breakout just common - would have to calc by removing preferred and minority interest
	this.preferredEquity = parseInt(arr[34]); //preferred stock
	this.minorityInterest = parseInt(arr[35]); //minority interest
	this.commonEquity = this.totalEquity - this.preferredEquity - this.minorityInterest; //plug

	this.totalLiabilitiesAndEquity = parseInt(arr[36]); //number to tie out against assets

	//===============================================================================INCOME STATEMENT==========================================================
		//interest income items
	this.interestIncome = parseInt(arr[37]); //total interest income

		//everything until interest expense is a SUB COMPONENT of interest income
	this.iiLoans = parseInt(arr[38]); //interest and fee income on loans
	this.iiLeases = parseInt(arr[39]); //  "" but with leases
	this.iiTaxExemptLoans = parseInt(arr[40]); // "" but with tax exempt loans
	this.iiSecurities = parseInt(arr[41]); //  WATCH - FOR BANK LEVEL THIS IS A SUMMATION BUT FOR Y9C ITS A STORED FIELD IN SNL

		//securties SUB COMPONENTS
	this.iiTreasuries = parseInt(arr[42]); //interest income on US treasury securities
	this.iiMBS = parseInt(arr[43]); // interest income on mortgage backed securities
	this.iiOtherSecurities = parseInt(arr[44]); // ii on everything aside from the other 3 types in this sub-group
	this.iiTaxExemptSecurities = parseInt(arr[45]); //ii on tax exempt securities - likely largerly comprised of municipal securities

		//other interest income items
	this.iiFedFundsAndRevRepo = parseInt(arr[46]); //interest income on fed funds sold and reverse repurchase agreements
	this.iiDueFromBanks = parseInt(arr[47]); //interest income on cash held at banks
	this.iiTrading = parseInt(arr[48]); //trading related securities interest income
	this.iiAllOther = parseInt(arr[49]); //catch all for any other type of interest income


		//interest expense items
	this.interestExpense = parseInt(arr[50]); //total interest expense

		//interext expense SUB COMPONENTS
	this.ieDeposits = parseInt(arr[51]); //interest expense on deposits
	this.ieFedFundsAndRepo = parseInt(arr[52]); // "" fed funds borrow and repurchase agreements
	this.ieSubAndTrups = parseInt(arr[53]); // "" subordinated debt and trust preferred securities - aka "trups"
	this.ieOther = parseInt(arr[54]); // catch all for all other interest expense items

	this.netInterestIncome = parseInt(arr[55]); //interest income - interest expense 

		//non interest related balance sheet items
	this.provision = parseInt(arr[56]); //loan loss provision
	this.totalGains = parseInt(arr[57]); // sum of gains on AFS and HTM securities
	this.afsGains = parseInt(arr[58]); // gains on AFS securities
	this.htmGains = parseInt(arr[59]); //  "" HTM 

	this.dividendIncome = parseInt(arr[60]); // dividends from subs......

	this.nii = parseInt(arr[61]); // total non interest income
	this.nie = parseInt(arr[62]); // total non interest expense

	this.preTaxIncome = parseInt(arr[63]); //  int inc - int exp - provision + total gains + dividend income + nii - nie
	this.tax = parseInt(arr[64]); //total provision for income taxes

		//other stuff that hits before the final net income
	this.incomeBeforeSubsidiary = parseInt(arr[65]); // net income before roll up sub's income - only applies to y9-sp
	this.subsidiaryEarnings = parseInt(arr[66]); // earnings attributable to BANK subsidiaries
	this.nonRecurring = parseInt(arr[67]); //non recurring charges / gains  net position should be subtracted (a neg would then be added back)
	this.minorityIncome = parseInt(arr[68]); //earnings to the minority interest

	this.netIncome = parseInt(arr[69]); //  pretax income - tax - sub earnings - non recurring - minority interest earnings  = income available to common

	this.subSAdjustedNetIncome = 0;

	this.dividends = parseInt(arr[70]); // dividends declared this period

	//==========================================================================CAPITAL AND MISCELLANEOUS ITEMS==============================================
	this.npl = parseInt(arr[72]); //non-performing loans
	this.coreDeposits = parseInt(arr[73]); // typically reported at bank level - not at y9c level..

		//capital
	this.rwa = parseInt(arr[74]); //risk weighted assets
	this.regCapital = parseInt(arr[75]); //total regulatory capital
	this.leverageAssets = parseInt(arr[76]); //total assets for the leverage ratio

	this.leverageRatio = 0;  //to be calculated later
	this.regCapitalRatio = 0; // ""

	this.balanceCheck = (Math.abs(this.totalAssets - this.totalLiabilitiesAndEquity) <= 2); //error tolerance for rounding on each side
	this.incomeCheck = true;

	//PENDING ADDITIONS - WILL NEED TO UPDATE ARRAY SPLICE LOGIC
	this.netDta = 0 //net dta
	this.netDtl = 0; //net dtl
	this.avgCashAndSecurities = 0;
	this.avgLoans = 0;
	this.avgEarningAssets = 0;
	this.avgIbDeposits = 0;
	this.avgTotalDeposits = 0;
	this.avgTrups = 0;
	this.avgSubDebt = 0;
	this.avgIbLiabilities = 0;
	this.avgEquity = 0;
	this.avgTCE = 0;  //WATCH UNITS - MAY NEED TO CONVERT TO 1000S
	this.intangibleAmort = 0;
	this.dilutedEPS = 0;  //WATCH UNITS  
	this.prefDiv = 0;
	this.nco = 0; //net charge-offs
	this.tangibleEquity = 0; 
	this.commonShares = 0; //WATCH UNITS - MAY NEED TO CONVERT TO 1000S
	this.avgDilutedShares = 0; //WATCH UNITS - MAY NEED TO CONVERT TO 1000S

	this.sharePrice = 0; 

	//==========================================================================SUB - S TAX ADJUSTMENTS======================================================
	if (this.subS === "Yes") {

		this.subSAdjustedNetIncome = this.netIncome * (1 - subSTaxRate);  //may wan to confirm that we don't need to tweak for potential MI, prefered, non-recurring stuff

	}
	else {

		this.subSAdjustedNetIncome = this.netIncome;

	}



	//==========================================================================Y9-C SPECIFIC CALCULATIONS===================================================

	if (this.filerType === "Y9C") {


		//run adjustment calcs for y9-c filers
		this.regCapitalRatio = this.regCapital / this.rwa;	

		//y9-c core deposits is fed in as a ratio of total deposits
		this.coreDeposits = this.totalDeposits * this.coreDeposits / 100;

		//fields that are not in y9c report include:
			/*ii leases
			ii tax exempt loans
			ii tax exempt securities
			ii trading*/

		this.nonRecurring = this.preTaxIncome - this.tax - this.netIncome;   //plug	

		//wait to check income given that non-recurring is a plug setup after data fed into the function
		this.incomeCheck = (Math.abs(this.interestIncome - this.interestExpense + this.nii - this.nie - this.provision + this.totalGains - this.tax - this.nonRecurring - this.netIncome) <=2);
	}


	//==========================================================================Y9-SP SPECIFIC CALCULATIONS==================================================


	if (this.filerType === "Y9SP") {


		//run adjustment calcs for y9-c filers

			//y9-sp doesn't report total liabs - so we will use this to back into a few other liability metrics
		this.totalLiabilities = this.totalLiabilitiesAndEquity - this.totalEquity;

		this.otherLiabs = this.totalLiabilities - this.trups - this.subDebt - this.otherBorrowings - this.tradingLiabilities;

		this.nii = this.nii - this.dividendIncome; //otherwise we would double count down the road

		//if we ever need just the small parent co assets - just use total liabs and capital
		this.balanceCheck = (Math.abs(this.totalEquity - this.totalLiabilitiesAndEquity) <=2);  //only use the right side since consolidated assets on asset side

		//the company can have earnings from non-bank subs and bhc subs, so we will set this = - nonrecurring items
		this.nonRecurring = this.incomeBeforeSubsidiary - this.subsidiaryEarnings - this.netIncome;

	}



	//==========================================================================BANK LEVEL / CALL REPORT SPECIFIC CALCULATIONS===============================

	if (this.filerType === 31 || this.filerType === 41) {


		//run adjustment calcs for y9-c filers
		this.regCapitalRatio = this.regCapital / this.rwa;	

		this.totalSecurities = 	this.treasuries - this.munis - this.foreignSecurities - this.otherSecurities; //must 'sum the parts' to get this number

		this.otherIntangibles = this.otherIntangibles - this.goodwill;  //goodwill is part of the default other intangibles #

		this.otherAssets = this.otherAssets - this.otherIntangibles - this.goodwill;


		this.otherBorrowings = this.totalLiabilities - this.otherLiabs - this.subDebt - this.tradingLiabilities - this.fedFundsAndRepo - this.totalDeposits; //plug


		//large calc to get securities income
		this.iiSecurities = this.iiTreasuries - this.iiMBS - this.iiOtherSecurities - this.iiTaxExemptSecurities;

		this.ieDeposits = this.interestExpense - this.ieFedFundsAndRepo - this.ieSubAndTrups - this.ieOther;

		if (this.netInterestIncome === 0) {
			this.netInterestIncome = this.interestIncome - this.interestExpense; //in case this field 'fails' as NIM is heavily important to model
		}

		this.totalGains = this.afsGains + this.htmGains; //total realized gain = sum of the parts

		//wait to check income given that non-recurring is a plug setup after data fed into the function
		this.incomeCheck = (Math.abs(this.netInterestIncome + this.nii - this.nie - this.provision + this.totalGains - this.tax - this.nonRecurring - this.netIncome) <=2);
	

	}




		//Or do we just factor this into valuations?



	//	other considerations

		//how do we capture / reflect reporting period - this may need to trigger annualzing certain calcs on which data is imported into?

		//need to get ability to grab core deposits somehow at y9-c level

		//DO WE NEED TO PULL IN AVERAGE BALANCES

			//IF SO, TEMPLATED FINANCIALS FROM SNL? UBPR HAS THESE TOO

}

module.exports = bankDataConstructor;