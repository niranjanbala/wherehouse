var locations=[];
var CF_RESULT;
var cityListSelected=[];
var polygon;
var circle;
var selectedCityIndex=-1;
var cityList=[{
    name: 'Bengaluru',
    cfCityName: "Bangalore"
},{
    name: 'Chennai',
    cfCityName: "Chennai"
},{
    name: 'Pune',
    cfCityName: "Pune"
},{
    name: 'Mumbai',
    cfCityName: "Mumbai"
},{
    name: 'Hyderabad',
    cfCityName: "Hyderabad"
},{
    name: 'Kolkata',
    cfCityName: 'Kolkata'
},
{
    name: 'Delhi',
    cfCityName: 'Delhi-NCR'
},
{
    name: 'Gurgaon',
    cfCityName: 'Delhi-NCR'
},
{
    name: 'Noida',
    cfCityName: 'Delhi-NCR'
}
];   
//var host="http://lookingforhouse.in";
var host="";
var infoWindow = new google.maps.InfoWindow({
    content: "<a>Click to see matching properties.</a>"
});     
function toCf () {
    ga('send', 'event','to_cf_click', 'click', $(".mapBoxA").attr('href'));
}
function CenterControl(controlDiv, map, link) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#49CAA0';
  // controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to See Matching Properties';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = "<a class='mapBoxA' onclick='toCf()' target='_blank' href='"+link+"'>Click to See Matching Properties</a>";
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    //searchInBounds();
  });

}
var isThousand = /^\d+K$/;
var isLakh = /^\d+L$/;
var isCrore = /^\d+CR$/;
function getDefaultMinValue (search_intent, bhk) {
    if(search_intent=='rent') {       
        switch(bhk) {
            case "1":
                return ""; 
            case "2":
                return "10000";
            case "3":
                return "20000";
        }    
    } else if(search_intent=='sale') {
        switch(bhk) {
            case "1":
                return "500000"; 
            case "2":
                return "2500000"
            case "3":
                return "4000000";
        }
    }
}
function getDefaultMaxValue (search_intent, bhk) {
    if(search_intent=='rent') {       
        switch(bhk) {
            case "1":
                return "10000"; 
            case "2":
                return "20000";
            case "3":
                return "";
        }    
    } else if(search_intent=='sale') {
        switch(bhk) {
            case "1":
                return "2500000"; 
            case "2":
                return "5000000"
            case "3":
                return ""
        }
    }
}
function openUrl(){
    var defaultSearchIntent="search_intent="+$(".search-intent").val();
    //var selectedBhk=$('#bhk').multipleSelect('getSelects');
    //var selectedAptTypes=$('#aptType').multipleSelect('getSelects');
    var defaultRentParams="";
    var minRange=$(".minrange").val().toUpperCase();
    var maxRange=$(".maxrange").val().toUpperCase();
    var defaultMinValue=getDefaultMinValue($(".search-intent").val(),$(".search-bhk").val());
    var defaultMaxValue=getDefaultMaxValue($(".search-intent").val(),$(".search-bhk").val());
    defaultRentParams="&min_inr="+defaultMinValue+"&max_inr="+defaultMaxValue;
    var defaultBedParams="&bed_rooms="+$(".search-bhk").val();
    var defaultHouseType="&house_type="+$(".search-apt-type").val();

    var url="https://www.commonfloor.com/listing-search?"+defaultSearchIntent+"&page=1&city="+cityList[selectedCityIndex].cfCityName+
    "&use_pp=0&set_pp=0&fetch_max=1&number_of_children=2&page_size=20&polygon=1&physically_verified=1&mapBounds=";
    var ne=polygon.getBounds().getNorthEast();
    var sw=polygon.getBounds().getSouthWest();
    url+=sw.lat()+","+sw.lng()+","+ne.lat()+","+ne.lng();
    url+=defaultRentParams;
    url+=defaultBedParams;
    url+=defaultHouseType;
    if(CF_RESULT){                
        var nameArray = Object.keys(CF_RESULT).map(function(k){return CF_RESULT[k].name});
        var idArray = Object.keys(CF_RESULT).map(function(k){return CF_RESULT[k].id});
        url+="&prop_name="+nameArray.join(",");
        url+="&property_location_filter="+idArray.join(",");
    }
    ga('send', 'event','to_cf_dialog', 'click', url);
    window.open(url);
}
function compare(a,b) {
            if(a.count==b.count)
                return 0;
            else if(a.count>b.count){
                return -1;
            } else {
                return 1;
            }
}
function findCity(place){            
    var index=-1;
    cityList.forEach(function(city, ci){
        if(place.formatted_address.indexOf(city.name)>=0) {
            index=ci;
        }                
    });
    cityList.forEach(function(city, ci){
        if(place.name.indexOf(city.name)>=0) {
            index=ci;
        }                
    });
    return index;
}
function setAutoCompleteListener(autocomplete, index){
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();                
        if (!place.geometry) {
            locations[index]=null;
            cityListSelected[index]=null;
            sweetAlert("Oops...", "Invalid location selected", "error");
            //window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        var cityIndex=findCity(place);
        if(cityIndex>=0) {
            if( $('#city').val()==cityList[cityIndex].name){
                locations[index]=place.geometry.location;
                cityListSelected[index]=cityIndex;                
            } else {
                locations[index]=null;
                cityListSelected[index]=null;
                sweetAlert("Oops...", "Please enter location within the city selected", "error");
                //alert("Please enter location within the city selected");
            }
        }
    });
}
function createLink (map) {
    var centerControlDiv = document.createElement('div');
    //var link='/smart-search?qs=';
    var att = document.createAttribute("class");       // Create a "class" attribute
    att.value = "democlass";                           // Set the value of the class attribute
    centerControlDiv.setAttributeNode(att);
    var bounds=polygon.getBounds();
    var ne=bounds.getNorthEast();
    var sw=bounds.getSouthWest();
    var cityName=cityList[selectedCityIndex].cfCityName;
    var defaultMinValue=getDefaultMinValue($(".search-intent").val(),$(".search-bhk").val());
    var defaultMaxValue=getDefaultMaxValue($(".search-intent").val(),$(".search-bhk").val());
    var params={ 
        cityName: cityName,
        lat1: sw.lat(),
        lng1: sw.lng(),
        lat2: ne.lat(),
        lng2: ne.lng(),
        min_inr: defaultMinValue,
        max_inr: defaultMaxValue,
        search_intent: $(".search-intent").val(),
        bedRooms: [$(".search-bhk").val()],
        houseTypes: $(".search-apt-type").val()
    };
    var link=host+'/smart-search?qs='+JSON.stringify(params,null, 0);
    var centerControl = new CenterControl(centerControlDiv, map, link);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}
