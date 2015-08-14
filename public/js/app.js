var locations=[];
var CF_RESULT;
var cityListSelected=[];
var polygon;
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
var infoWindow = new google.maps.InfoWindow({
    content: "<a href='#'' id='test' onclick='testClick()''>Click to see properties.</a>"
});     
function testClick(){
    var selectedBhk=$('#bhk').multipleSelect('getSelects');
    var selectedAptTypes=$('#aptType').multipleSelect('getSelects');
    var defaultRentParams="&min_inr=5000&max_inr=25000";
    var defaultBedParams="&bed_rooms=1,2";
    var defaultHouseType="&house_type=Apartments,House";
    var minRent=$('input[data-rule="minRent"').val();
    var maxRent=$('input[data-rule="maxRent"').val();
    if(minRent && maxRent){
        defaultRentParams="&min_inr="+minRent+"&max_inr="+maxRent;
    }
    if(selectedBhk.length>0){
        defaultBedParams="&bed_rooms="+selectedBhk.join(",");
    }
    if(selectedAptTypes.length>0) {
        defaultHouseType="&house_type="+selectedAptTypes.join(",");
    }
    var url="https://www.commonfloor.com/listing-search?search_intent=rent&page=1&city="+cityList[selectedCityIndex].cfCityName+
    "&use_pp=0&set_pp=0&fetch_max=1&number_of_children=2&page_size=20&polygon=1&mapBounds=";
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
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        var cityIndex=findCity(place);
        locations[index]=place.geometry.location;
        cityListSelected[index]=cityIndex;
    });
}
function initialize() {
    $('select').multipleSelect({
            width: '80%'
    });
    var mapOptions = {
        center: new google.maps.LatLng(12.9539974,77.6268196),
        scrollwheel: false,
        zoom: 12,
        minZoom:12,
        maxZoom:16
    };
    var map = new google.maps.Map($('#map-canvas')[0], mapOptions);
    //var d=google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(12, 77), new google.maps.LatLng(12, 77.02));
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
    $('.pure-button').click(function(){

        var params=$('.pac-input[data-rule="quantity"').map(function() {
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
        if(filtered.length==0) {return;}
        selectedCityIndex=filtered[0].cityIndex;
        ga('send', '_trackEvent','Where_House', 'click', JSON.stringify(filtered));                
        $.post( "/process", { params: filtered})
          .done(function( data ) {
            if(data){
                var features=map.data.addGeoJson(data);                        
                map.data.forEach(function(feature) {
                    processPoints(map, feature.getGeometry());
                });
                features.forEach(function(feature){
                    map.data.remove(feature);
                })
            } else {
                alert("Sorry! you are a hard person to satisfy :)");
                if(polygon) {
                    infoWindow.setMap(null);
                    polygon.setMap(null);
                }
            }
        });
    });
}
var polygon;
if (!google.maps.Polygon.prototype.getBounds) {
  google.maps.Polygon.prototype.getBounds=function(){
      var bounds = new google.maps.LatLngBounds()
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
        map: map,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.3
      }); 
    google.maps.event.addListener(polygon, 'mousemove', function(event){
        if(selectedCityIndex>=0) {
            infoWindow.setPosition(event.latLng);
            infoWindow.open(map);
        }
    });
  }          
  polygon.setPath(paths);
  polygon.setMap(map);          
  var bounds=polygon.getBounds();
  var ne=bounds.getNorthEast();
  var sw=bounds.getSouthWest();
  var cityName=cityList[selectedCityIndex].cfCityName;
  $.post( "/location", { 
    cityName: cityName,
    lat1:sw.lat(),
    lng1:sw.lng(),
    lat2:ne.lat(),
    lng2:ne.lng()
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
        CF_RESULT=dataArray.splice(0,3);    
    }
  });
  map.fitBounds(bounds);
}
google.maps.event.addDomListener(window, 'load', initialize);