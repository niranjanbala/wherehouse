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
    content: "<a>Click to see matching properties.</a>"
});     
function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
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
  controlText.innerHTML = 'Click to See Matching Properties';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    searchInBounds();
  });

}
function openUrl(){
    var defaultSearchIntent="search_intent="+$(".search-intent").val();
    //var selectedBhk=$('#bhk').multipleSelect('getSelects');
    //var selectedAptTypes=$('#aptType').multipleSelect('getSelects');
    var defaultRentParams="&min_inr=5000&max_inr=25000";
    if(defaultSearchIntent=="sale"){
        var defaultRentParams="&min_inr=2000000&max_inr=";
    }
    var defaultBedParams="&bed_rooms="+$(".search-bhk").val();
    var defaultHouseType="&house_type="+$(".search-apt-type").val();
    //var minRent=$('input[data-rule="minRent"').val();
    //var maxRent=$('input[data-rule="maxRent"').val();
    //if(minRent && maxRent){
        //defaultRentParams="&min_inr="+minRent+"&max_inr="+maxRent;
    //}
    //if(selectedBhk.length>0){
        //defaultBedParams="&bed_rooms="+selectedBhk.join(",");
    //}
    //if(selectedAptTypes.length>0) {
        //defaultHouseType="&house_type="+selectedAptTypes.join(",");
    //}
    var url="https://www.commonfloor.com/listing-search?"+defaultSearchIntent+"&page=1&city="+cityList[selectedCityIndex].cfCityName+
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
    console.log(url);
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
        if(cityIndex>=0) {
            if( $('#city').val()==cityList[cityIndex].name){
                locations[index]=place.geometry.location;
                cityListSelected[index]=cityIndex;                
            } else {
                locations[index]=null;
                cityListSelected[index]=null;
                alert("Please enter location within the city selected");
            }
        }
    });
}
function initialize() {
    /*$('select').multipleSelect({
            width: '80%'
    });*/
    var styles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"visibility":"off"},{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#8b8b8b"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#8b8b8b"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#8b8b8b"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#8b8b8b"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}];
    var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

    var mapOptions = {
        center: new google.maps.LatLng(12.9539974,77.6268196),
        scrollwheel: false,
        disableDefaultUI: true,
        zoom: 12,
        minZoom:12,
        maxZoom:16,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };
    var map = new google.maps.Map($('#map')[0], mapOptions);
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');    
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
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
    $('.nl-submit').click(function(){        
        var params=$('select.nlform-select.distance').map(function() {
         return { distance: $(this).val()};
        }).get();
        console.log(params);
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
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
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
        map: map,
        strokeColor: 'white',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'white',
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
  polygon.setMap(map);   
  var bounds=polygon.getBounds();
  map.fitBounds(bounds);
}
function searchInBounds(){
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
        CF_RESULT=dataArray.splice(0,5);    
        openUrl();
    }
  });
}
google.maps.event.addDomListener(window, 'load', initialize);