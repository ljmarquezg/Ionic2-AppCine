import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/add/operator/map';
import { LoginPage } from '../login/login';
import { ComentariosPage } from '../comentarios/comentarios';
import { Pelicula } from '../../pelicula-model';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  url: string;
  headers: Headers;
  peliculas: Pelicula[];
  listaPeliculas: Pelicula[];
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
              Inicializar Películas                      
=======================================================*/

//-------          Guardar peliculas en servidor.     -----------//
  peliculasDB(){
    //Array de objetos con la información de las películas
    this.listaPeliculas = [
      {
        titulo: "Asesinato en el oriente express",
        categoria: "Suspenso",
        puntuacion: 3,
        imagen: "https://2.bp.blogspot.com/-8UTYvIypsxE/Wn2uTmu0JfI/AAAAAAABG00/LeY-hipIYbwvmYWYsjaW5563mnm9ECZ5wCLcBGAs/s320/21.jpg"
      },
      {
        titulo: "La liga de la justicia",
        categoria: "Acción",
        puntuacion: 3,
        imagen: "https://2.bp.blogspot.com/-CUuJRcK3LNU/Wn9VDn2LGoI/AAAAAAABG1w/C6Rg8fJnPIE_1aVuLk0J3YTOmZJaMadhQCLcBGAs/s320/21.jpg"
      },
      {
        titulo: "Extraordinario",
        categoria: "Drama",
        puntuacion: 5,
        imagen: "https://2.bp.blogspot.com/-V3bf4z0TYXs/WnK1b3j9TQI/AAAAAAABGtc/sBJpzDlNW-AneDSZpc2W9g3uJewnuxjdwCLcBGAs/s320/21.jpg"
      },
      {
        titulo: "Batalla de los sexos",
        categoria: "Drama",
        puntuacion: 4,
        imagen: "https://2.bp.blogspot.com/-qQz0kM01nPI/WjmACzu-ovI/AAAAAAABF-8/2FBpmeZ52L0hn47v_ZMWQKTYInc5YDLNQCLcBGAs/s320/21.jpg"
      },
      {
        titulo: "El hombre de nieve",
        categoria: "Suspenso",
        puntuacion: 4,
        imagen: "https://2.bp.blogspot.com/-L5dN3ItfWi4/Wj6S1okveHI/AAAAAAABGCs/tXt2Gi0A2SAkDlhO9K81KAGb5Zhm3qJsACLcBGAs/s320/21.jpg"
      },
    ]
    for (let i = 0; i < this.listaPeliculas.length; i++) {
      //Recorrer el arreglo de peliculas y guardarlas en la base de dataos
      this.http.post(this.url, this.listaPeliculas[i], { headers: this.headers})
      .map( res => res.json())
      .subscribe( res => {

      }, err => {
        //Mostrar alerta con mensaje de error.
        this.alertCtrl.create(
          {
            title: "Error de comuicacion",
            subTitle: "Error al crear películas. Verifique comunicación con el servidor",
            message: err.error,
            buttons: [
              {text: "Cancelar"},
              {
                text: "Reintentar",
                handler: () => {
                  this.peliculasDB();
                }
              }
            ]
          }
        ).present()
      })
    }
  }

//-------          Mensaje de alerta para eliminar información en base de datos.     -----------//

  inicializarPeliculas(){
    //Alerta para confirmar eliminación de base de datos
    // this.alertCtrl.create({
    //   title: "Crear Películas",
    //   subTitle: "Inicialiazar películas de ejemplo",
    //   message: "Iniciar peliculas de ejemplo",
    //   buttons: [
    //     {text: "Cancelar"},
    //     {
    //       text: "Eliminar Información",
    //       handler: data => {
            //-------         Eliminar información     -----------//
              this.obtenerInformacion("http://localhost:8080/Movies/classes/peliculas");
              this.obtenerInformacion("http://localhost:8080/Movies/classes/peliculas_comentarios");
              this.obtenerInformacion("http://localhost:8080/Movies/classes/peliculas_favoritas");
              this.peliculasDB();
            //Refrescar la vista
            this.obtenerPeliculas(null);
    //       }
    //     }
    //   ]
    // }).present()
  }

  //-------         Eliminar peliculas de base de datos.     -----------//
  borrarInformacion(url, idObjeto){
    url = url+"/"+idObjeto;
    this.http.delete(url, {headers: this.headers})
              .map(res => res.json)
              .subscribe();
  }

