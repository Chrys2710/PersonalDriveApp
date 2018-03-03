import { Component } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation';
import { DateTime } from 'ionic-angular/components/datetime/datetime';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  speed: number = 0;
  time: string;
  refDateTime : Date = new Date();
  
  interval: number = 10;

  apiCalled: number = 0;
  debugString: string = "";

  constructor(private geolocation: Geolocation) {

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

      if ((currentdate.getTime() - this.refDateTime.getTime() > this.interval*1000) && this.speed > 50) {        
        this.debugString += '<p style="color : blue;">call speed API</p>';
        this.refDateTime = currentdate;
        this.apiCalled ++;
      }

      this.debugString += "<hr>";
      
      this.speed = data.coords.speed;
    });  
  }

  addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }
}
