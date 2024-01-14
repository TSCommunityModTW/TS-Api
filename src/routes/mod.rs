use actix_web::{web, HttpRequest, Responder, HttpResponse, get};
use serde_json::json;

use self::launcher::launcher_routes;

mod launcher;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/api/v1")
        .service(index)
        .service(launcher_routes())
    );
}

#[get("")]
async fn index(req: HttpRequest) -> impl Responder {

    const VERSION: Option<&str> = option_env!("CARGO_PKG_VERSION");

    HttpResponse::Ok().json(json!({
        "message": "OK",
        "version": VERSION.unwrap_or("Error: Unknown version"),
        "ip": req.peer_addr()
    }))
}