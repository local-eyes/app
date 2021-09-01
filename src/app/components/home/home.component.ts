import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { LocationService } from 'src/app/services/location/location.service';
import { MatDialog } from '@angular/material/dialog';
import { PostComponent } from '../post/post.component';
import firestore from "firebase/app";
import { AngularFirestore } from '@angular/fire/firestore';
import { SignInCheckerComponent } from '../sign-in-checker/sign-in-checker.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mobileNavOpened = false;
  title = "Home";
  deviceInfo = null;
  radius:any = 8000;
  nearbyPosts:any;
  cityPosts:any;
  lat:any;
  lon: any;
  city: any;
  neighborhood: any;
  loadComplete:boolean = false;
  cityLoaded = false;
  isMobile = localStorage.getItem('isMobile');
  swipeCoords: any;
  swipeTime: any;
  selectedTabIndex = 0;
  constructor(
    private data: DataService, 
    private location: LocationService, 
    public dialog: MatDialog,
    public af: AngularFirestore,
    public auth: AuthService,
    private clipboard: Clipboard,
    private snackbar: MatSnackBar
    ) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.location.getPosition().then(pos=>
      {
        this.lon = pos.lng;
        this.lat = pos.lat;
        this.getPosts(this.lat, this.lon, this.radius, null);
        this.getCityDynamically(this.lat, this.lon);
        this.getNeighborhoodDynamically(this.lat, this.lon);
      });
  }

  getCityDynamically(lat, lon) {
    this.location.getDynamicCity(lat, lon).subscribe(res => {
      this.log(res);
      this.city = res['results'][0]['address_components'][0]['long_name'];
    })
  }

  getNeighborhoodDynamically(lat, lon) {
    this.location.getDynamicNeighborhood(lat, lon).subscribe(res => {
      this.log(res);
      this.neighborhood = res['results'][0]['address_components'][0]['long_name'];
    })
  }

  getCity (city:string) {
    this.data.getCityPosts(city).subscribe(res => {
      this.cityPosts = res;
    })
  }
  getPosts(latitude, longitude, radius, sortBy) {
    this.loadComplete = false;
    this.data.getNearbyPosts(latitude, longitude, radius, sortBy).subscribe(res => {
      this.nearbyPosts = res;
      this.loadComplete = true;
    })
  }

  log(value) {
    console.log(value);
    
  }
  
  getDate(seconds:number) {
    const postTime = new Date(seconds * 1000);
    const postedOn = postTime.getTime();
    const curr = new Date().getTime();
    const gap = curr - postedOn;

    const sec = 1000;
    const min = sec * 60;
    const hour = min * 60;
    const day = hour * 24;

    const fullDay = Math.floor(gap / day);
    const fullHour = Math.floor((gap % day) / hour);
    const fullMin = Math.floor((gap % hour) / min);

    if (fullDay >= 1) {
      return `${(postTime.toString()).slice(0, -40)}`
    } else if (fullDay <= 0 && fullHour > 0) {
      return `${fullHour} Hours ago`
    } else if (fullHour <= 0 && fullMin > 0) {
      return `${fullMin} Minutes ago`
    } else {
      return `> 1 Minute ago`;
    } 
  }

  openPost(collection:string, postId:string) {
    if (collection === "local") {
      this.dialog.open(PostComponent, {height: "90vh", width: "100vw", data: this.nearbyPosts[postId], hasBackdrop: true});
    } else {
      this.dialog.open(PostComponent, {height: "90vh", width: "100vw", data: this.cityPosts[postId], hasBackdrop: true});
    }
  }

  openSignInChecker() {
    this.dialog.open(SignInCheckerComponent);
  }

  incrementClaps(collection:string, postToIncrease:string, i:number) {
    const incrementor = firestore.firestore.FieldValue.increment(1);
    const postRef = this.af.doc(`${collection}/${postToIncrease}`);
    postRef.update({'content.claps': incrementor});
    if (collection == 'local') {
    this.nearbyPosts[i].content.claps += 1;
    } else {
      this.cityPosts[i].content.claps += 1;
    }
  }

  copyToClipboard(collection: string, id:string) {
    this.snackbar.open("🎉 Copied to Clipboard!", null,{verticalPosition: "top", horizontalPosition: "end", duration: 3000});
    if (location.hostname === "localhost") {
      this.clipboard.copy(`http://localhost:4200/post/${collection}/${id}`);
    } else {
      this.clipboard.copy(`https://local-eyes.tech/app/post/${collection}/${id}`);
    }
  }

  loadData(tabIndex:number) {
    if (tabIndex === 1 && this.cityLoaded == false) {
      this.log(this.city)
      this.getCity(this.city);
      this.cityLoaded = true;
    }
  }

  openLogoutConfirmation() {
    this.dialog.open(SignInCheckerComponent, {data: "logOut"});
  }

  swipe(e: TouchEvent, when: string): void {
    const coords: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoords = coords;
      this.swipeTime = time;
    } else if (when === 'end') {
      const direction = [coords[0] - this.swipeCoords[0], coords[1] - this.swipeCoords[1]]
      const duration = time - this.swipeTime;
      if (duration < 1000 && Math.abs(direction[0]) > 30 && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
        const swipe = direction[0] < 0 ? 'next' : 'previous';
        if (swipe==='next') {
          this.selectedTabIndex = 1;
        } else {
          this.selectedTabIndex = 0;
        }
      }
    }
  }
}
