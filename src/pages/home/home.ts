import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/add/operator/map';
import { LoginPage } from '../login/login';
import { ComentariosPage } from '../comentarios/comentarios';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  url: string;
  headers: Headers;
  peliculas: any[];
  favoritos: any[];
  idUsuario: string;
  avatar:string;
  mensaje:string;
  puntuacionPelicula: any[];
  localStorage: Storage;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public http: Http,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController
            ) {

              this.headers = new Headers;
              this.headers.append("X-Parse-REST-API-Key", "restAPIKey");
              this.headers.append("X-Parse-Master-Key", "masterKey");
              this.headers.append("X-Parse-Application-Id", "Peliculas");
              
                this.localStorage = new Storage(null);
                this.localStorage.get('idUsuario')
                .then( (valor) => {
                  this.idUsuario = valor;
                  if (!this.idUsuario) {
                    this.navCtrl.setRoot(LoginPage);
                    return
                  }
                  this.obtenerPeliculas(null);
                })
  }

/*=======================================================
                    Navegación                        
=======================================================*/
  irAComentarios(){
    this.navCtrl.push(ComentariosPage);
  }

/*=======================================================
                   Cerrar Cesión                      
=======================================================*/
  cerrarSesion(){
    //Mostrar alerta
    this.alertCtrl.create({
      title: "Cerrar Sesión",
      message: "¿Seguro que desea cerrar sesión?",
      buttons: [
        {text: "Cancelar"},
        {
          text: "Cerrar Sesión",
          handler: () =>{
            //vaciar la variable de sesión de usuario
            this.localStorage.set('idUsuario', null);
            //Definir LoginPage como directorio Raíz
            this.navCtrl.setRoot(LoginPage)
          }

        }
      ]
    }).present()
  }
