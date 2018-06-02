import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-layer',
  templateUrl: 'layer.html',
})
export class LayerPage {

  // layer
  public lyrs: any;
  public lyrOver = [];
  public lyrBase = [];

  public rb: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.lyrs = navParams.get('lyr');

    this.lyrs.forEach(l => {
      if (l.type === 'overlay') {
        this.lyrOver.push(l)
      } else {
        this.lyrBase.push(l)
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LayerPage');
  }

  onCheckWms(lyr: string, isChecked: any) {
    if (isChecked) {
      for (let i in this.lyrs) {
        if (this.lyrs[i].lyr === lyr) {
          this.lyrs[i].isChecked = true;
        }
      }
    } else {
      for (let i in this.lyrs) {
        if (this.lyrs[i].lyr === lyr) {
          this.lyrs[i].isChecked = false;
        }
      }
    }
  }

  onSelect(lyr) {
    for (let i in this.lyrs) {
      if (this.lyrs[i].type === 'base') {
        if (this.lyrs[i].lyr === lyr) {
          this.lyrs[i].isChecked = true;
        } else {
          this.lyrs[i].isChecked = false;
        }
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss(this.lyrs);
  }

}
