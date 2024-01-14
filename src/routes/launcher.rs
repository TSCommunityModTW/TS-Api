use actix_web::web;

use crate::handlers::launcher::assets;

pub fn launcher_routes() -> actix_web::Scope {
    web::scope("/launcher")
        .service(assets)
}