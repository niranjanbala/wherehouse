var turf=require('turf');
var mumbai=[72.949869,19.105610];
var bangalore=[ 77.593174, 12.964035];
var delhi=[ 77.269,28.643];
var centerPoint=delhi;
var cityRadius=30;
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
		city: 'delhi',
		done: false
	}
	array.push(data);
})
console.log(JSON.stringify({
	"results": array
},null, 4));