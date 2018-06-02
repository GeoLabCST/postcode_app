import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController, AlertController, Modal } from 'ionic-angular';
import * as L from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import { LayerPage } from '../layer/layer';
import { HttpClient } from '@angular/common/http';
import { PostserviceProvider } from '../../providers/postservice/postservice';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public map: L.map;
  public marker: L.marker;
  public pos: number[];
  private lat: number = 0;
  private lon: number = 0;

  // attribute
  private db: any;
  private id: any;
  private postcode: any;

  //lyrGroup
  private lyrGroup: any;
  private lyrBase: any;

  //lyrs
  private postcodeLyr: any;
  private roads: any;
  private satellite: any;
  private hybrid: any;
  private terrain: any;

  constructor(
    public navCtrl: NavController,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private postserviceProvider: PostserviceProvider,
    private alertCtrl: AlertController
  ) {

  }

  ionViewDidLoad() {
    this.loadMap();
  }

  loadMap() {
    this.map = L.map('map', {
      center: [13.0390905, 101.490104],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    })

    // h = roads only; m = standard roadmap; p = terrain; r = somehow altered roadmap; s = satellite only; t = terrain only; y = hybrid;

    this.roads = L.tileLayer('http://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    this.satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    this.hybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    this.terrain = L.tileLayer('http://{s}.google.com/vt/lyrs=t,m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    // overlay   

    this.postcodeLyr = L.tileLayer.wms("http://119.59.125.191/geoserver/postcode/wms?", {
      layers: 'postcode:postcode_db',
      format: 'image/png',
      transparent: true,
      zIndex: 5
    });

    this.lyrGroup = {
      lyr: [
        { name: 'ขอบเขตไปรษณีย์', lyr: 'postcodeLyr', wms: this.postcodeLyr.addTo(this.map), type: 'overlay', 'isChecked': true },
        // { name: 'ขอบเขตอำเภอ', lyr: 'ud_amp', wms: this.ud_amp.addTo(this.map), type: 'overlay', 'isChecked': true },
        // { name: 'ขอบเขตตำบล', lyr: 'ud_tam', wms: this.ud_tam.addTo(this.map), type: 'overlay', 'isChecked': true },
        { name: 'แผนที่ถนน', lyr: 'roads', wms: this.roads.addTo(this.map), type: 'base', 'isChecked': false },
        { name: 'แผนที่ภาพดาวเทียม', lyr: 'satellite', wms: this.satellite, type: 'base', 'isChecked': false },
        { name: 'แผนที่ผสม', lyr: 'hybrid', wms: this.hybrid, type: 'base', 'isChecked': false },
        { name: 'แผนที่ภูมิประเทศ', lyr: 'terrain', wms: this.terrain, type: 'base', 'isChecked': true },
      ]
    }

    // L.control.layers(baseLayers, overlay, { position: 'topright' }).addTo(this.map);

    this.map.on("click", (e) => {
      this.pos = [e.latlng.lat, e.latlng.lng];
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;

      if (this.marker !== undefined) {
        this.map.removeLayer(this.marker);
        this.getPostcode(Number(this.lon), Number(this.lat));
      } else {
        this.getPostcode(Number(this.lon), Number(this.lat));
      }
    })

  }

  showLocation() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    const opt = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    this.geolocation.getCurrentPosition(opt).then((res) => {
      this.pos = [res.coords.latitude, res.coords.longitude];
      this.lat = res.coords.latitude;
      this.lon = res.coords.longitude;


      if (this.marker !== undefined) {
        this.map.removeLayer(this.marker);
        this.getPostcode(this.lon, this.lat);
        loading.dismiss();
      } else {
        this.getPostcode(this.lon, this.lat);
        loading.dismiss();
      }

      this.map.setView(this.pos, 16);

      // setTimeout(() => {
      //   this.getPostcode(this.lon, this.lat);
      //   loading.dismiss();
      // }, 1000 / 60)


      // this.marker.on("dragend", function (e) {
      //   this.pos = [e.target._latlng.lat, e.target._latlng.lng];
      // });

    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((res) => {
      this.pos = [res.coords.latitude, res.coords.longitude];
      this.lat = res.coords.latitude;
      this.lon = res.coords.longitude;
      // this.reportProvider.setLocation(this.lat, this.lon);
    });
  }

  getPostcode(lon: number, lat: number) {
    this.postserviceProvider.getPostcode(lon, lat).then((res: any) => {
      console.log(lon, lat)
      console.log(res)

      if (res.totalFeatures !== 0) {
        this.db = res.features[0].properties.db;
        this.id = res.features[0].properties.id;
        this.postcode = res.features[0].properties.postcode;

        this.marker = L.marker(this.pos, { draggable: false })
          .addTo(this.map)
          .bindPopup("<h6>ID: " + this.id 
            + "<br>DB: " + this.db 
            + "<br>POSC: " + this.postcode 
            + "<br>Lon: " + lon 
            + "<br>Lat: " + lat + "</h6>")
          .openPopup();
      }
    })
  }

  // gotoReport() {
  //   if (this.lat === 0 || this.lon === 0) {
  //     const alert = this.alertCtrl.create({
  //       title: 'ระบุตำแหน่งของท่าน',
  //       subTitle: 'ไม่พบตำแหน่งของท่าน โปรดกลับไประบุตำแหน่งของท่านก่อนรายงานสถานการณ์',
  //       buttons: ['ตกลง']
  //     })

  //     alert.present()

  //   } else {
  //     this.navCtrl.push(AddDataPage, {
  //       pos: this.pos
  //     })
  //   }
  // }

  selectLayers() {
    const modal: Modal = this.modalCtrl.create(LayerPage, this.lyrGroup);
    modal.present();
    modal.onDidDismiss((res) => {
      this.lyrGroup.lyr = res
      console.log(res)
      this.lyrFn(res)
    });
  }

  lyrFn(lyrs: any) {
    for (let i of lyrs) {
      if (i.isChecked) {
        this.map.addLayer(i.wms);
      } else {
        this.map.removeLayer(i.wms);
      }
    }
  }

}