/*====================================================
              Formularios de Alerta                        
=======================================================*/
  crearPelicula(){
   this.alertCtrl.create({
      title: "Crear nueva Película",
      message: "Complete el formulario de la película",
      inputs: [
        {
          name: "titulo",
          placeholder: "Título",
        },
        {
          name: "categoria",
          placeholder: "Categoría"
        },
        {
          name: "puntuacion",
          placeholder: "Puntuación",
          value: "0",
          type: "number",
          min: 0,
          max: 5,
        },
        {
          name: "imagen",
          placeholder: "Url de poster",
          value: "/assets/imgs/poster.png"
        }
      ],
      enableBackdropDismiss: false,
      buttons: [
        {text: "Cancelar"},
        {
          text: "Guardar Película",
          handler: data => {
            let campos = "";
            //Verificar que los campos no sean vacios.
            if (data.titulo === "" || data.categoria === "" || data.puntuacion === "" || data.puntuacion < 0 || data.puntuacion > 5 || data.imagen=== ""){
              if (data.titulo === ""){
                campos+=" Titulo,";
              }
              if (data.titulo === ""){
                campos+=" Categoría,";
              }
              if (data.puntuacion === "" || data.puntuacion < 0 || data.puntuacion > 5){
                campos+=" Puntuación,";
              }
              if (data.imagen ===""){
                campos+=" Imagen";
              }
              //Mostrar toaster con el error.
              this.toastCtrl.create({
                message: "Error al guardar la película. Verifique los campos: " + campos ,
                position: "middle",
                showCloseButton: true,
                closeButtonText: "Cerrar",
                dismissOnPageChange: false,
              }).present()
            } else {
              //Inicializar el loader (spinner)
              let loader = this.loadingCtrl.create({content: "Guardando nueva película"});
              loader.present();
              //Definir URL a consultar
              this.url="http://localhost:8080/Movies/classes/peliculas";
              this.http.post(this.url, {titulo: data.titulo, categoria: data.categoria, puntuacion: data.puntuacion, imagen: data.imagen}, {headers: this.headers})
                      .map(res=> res.json())
                      .subscribe( res => {
                        //Ocultar el spinner
                        loader.dismiss();
                        //Actualizar la vista de películas, consultando al servidor
                        this.obtenerPeliculas(null);
                        //Mostrar Toast si la película se guardó correctamente
                        this.toastCtrl.create({
                          message: "Película guardada correctamente",
                          duration: 2000,
                          position: "bottom"
                        });
                        //Mostrar Toast de error
                      }, err =>{
                        this.toastCtrl.create({
                          message: "Error al intentar guardar la película. Intente de nuevo",
                          duration: 2000,
                          position: "middle"
                        });
                      });
            }
          }

        }
      ]
    }).present()
  }

  obtenerPuntuacion(star){
    this.puntuacionPelicula = ["star-outline", "star-outline", "star-outline", "star-outline", "star-outline" ];
   for (let index = 0; index < star; index++) {
      this.puntuacionPelicula[index]="star";
    }
    return this.puntuacionPelicula;
  }

  compararFavoritos(idPelicula){
    let fav = false
    this.favoritos.forEach( favorito => {
      if (idPelicula === favorito.pelicula && favorito.usuario === this.idUsuario) {   
        fav = true;
        return;
      }
    })
    return fav;
  }

  obtenerFavoritos(){
    this.url= 'http://localhost:8080/Movies/classes/peliculas_favoritas';
    this.http.get(this.url, { headers: this.headers })
              .map(res => res.json())
              .subscribe( res => {
                this.favoritos = res.results;
              }, err =>{
                this.toastCtrl.create({
                  message: "Ha ocurrido un error al consultar sus películas favoritas. Por favor intente más tarde",
                  duration: 3000,
                  position: "bottom",
                }).present();
              }
              )
  }

  obtenerPeliculas(refresher){
    this.mensaje = null;
    let loading = this.loadingCtrl.create({ content: "Cargando Películas" });
    loading.present();
    this.obtenerFavoritos();
    this.url= "http://localhost:8080/Movies/classes/peliculas/";
    this.http.get(this.url, { headers: this.headers })
              .map( res => res.json())
              .subscribe( res => {
                  loading.dismiss();
                  this.peliculas = res.results;
                  if (refresher !== null){
                    refresher.complete();
                  }
                  if(this.peliculas.length === 0) {
                    this.mensaje= 'No hay películas registradas por el momento.';
                 } 
              }, err =>{
                loading.dismiss();
                this.alertCtrl.create({
                  title: "Error",
                  message: "Ha ocurrido un error al obtener las películas. Por favor intente más tarde",
                  buttons: [
                    { text: "Aceptar" },
                    { 
                      text: "Reintentar",
                      handler: () => this.obtenerPeliculas(null)
                    }
                  ]
                }).present();
              }
              )
  }

  agregarFavoritos(idPelicula){
    this.url="http://localhost:8080/Movies/classes/peliculas_favoritas/"
    this.http.post( this.url, { usuario: this.idUsuario, pelicula: idPelicula}, { headers: this.headers})
              .subscribe( res => {
                this.toastCtrl.create({
                  message: 'Pelicula añadida a favoritos',
                  duration: 3000,
                  position: "bottom" 
                }).present();
                this.obtenerPeliculas(null)
              }, err => {
                this.alertCtrl.create({
                  title: "Error",
                  message: "Ha ocurrido un error. Por favor intente más tarde",
                  buttons: [{ text: "Aceptar" }]
                }).present();
              })
  }

  eliminarFavoritos(idPelicula){
    this.url='http://localhost:8080/Movies/classes/peliculas_favoritas?where={"usuario":"'+this.idUsuario+'", "pelicula": "'+idPelicula+'"}';
    this.http.get(this.url, { headers: this.headers })
              .map(res => res.json())
              .subscribe( res => {
                console.log(res)
                let idFavorito = res.results[0].objectId;
                this.url='http://localhost:8080/Movies/classes/peliculas_favoritas/'+idFavorito;
                this.http.delete( this.url, { headers: this.headers})
                .subscribe( res => {
                  this.toastCtrl.create({
                    message: 'Pelicula desmarcada de favoritos',
                    duration: 3000,
                    position: "bottom" 
                  }).present();
                  this.obtenerPeliculas(null)
                }, err => {
                  this.alertCtrl.create({
                    title: "Error",
                    message: "Ha ocurrido un error. Por favor intente más tarde",
                    buttons: [{ text: "Aceptar" }]
                  }).present();
                })
              }, errr => {
                this.alertCtrl.create({
                  title: "Error",
                  message: "Ha ocurrido un error. Por favor intente más tarde",
                  buttons: [{ text: "Aceptar" }]
                }).present();
            })
  }

  agregarComentario(pelicula){
    this.alertCtrl.create({
      title: "Agregar un comentario",
      subTitle: pelicula.titulo,
      message: "Agregue un comentario sobre lo que piensas de esta película",
      inputs: [
        {
          name: 'tituloComentario',
          placeholder: 'Título',
        },
        {
          name: 'comentario',
          placeholder: 'Ingresa tu comentario'
        }
      ],
      
        buttons: [
          { text: 'Cancelar'},
          {
            text: 'Comentar',
            handler: data => {
              let loading = this.loadingCtrl.create({ content: "Enviando comentario "})
              loading.present();
              //Acciones a realizar.
              this.url="http://localhost:8080/Movies/classes/peliculas_comentarios/"
              this.http.post(this.url, { usuario: this.idUsuario, idPelicula: pelicula.objectId, pelicula: pelicula.titulo, titulo_comentario: data.tituloComentario, comentario: data.comentario }, { headers: this.headers})
                        .map( res => res.json())
                        .subscribe( res => {
                          loading.dismiss();
                          this.toastCtrl.create({
                            message: "Comentario enviado correctamente.",
                            duration: 300,
                            position: "bottom",
                          }).present();
                          this.obtenerPeliculas(null);
                         
                        }, err =>{
                          this.toastCtrl.create({
                            message: "Ha ocurrido un error. Por favor intente más tarde",
                            duration: 300,
                            position: "bottom",
                          }).present();
                        });
            }
          }
        ]
    }).present()
  }
}
