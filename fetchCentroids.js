var turf=require('turf');
var centerPoint=[ 77.593174, 12.964035];
var cityRadius=25;
var point=turf.point(centerPoint);
var unit = 'kilometers';
var buffered = turf.buffer(point, cityRadius, unit);
var extent = turf.extent(buffered);
var cellWidth = 1;
var units = 'kilometers';
var squareGrid = turf.squareGrid(extent, cellWidth, units);
var array=[];
squareGrid.features.forEach(function(item){
	var centroidPt = turf.centroid(item);
	var coordinates=centroidPt.geometry.coordinates;
	var centerPoint={
  	"__type": "GeoPoint",
  	"latitude": coordinates[1],
  	"longitude": coordinates[0]
	};
	var data={
		centerPoint: centerPoint,
		done: false
	}
	array.push(data);
})
console.log(JSON.stringify(array,null, 4));