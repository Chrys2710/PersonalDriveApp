import { Component } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation';
import { DateTime } from 'ionic-angular/components/datetime/datetime';
import { HTTP } from '@ionic-native/http';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  speed: number = 0;
  time: string;
  refDateTime : Date = new Date();
  
  interval: number = 3;

  apiCalled: number = 0;
  debugString: string = "";

  constructor(private geolocation: Geolocation, private http: HTTP) {

  }

  startProcess () {
    this.debugString += "<p>Start process</p>";
    
    let options = {
      enableHighAccuracy: true
    };

    let watch = this.geolocation.watchPosition(options);
    watch.subscribe((data) => {
      
      var currentdate = new Date(); 
      var time = currentdate.getDate() + "/"
              + (currentdate.getMonth()+1)  + "/" 
              + currentdate.getFullYear() + " @ "  
              + this.addZero(currentdate.getHours()) + ":"  
              + this.addZero(this.addZero(currentdate.getMinutes()) + ":" 
              + currentdate.getSeconds());

      this.time = time;

      this.debugString += "<p>Subscribe at "+ time +" : </p>";
      this.debugString += "<p>data.coords.latitude:  "+ data.coords.latitude +"</p>";
      this.debugString += "<p>data.coords.longitude:  "+ data.coords.longitude +"</p>";
      this.debugString += "<p>data.coords.speed:  "+ data.coords.speed +" : </p>";

      //Need to check speed limit
      if ((currentdate.getTime() - this.refDateTime.getTime() > this.interval*1000) && this.speed > 25) {        
        this.debugString += '<p style="color : blue;">call speed API</p>';
        this.refDateTime = currentdate;
        this.apiCalled ++;
      }

      this.debugString += "<hr>";
      
      this.speed = data.coords.speed;

      this.callSpeedApi(48.909309, 1.294823);
    });  
  }

  addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }

  callSpeedApi (lat, lon) {
    var url = "http://nominatim.openstreetmap.org/reverse?format=json&lat="+ lat +"&lon="+ lon;
    this.http.get(url, {}, {})
    .then(data => {

      console.log(data.status);
      console.log(data.data); // data received by server
      console.log(data.headers);

      console.log(data.data.osm_id);
      this.debugString += "<p>data.data: "+ JSON.stringify(data.data) +"</p>";
      this.debugString += "<p>data.data.osm_id: "+ JSON.stringify(data.data.osm_id) +"</p>";

      if (data.data.osm_id != "") {
        var url = "http://overpass-api.de/api/interpreter?data=[out:json];way("+ data.data.osm_id +");out;";
        this.http.get(url, {}, {})
        .then(data => {

          console.log(data.status);
          console.log(data.data); // data received by server
          console.log(data.headers);

          console.log(data.data.osm_id);
          this.debugString += "<p>data.data: "+ JSON.stringify(data.data) +"</p>";
          this.debugString += "<p>data.data.elements: "+ JSON.stringify(data.data.elements) +"</p>";

        })
        .catch(error => {

          console.log(error.status);
          console.log(error.error); // error message as string
          console.log(error.headers);

        });
      }
    })
    .catch(error => {

      console.log(error.status);
      console.log(error.error); // error message as string
      console.log(error.headers);

    });
    //http://nominatim.openstreetmap.org/reverse?format=json&lat=53.95090&lon=-6.37792

    //http://overpass-api.de/api/interpreter?data=[out:json];way(144887813);out;
  }
}