//-------          Obtener Informacion de base de datos.     -----------//
  obtenerInformacion(url){
    this.http.get(url, {headers: this.headers})
              .map( res => res.json())
              .subscribe(res => {
                let peliculas = res.results;
                //Obtener el número de películas guardadas en la base de datos
                if( peliculas.length > 0 ){
                  for (let i = 0; i < peliculas.length; i++) {
                    // Eliminar la información en el servidor
                    this.borrarInformacion(url, peliculas[i].objectId)
                  }
                }
              }, err => {
                this.toastCtrl.create({
                  message: "Error al eliminar la informacion. Intente de nuevo",
                  duration: 2500,
                  position: "middle"
                }).present();
              })
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
      subTitle: "Agregue informacion sobre la película",
      message: "El campo numérico corresponde a la puntuación de la película. Acepta valores entre 0 y 5",
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
          label: "Puntuación",
          type: "number",
          min: 0,
          max: 5,
        },
        {
          name: "imagen",
          placeholder: "Url de poster: http://pelispedia.tv/"
        }
      ],
      enableBackdropDismiss: false,
      buttons: [
        {text: "Cancelar"},
        {
          text: "Guardar Película",
          handler: data => {
            //Verificar que los campos no sean vacios.
            if (data.titulo === "" || data.categoria === "" || data.puntuacion === "" || data.puntuacion < 0 || data.puntuacion > 5 ){
              //Mostrar toaster con el error.
              this.toastCtrl.create({
                message: "Error al guardar la película. No deben haber campos vacíos",
                position: "middle",
                showCloseButton: true,
                closeButtonText: "Cerrar",
                dismissOnPageChange: false,
              }).present()
            } else {
              //Inicializar el loader (spinner)
              if (data.imagen === ""){
                data.imagen = "/assets/imgs/poster.png"
              }
              let loader = this.loadingCtrl.create({content: "Guardando nueva película"});
              loader.present();
              //Definir URL a consultar
              this.url="http://localhost:8080/Movies/classes/peliculas";
              this.http.post(this.url, {titulo: data.titulo, categoria: data.categoria, puntuacion: parseInt(data.puntuacion,10), imagen: data.imagen}, {headers: this.headers})
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
                        loader.dismiss();
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

/*====================================================
      Obtener la puntuación de la pelíicula                       
=======================================================*/
  obtenerPuntuacion(star){
    this.puntuacionPelicula = ["star-outline", "star-outline", "star-outline", "star-outline", "star-outline" ];
   for (let index = 0; index < star; index++) {
      this.puntuacionPelicula[index]="star";
    }
    return this.puntuacionPelicula;
  }

/*====================================================
      Comparar las películas favoritas del usuario                      
=======================================================*/
  compararFavoritos(idPelicula){
    let fav = false
    //Recorrer todos los vaforitos
    this.favoritos.forEach( favorito => {
      if (idPelicula === favorito.pelicula && favorito.usuario === this.idUsuario) {  
        //devolver verdadero si el usuario seleccionó la película como favorita 
        fav = true;
        return;
      }
    })
    return fav;
  }

/*====================================================
      Obtener las películas favoritas del usuario                      
=======================================================*/
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

/*====================================================
      Obtener todas las películas                    
=======================================================*/
  obtenerPeliculas(refresher){
    //definir mensaje como nulo
    this.mensaje = null;
    //Mostrar Loader
    let loading = this.loadingCtrl.create({ content: "Cargando Películas" });
    loading.present();
    //Obtener los favoritos
    this.obtenerFavoritos();
    this.url= "http://localhost:8080/Movies/classes/peliculas/";
    this.http.get(this.url, { headers: this.headers })
              .map( res => res.json())
              .subscribe( res => {
                  loading.dismiss();
                  //Guardar el resultado en la variable peliculas
                  this.peliculas = res.results;
                  if (refresher !== null){
                    refresher.complete();
                  }
                  //Si no hay películas guardadas mostrar mensaje.
                  if(this.peliculas.length === 0) {
                    this.mensaje= 'No hay películas registradas por el momento.';
                 } 
              }, err =>{
                //Ocultar loader
                err = err.json();
                loading.dismiss();
                //Mostrar alerta de error
                this.alertCtrl.create({
                  title: "Error",
                  subTitle: "Ha ocurrido un error al obtener las películas. Por favor intente más tarde",
                  message: err.error,
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
/*====================================================
          Agregar película a favoritos                    
=======================================================*/
  agregarFavoritos(idPelicula){
    this.url="http://localhost:8080/Movies/classes/peliculas_favoritas/"
    this.http.post( this.url, { usuario: this.idUsuario, pelicula: idPelicula}, { headers: this.headers})
              .subscribe( res => {
                //Mostrar Toaster
                this.toastCtrl.create({
                  message: 'Pelicula añadida a favoritos',
                  duration: 3000,
                  position: "bottom" 
                }).present();
                this.obtenerPeliculas(null)
              }, err => {
                err = err.json();
                //Mostrar alerta de error
                this.alertCtrl.create({
                  title: "Error",
                  subTitle: "Ha ocurrido un error. Por favor intente más tarde",
                  message: err.error,
                  buttons: [{ text: "Aceptar" }]
                }).present();
              })
  }
/*====================================================
      Eliminar películas favorita del usuario                      
=======================================================*/
  eliminarFavoritos(idPelicula){
    //Consultar la base de datos el id de la película enviada como parámetro y el usuario que ha iniciado sesión
    this.url='http://localhost:8080/Movies/classes/peliculas_favoritas?where={"usuario":"'+this.idUsuario+'", "pelicula": "'+idPelicula+'"}';
    this.http.get(this.url, { headers: this.headers })
              .map(res => res.json())
              .subscribe( res => {
                //Obtener la película actual enviada como parámetro
                let idFavorito = res.results[0].objectId;
                this.url='http://localhost:8080/Movies/classes/peliculas_favoritas/'+idFavorito;
                //Eliminar la película como favorita de la base de datos
                this.http.delete( this.url, { headers: this.headers})
                .subscribe( res => {
                  //Mostrar Toaster
                  this.toastCtrl.create({
                    message: 'Pelicula desmarcada de favoritos',
                    duration: 3000,
                    position: "bottom" 
                  }).present();
                  //Refrescar vista
                  this.obtenerPeliculas(null)
                }, err => {
                  err = err.json();
                  //Mostrar alerta de error
                  this.alertCtrl.create({
                    title: "Error",
                    subTitle: "Ha ocurrido un error. Por favor intente más tarde",
                    message: err.error,
                    buttons: [{ text: "Aceptar" }]
                  }).present();
                })
              }, err => {
                //Mostrar alerta de error
                this.alertCtrl.create({
                  title: "Error",
                  subTitle: "Ha ocurrido un error. Por favor intente más tarde",
                  message: err.error,
                  buttons: [{ text: "Aceptar" }]
                }).present();
            })
  }

/*====================================================
     Agregar comentario                     
=======================================================*/
  agregarComentario(pelicula){
    //Mostrar alert con campos de formulario
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
          placeholder: 'Ingresa tu comentario',
        }
      ],
      
        buttons: [
          { text: 'Cancelar'},
          {
            text: 'Comentar',
            handler: data => {
              //Verificar que no hayan campos vacíos
              if (data.tituloComentario === "" || data.comentario === ""){
                this.toastCtrl.create({
                  message: "Comentario no enviado. No deben haber campos vacíos",
                  showCloseButton: true,
                  closeButtonText: "Cerrar",
                  position: "middle"
                }).present()
                return;
              }
              //Mostrar loader
              let loading = this.loadingCtrl.create({ content: "Enviando comentario "})
              loading.present();
              //Acciones a realizar.
              this.url="http://localhost:8080/Movies/classes/peliculas_comentarios/"
              this.http.post(this.url, { usuario: this.idUsuario, idPelicula: pelicula.objectId, pelicula: pelicula.titulo, titulo_comentario: data.tituloComentario, comentario: data.comentario }, { headers: this.headers})
                        .map( res => res.json())
                        .subscribe( res => {
                          //Eliminar loader
                          loading.dismiss();
                          //Mostrar toaster
                          this.toastCtrl.create({
                            message: "Comentario enviado correctamente.",
                            duration: 300,
                            position: "bottom",
                          }).present();
                          this.obtenerPeliculas(null);
                         
                        }, err =>{
                          err = err.json();
                          //Mostrar toaster de error
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
}
