import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the PostserviceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PostserviceProvider {



  constructor(
    public http: HttpClient
  ) {
    console.log('Hello PostserviceProvider Provider');
  }

  // postMobileReport(data: any) {
  //   return new Promise((resolve, reject) => {
  //     this.http.post(this.url + '/udsafe_mobile_report.php', data).subscribe((res: any) => {
  //       resolve(res)
  //     }, (error) => {
  //       reject(error)
  //     })
  //   })
  // }

  getPostcode(lon: number, lat: number) {
    return new Promise((resolve, reject) => {
      this.http.get('http://119.59.125.191/geoserver/postcode/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=postcode:postcode_db&CQL_FILTER=INTERSECTS(geom%2CPoint(' + lon + '%20' + lat + '))&outputFormat=application%2Fjson').subscribe((res: any) => {
        resolve(res)
      }, error => {
        reject(error)
      })
    })

  }

}
