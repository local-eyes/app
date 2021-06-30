import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  prodURL: string = "https://us-central1-localeyes-95d0d.cloudfunctions.net/localEyesFunctions";
  devURL: string = "http://localhost:5001/localeyes-95d0d/us-central1/localEyesFunctions";
  constructor(private http: HttpClient) { }

  getNearbyPosts(lat, lon, radius, sortBy) {
    let params = new HttpParams()
    .set('lat', lat)
    .set('lon', lon)
    .set('radius', radius)
    .set('sortBy', sortBy)
    console.log(`${this.prodURL}/getNearbyPosts, ${params}`);
    
    return this.http.get(`${this.prodURL}/getNearbyPosts`, {params})
  }

  getCityPosts(city) {
    let params = new HttpParams()
    .set('city', city)
    console.log(`${this.prodURL}/getCityPosts, ${params}`);
    return this.http.get(`${this.prodURL}/getCityPosts`, {params})
  }

  getAnswers(postId: string) {
    let params = new HttpParams()
    .set('postId', postId)

    return this.http.get(`${this.prodURL}/answers`, {params})
  }
}