var map;
function saveUserFilters (locations) {
    Parse.initialize("6ZVMxs4v7FWwTBJ7RdSWIws8T0F2mfPVZ1gELmxZ", "YcWTu3cqBLiG1Cc8V2UymEhGphtATQZ5nZ2KPFj8");
    var UserFilter = Parse.Object.extend("UserFilter");
    var userFilter = new UserFilter();
    userFilter.set("age",$(".age").val());
    userFilter.set("gender",$(".gender").val());
    userFilter.set("relationship",$(".relationship-status").val());
    userFilter.set("livingWith",$(".living-with").val());
    userFilter.set("intent",$(".search-intent").val());
    userFilter.set("bhk",$(".search-bhk").val());
    userFilter.set("city",$('#city').val());
    userFilter.set("locations",locations);    
    userFilter.save(null, {

      success: function(userFilter) {
        console.log("Done");
      },
      error: function(userFilter, error) {
        console.log("Error"+error.message);
      }
    });
}
function initialize() {
    var styles = [{stylers:[{visibility:"off"}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{visibility:"on"},{color:"#8f9190"},{weight:0.5}]},{featureType:"landscape.man_made",stylers:[{visibility:"off"}]},{featureType:"landscape",elementType:"geometry.fill",stylers:[{visibility:"on"},{color:"#4b4b4a"}]},{featureType:"administrative.country",elementType:"labels.text.fill",stylers:[{visibility:"on"},{color:"#dedede"}]},{featureType:"administrative.province",elementType:"labels.text.fill",stylers:[{visibility:"on"},{color:"#3d3e3d"}]},{featureType:"administrative.locality",elementType:"labels.text.fill",stylers:[{visibility:"on"},{color:"#cccccc"}]},{featureType:"administrative.locality",elementType:"labels.text.stroke",stylers:[{visibility:"off"}]},{featureType:"water",stylers:[{visibility:"on"},{color:"#27231f"}]},{featureType:"road",elementType:"labels.text.fill",stylers:[{visibility:"on"},{color:"#dddddd"}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{visibility:"on"},{color:"#9b9b9b"},{weight:1.1}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{visibility:"on"},{weight:0.9},{color:"#a7a7a7"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{visibility:"off"},{weight:0.5},{color:"#8f9190"}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{visibility:"on"},{color:"#8f9190"},{weight:0.5}]},{featureType:"road.arterial",elementType:"labels.icon",stylers:[{visibility:"on"},{invert_lightness:true}]},{featureType:"road.arterial",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"administrative.land_parcel",stylers:[{visibility:"off"}]},{featureType:"administrative.neighborhood",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road"}];
    var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});    
    var mapOptions = {
        center: new google.maps.LatLng(12.9539974,77.6268196),
        scrollwheel: false,
        draggable: false, 
        scrollwheel: false,
        panControl: false,
        streetViewControl: false,
        //disableDefaultUI: true,
        zoom: 12,
        minZoom:12,
        maxZoom:16,
        /*mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }*/
    };
    map = new google.maps.Map($('#map')[0], mapOptions);
    //map.mapTypes.set('map_style', styledMap);
    //map.setMapTypeId('map_style');    
    $('.controls.pac-input').each(function(index){
        locations.push(null);
        cityListSelected.push(null);
        var autoOptions = {
            types: ["geocode"]
        };
        var options = {            
            componentRestrictions: {country: 'in'}
        };
        var autocomplete = new google.maps.places.Autocomplete($(this)[0],options);
        setAutoCompleteListener(autocomplete, index);
    });
    $('.nl-submit').click(function() {
        var params=$('select.nlform-select.distance').map(function() {
         return { distance: $(this).val()};
        }).get();
        locations.forEach(function(item, index){
            if(item) {                        
                params[index].location={lat:item.lat(), lng:item.lng()};
                params[index].cityIndex=cityListSelected[index]
            }
        });    
        var skipNullLocations=function(obj){
            return obj.location!=null;
        }
        var filtered=params.filter(skipNullLocations);
        if(filtered.length==0) {
            sweetAlert("Oops...", "Please select at-least one location", "error");
            //alert("Please select at-least one location");
            return;
        }
        selectedCityIndex=filtered[0].cityIndex;
        ga('send', 'event','where_house', 'click', JSON.stringify(filtered));
        $.post( host+"/process", { params: filtered})
          .done(function( data ) {
            saveUserFilters(filtered);
            if(data){
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
                var features=map.data.addGeoJson(data);                        
                map.data.forEach(function(feature) {
                    processPoints(map, feature.getGeometry());
                });
                features.forEach(function(feature){
                    map.data.remove(feature);
                })
                createLink(map);
            } else {
                swal("Sorry! you are a hard person to satisfy :)")
                //alert("Sorry! you are a hard person to satisfy :)");
                if(polygon) {
                    infoWindow.setMap(null);
                    polygon.setMap(null);
                }
            }
        });
        return false;
    });
    
}
var polygon;
if (!google.maps.Polygon.prototype.getBounds) {
  google.maps.Polygon.prototype.getBounds=function(){
      var bounds = new google.maps.LatLngBounds();      
      this.getPath().forEach(function(element,index){bounds.extend(element)})
      return bounds;
  }
}
function processPoints(map, geometry) {
  var paths=[];
  geometry.getArray()[0].getArray().forEach(function(g) {
    paths.push(new google.maps.LatLng(g.lng(), g.lat()));
  });
  if(!polygon) {
      polygon=new google.maps.Polygon({
        strokeColor: '#2191B1',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2191B1',
        fillOpacity: 0.3
      }); 
      circle=new google.maps.Polygon({
        map: map,
        strokeColor: '#2191B1',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2191B1',
        fillOpacity: 0.3
      });
    google.maps.event.addListener(polygon, 'click', function(event){
        searchInBounds();
    });
    google.maps.event.addListener(polygon, 'mousemove', function(event){
        if(selectedCityIndex>=0) {
            //infoWindow.setPosition(event.latLng);
            //infoWindow.open(map);
        }
    });
  }          
  polygon.setPath(paths);
  var bounds=polygon.getBounds();
  var center=bounds.getCenter();
  var radiusInMeter=getRadius(bounds);
  var pathCircle=drawCircle(center, kmToMiles(radiusInMeter / 1000), 1);
  circle.setPaths(pathCircle);
  circle.setMap(map);
  map.fitBounds(bounds);
}
function getRadius(bounds){
    var center = bounds.getCenter();
    var ne = bounds.getNorthEast();

    // r = radius of the earth in statute miles
    var r = 3963.0;  

    // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
    var lat1 = center.lat() / 57.2958; 
    var lon1 = center.lng() / 57.2958;
    var lat2 = ne.lat() / 57.2958;
    var lon2 = ne.lng() / 57.2958;

    // distance = circle radius from center to Northeast corner of bounds
    var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    return dis*1000;
}
function kmToMiles(kilometres) {
        var miles = Number(kilometres) * .62;
        return miles.toFixed(2);
}
function drawCircle(point, radius, dir) {
        var d2r = Math.PI / 180; // degrees to radians 
        var r2d = 180 / Math.PI; // radians to degrees 
        var earthsradius = 3963; // 3963 is the radius of the earth in miles

        var points = 32;

        // find the raidus in lat/lon 
        var rlat = (radius / earthsradius) * r2d;
        var rlng = rlat / Math.cos(point.lat() * d2r);

        var extp = new Array();
        if (dir == 1) {
            var start = 0;
            var end = points + 1; // one extra here makes sure we connect the path
        } else {
            var start = points + 1;
            var end = 0;
        }
        for (var i = start;
            (dir == 1 ? i < end : i > end); i = i + dir) {
            var theta = Math.PI * (i / (points / 2));
            var ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta) 
            var ex =  point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta) 
            extp.push(new google.maps.LatLng(ex, ey));
        }
        return extp;
}
function searchInBounds() {
  var bounds=polygon.getBounds();
  var ne=bounds.getNorthEast();
  var sw=bounds.getSouthWest();
  var cityName=cityList[selectedCityIndex].cfCityName;
  var minRange=$(".minrange").val().toUpperCase();
  var maxRange=$(".maxrange").val().toUpperCase();
    
    if($(".search-intent").val()=="sale"){
        var defaultMinValue="2000000";
        var defaultMaxValue="";        
        if(minRange.match(isLakh)){
            defaultMinValue=Number(minRange.replace("L",""))*100000;
        }
        if(minRange.match(isCrore)){
         defaultMinValue=Number(minRange.replace("CR",""))*10000000;   
        }
        if(maxRange.match(isLakh)){
            defaultMaxValue=Number(maxRange.replace("L",""))*100000
        }
        if(maxRange.match(isCrore)){
         defaultMaxValue=Number(maxRange.replace("CR",""))*10000000;      
        }
    } else {
        var defaultMinValue="10000";
        var defaultMaxValue="25000";
        if(minRange.match(isThousand)){
            defaultMinValue=Number(minRange.replace("K",""))*1000;
        }
        if(maxRange.match(isThousand)){
            defaultMaxValue=Number(maxRange.replace("K",""))*1000;
        }
    }  
  $.post( host+"/location", { 
    search_intent: $(".search-intent").val(),
    cityName: cityName,
    min_inr: defaultMinValue,
    max_inr: defaultMaxValue,
    lat1:sw.lat(),
    lng1:sw.lng(),
    lat2:ne.lat(),
    lng2:ne.lng(),
    bedRooms: [$(".search-bhk").val()],
    houseTypes: $(".search-apt-type").val()
  }).done(function( data ) {
    var obj={};
    if(data.status=="success"){
        var totalResults=data.result_count;
        data.data.forEach(function(item){
            if(item.children && item.children.length>0){                        
                var name= item.children[0].listing_area;
                var isRoad=name.toLowerCase().indexOf('road');
                var id= item.children[0].listing_area_id;
                if(isRoad==-1){
                    if(!obj["area_"+id]) {
                        obj["area_"+id]={
                            id: "area_"+id,
                            name:name, 
                            count:1
                        };
                    }
                    else{
                        obj["area_"+id].count=obj["area_"+id].count+1;
                    }
                }
            }                    
        })                
        var dataArray = Object.keys(obj).map(function(k){return obj[k]});
        dataArray.sort(compare);
        CF_RESULT=dataArray.splice(0,5);    
        openUrl();
    }
  });
}
google.maps.event.addDomListener(window, 'load', initialize);