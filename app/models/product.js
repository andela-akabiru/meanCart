var mongoose = require('mongoose'),
		Category = require('./category'),
		fx = require('./fx');

var productSchema ={
	name : {
		type : String,
		required : true
	},
	// pictures must start with 'http://'
	pictures : [{
		type : String,
		match : /^http:\/\//i
	}],
	price : {
		amount : {
			type : Number,
			required : true,
			set : function( val ) {
				this.internal.approximatePriceUSD = 
					val / ( fx()[this.price.currency] || 1 );
				return val;
			}
		},
		// only three supported currencies for now
		currency : {
			type : String,
			enum : ['USD', 'EUR', 'GBP'],
			required : true,
			set : function( val ) {
				this.internal.approximatePriceUSD = 
					this.price.amount / ( fx()[val] ||  1 );
				return val;
			}
		}
	},
	category : Category.categorySchema,
	internal : {
		approximatePriceUSD : Number
	}
};

var schema = new mongoose.Schema( productSchema );

var currencySymbols = {
	'USD' : '$',
	'EUR' : '€',
	'GBP' : '£'
};

// Human-readable string form by virtuals
schema.virtual('displayPrice').get(function() {
	return currencySymbols[this.price.currency] +
		'' + this.price.amount;
});

// Activate virtuals
schema.set( 'toObject', { virtuals : true });
schema.set( 'toJSON', { virtuals : true });

// export the schema object
module.exports = schema;
module.exports.productSchema = productSchema;