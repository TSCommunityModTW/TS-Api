use actix_web::{Responder, get, HttpResponse};

#[get("/assets")]
pub async fn assets() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}