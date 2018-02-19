import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Headers, Http } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/add/operator/map';
import { Comentario } from '../../comentario-model';

/**
 * Generated class for the ComentariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comentarios',
  templateUrl: 'comentarios.html',
})
export class ComentariosPage {

  url: string;
  headers: Headers;
  idUsuario: string;
  comentarios: Comentario[];
  usuarios: any[];
  peliculas: any[];
  localStorage: Storage;
  mensaje: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public http: Http,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
            ) {

              this.headers = new Headers;
                this.headers.append("X-Parse-REST-API-Key", "restAPIKey");
                this.headers.append("X-Parse-Master-Key", "masterKey");
                this.headers.append("X-Parse-Application-Id", "Peliculas");
                this.localStorage = new Storage(null);
                this.localStorage.get('idUsuario')
                .then( (valor) => {
                  this.idUsuario = valor;
                  this.obtenerComentarios(null);
                })
  }

  obtenerUsuario(){
    this.url = 'http://localhost:8080/Movies/classes/_User';
    this.http.get(this.url, {headers: this.headers})
              .map( res => res.json())
              .subscribe( res => {
                this.usuarios = res.results
              }, err => {
                this.toastCtrl.create({
                  message: 'Error de conexion con el servidor. Intente de nuevo',
                  duration: 2000,
                  position: "middle"
                }).present();
              });
  }

  obtenerAvatar(usuarioComentario){
    let matchAvatar = "/assets/imgs/avatar/usuario.png";
    this.usuarios.forEach(usuario => {
      if ( usuario.objectId === usuarioComentario) {
        matchAvatar = usuario.avatar;
        return
      }
    });
    return matchAvatar;
  }

  obtenerPeliculas(){
    this.url = 'http://localhost:8080/Movies/classes/peliculas';
    this.http.get(this.url, {headers: this.headers})
              .map( res => res.json())
              .subscribe( res => {
                this.peliculas = res.results
              }, err => {
                this.toastCtrl.create({
                  message: 'Error al consultar imágenes de películas',
                  duration: 2000,
                  position: "middle"
                }).present();
              });
  }

  obtenerImagen(idPelicula){
    let matchPelicula = "/assets/imgs/poster.png";
    this.peliculas.forEach(pelicula => {
      if ( pelicula.objectId === idPelicula) {
        matchPelicula = pelicula.imagen;
        return
      }
    });
    return matchPelicula;
  }

  usuarioEnLinea(usuario){
    if (usuario === this.idUsuario){
      return true;
    }
    return false;
  }

  obtenerComentarios(refresher){
    let loading = this.loadingCtrl.create({ content: "Cargando Comentarios"});
    this.mensaje=null;
    loading.present();
    this.obtenerUsuario();
    this.obtenerPeliculas();
    this.url = "http://localhost:8080/Movies/classes/peliculas_comentarios"
    this.http.get(this.url, {headers: this.headers})
              .map( res => res.json() )
              .subscribe( res => {
                loading.dismiss();
                this.comentarios = res.results;
                if (this.comentarios.length === 0){
                  this.mensaje = "No se encontraron comentarios registrados."
                }
                if (refresher !== null) {
                  refresher.complete();
                }
              }, err=>{
                err = err.json()
                loading.dismiss();
                this.alertCtrl.create({
                  title: "Error",
                  subTitle: "Ha ocurrido un error al obtener las películas. Por favor intente más tarde",
                  message: err.error,
                  buttons: [
                    { text: "Aceptar" },
                    { 
                      text: "Reintentar",
                      handler: () => this.obtenerComentarios(null)
                    }
                  ]
                }).present();
              })
  }
  editarComentario(comentario){
    this.alertCtrl.create({
      title: "Editar comentario",
      subTitle: comentario.pelicula,
      message: "Edita el comentario sobre lo que piensas de esta película",
      inputs: [
        {
          name: 'tituloComentario',
          value: comentario.titulo_comentario,
          placeholder: 'Título',
        },
        {
          name: 'comentario',
          value: comentario.comentario,
          placeholder: 'Ingresa tu comentario'
        }
      ],
      
        buttons: [
          { text: 'Cancelar'},
          {
            text: 'Actualizar',
            handler: data => {
              if (data.titulo_comentario === "" || data.comentario === ""){
                //Mostrar toaster con el error.
                this.toastCtrl.create({
                  message: "Error al guardar la película. No deben haber campos vacíos",
                  position: "middle",
                  showCloseButton: true,
                  closeButtonText: "Cerrar",
                  dismissOnPageChange: false,
                }).present()
                return
              }
              let loading = this.loadingCtrl.create({ content: "Enviando comentario "})
              loading.present();
              //Acciones a realizar.
              this.url="http://localhost:8080/Movies/classes/peliculas_comentarios/"+comentario.objectId
              this.http.put(this.url, { titulo_comentario: data.tituloComentario, comentario: data.comentario }, { headers: this.headers})
                        .map( res => res.json())
                        .subscribe( res => {
                          loading.dismiss();
                          this.toastCtrl.create({
                            message: "Comentario editado correctamente.",
                            duration: 300,
                            position: "bottom",
                          }).present();
                          this.obtenerComentarios(null);
                         
                        }, err =>{
                          err = err.json()
                          loading.dismiss();
                          this.toastCtrl.create({
                            message: "Ha ocurrido un error. Por favor intente más tarde. " + err.error,
                            duration: 300,
                            position: "bottom",
                          }).present();
                        });
            }
          }
        ]
    }).present()
  }
  
  eliminarComentario(comentario){
    this.alertCtrl.create({
      title: "Eliminar Comentario",
      subTitle: comentario.pelicula,
      message: "¿Está seguro que desea eliminar el comentario sobre la película?",
      buttons: [
        {text: "Cancelar"},
        {
          text: "Aceptar",
          handler: () => {
            let loader = this.loadingCtrl.create({ content: 'Eliminando comentario'});
              loader.present();
              this.url="http://localhost:8080/Movies/classes/peliculas_comentarios/"+comentario.objectId;
              this.http.delete(this.url, {headers: this.headers} )
              .map( res=> res.json)
              .subscribe( res=>{
                loader.dismiss()
                this.toastCtrl.create({
                  message: "Comentario eliminado satisfactoriamente",
                  duration: 300,
                  position: "bottom",
                }).present();
                this.obtenerComentarios(null);
              }, err => {
                err = err.json();
                loader.dismiss()
                this.toastCtrl.create({
                  message: "Ha ocurrido un error al intentar eliminar el comentario. Por favor intente más tarde. " + err.error,
                  duration: 300,
                  position: "bottom",
                }).present();
              })
          }
        }
      ]
    }).present();
  }

}
