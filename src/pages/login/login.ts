import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Headers, Http } from '@angular/http';
import { User } from '../../usuarios-model';
import { RegistroPage } from '../registro/registro';
import { HomePage } from '../home/home';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  usuarioALoguear: User = {
    username: "",
    password: ""
  }

  url: string;
  headers: Headers;
  localStorage: Storage;
  loading: boolean;
  idUsuario: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public http: Http,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController
            ) {

              this.headers = new Headers;
              this.headers.append("X-Parse-REST-API-Key", "restAPIKey");
              this.headers.append("X-Parse-Master-Key", "masterKey");
              this.headers.append("X-Parse-Application-Id", "Peliculas");
              this.localStorage = new Storage(null);
  }

  iniciarSesion(){
    let loading = this.loadingCtrl.create({ content: 'Iniciando Sesión'});
    loading.present()
    if (this.usuarioALoguear.username === '' && this.usuarioALoguear.password === '') {
      this.alertCtrl.create({
        title: "Error",
        message: "No debe haber ningún campo vacio para iniciar sesión",
        buttons: [
          {
            text: "Aceptar"
          }
        ]
      }).present();
      return
    }
    this.url = 'http://localhost:8080/Movies/login?username='+this.usuarioALoguear.username+'&password='+this.usuarioALoguear.password;
    
    this.http.get(this.url, {headers: this.headers})
              .subscribe( res => {
                this.localStorage.set('idUsuario', res.json().objectId)
                                  .then( () => {
                                    loading.dismiss();
                                    this.navCtrl.setRoot(HomePage)
                                  }
                );
              }, err=>{
                loading.dismiss();
                this.alertCtrl.create({
                  title: 'Error',
                  message: 'Usuario o contraseña incorrecta',
                  buttons: [{text: "Aceptar"}]
                }).present();
              });
  }

  irARegistro(){
    this.navCtrl.push(RegistroPage);
  }
}
