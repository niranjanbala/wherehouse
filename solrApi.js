var https = require('https');
var md5 = require('md5');
var solrApi={
	getRequestParam: function(options){
		var timeStamp=new Date().getTime();
		var requestParam={
		    "search_intent": "rent",
		    "min_inr": options.minRent,
		    "max_inr": options.maxrent,//
		    "house_type": options.houseTypes,
		    "bed_rooms": options.bedRooms,
		    "page": 1,
		    "city": options.cityName,
		    "show_ungrouped_results": 0,//?
		    "physically_verified": 0,//?
		    "bachelors_allowed": "", //?
		    "time_stamp": timeStamp,
		    "request_id": md5(timeStamp),
		    "fetch_max": 1,
		    "number_of_children": "2",
		    "mapBounds": [options.lat1, options.lng1, options.lat2, options.lng2],
		    "srtby": "bestquality",
		    "page_size": 20
			};
			return requestParam;
	},
	getJsonData: function (options, callback) {
		var dataString = JSON.stringify(this.getRequestParam(options));
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': dataString.length
		};
		var requestOptions = {
			host: "www.commonfloor.com",
			path: "/nitro/search/search-results",
			method: "POST",
			headers: headers
		};
		var req = https.request(requestOptions, function(res) {
			res.setEncoding('utf-8');
			var responseString = '';
			res.on('data', function(data) {
				responseString += data;
			});
			res.on('end', function() {
				callback(null, responseString);
			});
		});
		req.on('error', callback);
		req.end(dataString);
	}	
}
module.exports=solrApi;
