import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Headers, Http } from '@angular/http';
import { User } from '../../usuarios-model';
import { RegistroPage } from '../registro/registro';
import { HomePage } from '../home/home';
import { Pelicula } from '../../pelicula-model';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  usuarioALoguear: User = {
    name: "",
    email: "",
    username: "",
    password: ""
  }

  url: string;
  headers: Headers;
  localStorage: Storage;
  loading: boolean;
  idUsuario: string;
  listaPeliculas: Pelicula[];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public http: Http,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController
            ) {

              this.headers = new Headers;
              this.headers.append("X-Parse-REST-API-Key", "restAPIKey");
              this.headers.append("X-Parse-Master-Key", "masterKey");
              this.headers.append("X-Parse-Application-Id", "Peliculas");
              this.localStorage = new Storage(null);
              this.getAvatares()
  }

  /*=======================================================
                 Navegación                       
=======================================================*/
  irARegistro(){
    this.navCtrl.push(RegistroPage);
  }

/*=======================================================
          Guardar avatares en base de datos                       
=======================================================*/
  generarAvatares(){
    this.url = "http://localhost:8080/Movies/classes/avatares";
    let avatares = [
      { url: "/assets/imgs/avatar/avatar1.png" },
      { url: "/assets/imgs/avatar/avatar2.png" },
      { url: "/assets/imgs/avatar/avatar3.png" },
      { url: "/assets/imgs/avatar/avatar4.png" },
      { url: "/assets/imgs/avatar/avatar5.png" },
      { url: "/assets/imgs/avatar/avatar6.png" },
      { url: "/assets/imgs/avatar/avatar7.png" },
      { url: "/assets/imgs/avatar/avatar8.png" },
      { url: "/assets/imgs/avatar/avatar9.png" },
      { url: "/assets/imgs/avatar/avatar10.png" },
      { url: "/assets/imgs/avatar/avatar11.png" },
      { url: "/assets/imgs/avatar/avatar12.png" },
    ]
    for (let i = 0; i < avatares.length; i++) {
      this.http.post(this.url, avatares[i], { headers: this.headers})
      .map( res => res.json())
      .subscribe();
    }
  }

/*=======================================================
      Verificar existencia de avatares en base de datos                       
=======================================================*/
  getAvatares(){
    //Mostrar Loader
    let loader = this.loadingCtrl.create({content: "Verificando Base de Datos"})
    loader.present()
    //Consultar base de datos
    this.url = 'http://localhost:8080/Movies/classes/avatares';
    this.http.get(this.url, { headers: this.headers })
              .map( res => res.json())
              .subscribe( res => {
                let avatares = res.results
                //Si no existen registro de avatares en la base de datos
                if (avatares.length === 0){
                  //Generar avatares
                  this.generarAvatares()
                }
                //Ocultar loader
                loader.dismiss()
              }, err=>{
                err = err.json()
                //Ocultar loader
                loader.dismiss();
                //Mostrar alerta de error
                this.alertCtrl.create({
                  title: "Error de comunicación",
                  subTitle: 'Verifique que el servidor se encuentra inicializado',
                  message: err.error,
                  buttons:[
                    {text: "Cancelar"},
                    {
                      text: "Reintentar",
                      handler: () => {
                        this.getAvatares()
                      }
                    }
                  ]
                }).present()

              })
  }
/*=======================================================
                 Iniciar sesión                       
=======================================================*/
  iniciarSesion(){
    //Mostrar loader
    let loading = this.loadingCtrl.create({ content: 'Iniciando Sesión'});
    loading.present()
    //Verificar que no exista ningún campo vacío
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
    //Enviar el nombre de usuario en minúsculas
    let username=this.usuarioALoguear.username.toLowerCase()
    this.url = 'http://localhost:8080/Movies/login?username='+username+'&password='+this.usuarioALoguear.password;
    //Consultar la base de datos
    this.http.get(this.url, {headers: this.headers})
              .subscribe( res => {
                //Guardar el id del usuario como local storaga
                this.localStorage.set('idUsuario', res.json().objectId)
                                  .then( () => {
                                    //Ocultar loader
                                    loading.dismiss();
                                    //Definir el componente HomePage como root de navegación
                                    this.navCtrl.setRoot(HomePage)
                                  }
                );
              }, err=>{
                //Ocultar loader
                loading.dismiss();
                //Mostrar alerta de error
                this.alertCtrl.create({
                  title: 'Error',
                  message: 'Usuario o contraseña incorrecta',
                  buttons: [{text: "Aceptar"}]
                }).present();
              });
  }
}
