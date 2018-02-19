import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { User } from '../../usuarios-model';

@IonicPage()
@Component({
  selector: 'page-registro',
  templateUrl: 'registro.html',
})
export class RegistroPage {

  usuarioARegistrar: User = {
    username: "",
    password: "",
    name: "",
    email: "",
    telefono: "",
    avatar: "/assets/imgs/avatar/avatar1.png",
  };
  avatares: any[];
  repetirPassword: string;
  url: string;
  headers: Headers;
  localStorage: Storage;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public http: Http,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController
            ) {
              this.headers = new Headers;
              this.headers.append("X-Parse-REST-API-Key", "restAPIKey");
              this.headers.append("X-Parse-Master-Key", "masterKey");
              this.headers.append("X-Parse-Application-Id", "Peliculas");
              this.localStorage = new Storage(null);
              this.obtenerAvatar();
  }

/*=======================================================
                    Navegación                        
=======================================================*/
irALogin(){
  this.navCtrl.pop()
}

/*=======================================================
        Obtener avatares desde la base de datos                     
=======================================================*/
  obtenerAvatar(){
    //Mostrar loader
    let loader = this.loadingCtrl.create({content: "Cargando Avatares"});
    loader.present();
    //Consultar base de datos
    this.url="http://localhost:8080/Movies/classes/avatares"
    this.http.get(this.url, {headers: this.headers})
              .map(res => res.json())
              .subscribe( res =>{
                //Ocultar loader
                loader.dismiss();
                this.avatares = res.results               
              }, err=> {
                this.toastCtrl.create({
                  message: "Ha ocurrido un error al cargar los avatares. Intente de nuevo",
                  duration: 3000,
                  position: "middle"
                }).present();
              })
  }

/*=======================================================
                Registrar Usuario                        
=======================================================*/
  registrarUsuario(){
    //Verificar que contraseñas coincidan
    if (this.usuarioARegistrar.password !== this.repetirPassword) {
      //Mostrar alerta de error
      this.alertCtrl.create({
        title: "Error",
        message: "Las contraseñas no coinciden. Por favor intente de nuevo.",
        buttons: [{text: "Aceptar"}]
      }).present();
      return
    }
    
    this.url = "http://localhost:8080/Movies/users"
    //Enviar datos de formulario, enviando los campos username e emal en formato minúsculas
    this.http.post(this.url, {username: this.usuarioARegistrar.username.toLocaleLowerCase(),
                                password: this.usuarioARegistrar.password,
                                name: this.usuarioARegistrar.name,
                                email:this.usuarioARegistrar.email.toLocaleLowerCase(),
                                telefono: this.usuarioARegistrar.telefono,
                                avatar: this.usuarioARegistrar.avatar
                              },
                              {headers: this.headers})
              .map( res => res.json())
              .subscribe( res=> {
                //Mostrar alerta de éxito
                this.alertCtrl.create({
                  title: "Registro Exitoso",
                  message: "Usuario registrado con éxito. Ahora puedes iniciar sesión",
                  buttons: [{
                    text: "Iniciar Sesión",
                    handler: () => {
                      this.navCtrl.pop();
                    }
                  }]
                }).present()
              }, err => {
                //Mostrar alerta de error
                err = err.json();
                console.log(err)
                this.alertCtrl.create({
                  title: "Error inesperado",
                  subTitle: "Ha ocurrido un error al registrar su usuario. Por favor intente de nuevo. ",
                  message: err.error,
                  buttons: [{text: "Aceptar"}]
                }).present();
              });
  }
}
