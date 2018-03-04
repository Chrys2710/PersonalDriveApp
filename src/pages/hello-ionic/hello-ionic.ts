import { Component } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation';
import { DateTime } from 'ionic-angular/components/datetime/datetime';
import { HTTP } from '@ionic-native/http';
import { UserAgent } from '@ionic-native/user-agent';
import { Vibration } from '@ionic-native/vibration';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  speed: number = 0;
  speedLimit: number = 0;
  time: string;
  refDateTime : Date = new Date();
  
  interval: number = 3;

  apiCalled: number = 0;
  debugString: string = "";

  constructor(private geolocation: Geolocation, private http: HTTP, private userAgent: UserAgent, private vibration: Vibration) {

  }

  startProcess () {
    //this.debugString += "<p>Start process</p>";
    
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

      //this.debugString += "<p>Subscribe at "+ time +" : </p>";
      //this.debugString += "<p>data.coords.latitude:  "+ data.coords.latitude +"</p>";
      //this.debugString += "<p>data.coords.longitude:  "+ data.coords.longitude +"</p>";
      //this.debugString += "<p>data.coords.speed:  "+ data.coords.speed +" : </p>";

      //Need to check speed limit
      if ((currentdate.getTime() - this.refDateTime.getTime() > this.interval*1000) && this.speed > 25) {        
        //this.debugString += '<p style="color : blue;">call speed API</p>';
        this.refDateTime = currentdate;
        this.apiCalled ++;
        
        this.callSpeedApi(data.coords.latitude, data.coords.longitude, this.speed);
      }

      //this.debugString += "<hr>";
      
      this.speed = data.coords.speed;
    });  
  }

  addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }

  callSpeedApi (lat, lon, currentSpeed) {

    //this.debugString += "<p>In call Speed API</p>";

    var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lon;
    this.http.get(url, {}, {"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"})
    .then(data => {

      var json = JSON.parse(data.data);

      //this.debugString += "<p>data.data.osm_id: "+ JSON.stringify(json.osm_id) +"</p>";

      if (json.osm_id != "" && json.osm_id != null && json.osm_id != "undefined") {
        var url = "http://overpass-api.de/api/interpreter?data=[out:json];way("+ json.osm_id +");out;";
        this.http.get(url, {}, {})
        .then(data => {

          var jsonRoadData = JSON.parse(data.data);

          //this.debugString += "<p>jsonRoadData: "+ JSON.stringify(jsonRoadData.elements) +"</p>";
          //this.debugString += "<p>jsonRoadData max speed: "+ JSON.stringify(jsonRoadData.elements[0].tags.maxspeed) +"</p>";
          this.speedLimit = jsonRoadData.elements[0].tags.maxspeed;

          var overSpeed = currentSpeed - this.speedLimit;
          switch (true)
          {
            case overSpeed > 5 && overSpeed <= 20:
              this.vibration.vibrate([500,500,500]);
              break;
            case overSpeed > 20 && overSpeed <= 30:
              this.vibration.vibrate([1000,500,1000]);
              break;
            case overSpeed > 30 && overSpeed <= 40:
              this.vibration.vibrate([2000,500,2000]);
              break;
            case overSpeed > 40 && overSpeed <= 50:
              this.vibration.vibrate([3000,500,3000]);
              break;
            default:
              this.vibration.vibrate(0);
              break;
          }
        })
        .catch(error => {
          this.debugString += "<p>2nd Http error: "+ JSON.stringify(error) +"</p>";
        });
      }
    })
    .catch(error => {      
      this.debugString += "<p>1st Http error: "+ JSON.stringify(error) +"</p>";
    });
  }
}
