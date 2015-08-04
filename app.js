// Include the cluster module
var cluster = require('cluster');
// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;
    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
    	cluster.fork();
    }
    // Listen for dying workers
    cluster.on('exit', function (worker) {
      // Replace the dead worker, we're not sentimental
      console.log('Worker ' + worker.id + ' died :(');
      	cluster.fork();
      });
// Code to run if we're in a worker process
} else {
    // Include Express
    var express = require('express');
    var compression = require('compression')
    var bodyParser = require('body-parser');
    // Create a new Express application
    var app = express();
    var path = require('path');

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(compression({filter: shouldCompress}))
    app.set('port', process.env.PORT || 3000);
    function shouldCompress(req, res) {
    	if (req.headers['x-no-compression']) {
    		// don't compress responses with this request header
    		return false
    	}
		  // fallback to standard filter function
		  return compression.filter(req, res)
		}
		app.route('/process').post(function(req, res, next) {
			var turf=require('turf');
			var json=req.body.params;
			var unit='kilometers';
			var intersect=null;
			var somethingWentWrong=false;
			var features=[];
			for(var index in json) {
				var location=json[index].location;
				var point=turf.point([Number(location.lat), Number(location.lng)]);
				features.push(point);
				var buffered = turf.buffer( point, Number(json[index].distance), unit);
				var polygon = turf.polygon(buffered.features[0].geometry.coordinates, {
					"fill": "#6BC65F",
    			"stroke": "#6BC65F",
    			"stroke-width": 5
				});
				if(!intersect){
					intersect=polygon;
				} 
				else {
					var intersection=turf.intersect(intersect, polygon)
					if(intersection){
						intersect = intersection;
					} else {
						somethingWentWrong=true;
					}
				}
				if(!intersect) {
					somethingWentWrong=true;
				}
			}
			if(!somethingWentWrong){
				var square = turf.bboxPolygon(turf.square(turf.extent(intersect)));
				res.json(square);
			} else {
				var points = turf.featurecollection(features);
				if(points.length>2){
					var hull = turf.convex(points);
					res.json(hull);					
				} else {
					res.json(null);
				}
			}
		});
		app.listen(app.get('port'));
		console.log('Worker ' + cluster.worker.id + ' running!');
	}