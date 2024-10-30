// service-worker.js



let cacheName = "encuestaCacheV1";


self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(cacheName).add("api/encuesta"));
  createDatabase();
});




self.addEventListener('fetch', event => {

  if (event.request.method == "post" && event.request.url.includes("api/encuesta")) {
    event.respondWith(networkIndexDbFallBack(event.request));
  }
  else if (event.request.url.includes("api/encuesta")) {
    event.respondWith(cacheFirst(event.request));

  } else {

    event.respondWith(networkOnly(event.request));
  }
});

async function networkIndexDbFallBack(req) {
  try {
    let resp = await fetc(req);
    return resp;
  } catch (e) {
    //guaradr en indexDb y regresar ok
  }
}

async function networkOnly(req) {
  try {
    let response = await fetch(req);
    if (response.ok) {
      return response;
    } else {
      return new Response("Error al obtener la respuesta de la red", { status: response.status });
    }
  } catch (error) {
    console.log(error);
    return new Response("Error al acceder a la red", { status: 500 });
  }
}


async function cacheOnly(req) {
  try {
    let cache = await caches.open(cacheName);
    let response = await cache.match(req);
    if (response) {
      return response;
    } else {
      return new Response("No se encontró en caché", { status: 404 });
    }
  } catch (x) {
    console.log(x);
    return new Response("Error al acceder al caché", { status: 500 });
  }
}

async function cacheFirst(req) {
  try {
    let cache = await caches.open(cacheName);
    let response = await cache.match(req);
    if (response) {
      return response;
    } else {
      let respuesta = await fetch(req);
      if (respuesta.ok) { // Verificar si la respuesta es válida
        cache.put(req, respuesta.clone());
      }
      return respuesta;
    }
  } catch (x) {
    console.log(x);
    return new Response("Error fetching the resource: " + req.url, { status: 500 });
  }
}

async function networkFirst(req) {
  let cache = await caches.open(cacheName);
  try {
    let respuesta = await fetch(req);
    if (respuesta.ok) {
      cache.put(req, respuesta.clone());
    }
    return respuesta;
  } catch (x) {
    let response = await cache.match(req);
    if (response) {
      return response;
    } else {
      console.log(x);
      return new Response("Recurso no disponible en caché ni en la red", { status: 503 });
    }
  }
}

async function staleWhileRevalidate(url) {
  try {
    let cache = await caches.open(cacheName);
    let response = await cache.match(url);

    let fetchPromise = fetch(url).then(async networkResponse => {
      if (networkResponse.ok) {
        await cache.put(url, networkResponse.clone());
      }
      return networkResponse;
    }).catch(err => {
      console.log("Error fetching from network:", err);
    });

    return response || fetchPromise;
  } catch (x) {
    console.log("Error en staleWhileRevalidate:", x);
    return new Response("Error interno", { status: 500 });
  }
}



let channel = new BroadcastChannel("refreshChannel")

async function staleThenRevalidate(req) {
  try {
    let cache = await caches.open(cacheName);
    let cachedResponse = await cache.match(req);

    if (cachedResponse) {
      fetch(req).then(async (networkResponse) => {
        if (networkResponse.ok) {
          let cacheData = await cachedResponse.clone().text();
          let networkData = await networkResponse.clone().text();

          if (cacheData !== networkData) {
            await cache.put(req, networkResponse.clone());
            channel.postMessage({
              url: req.url,
              data: networkData
            });
          }
        }
      }).catch(err => {
        console.log("Error al obtener la respuesta de la red:", err);
      });

      return cachedResponse.clone();
    } else {
      return networkFirst(req);
    }
  } catch (error) {
    console.log("Error en staleThenRevalidate:", error);
    return new Response("Error interno", { status: 500 });
  }
}



let maxage = 24 * 60 * 60 * 1000;

async function timeBasedCache(req) {
  try {
    let cache = await caches.open(cacheName);
    let cachedResponse = await cache.match(req);

    if (cachedResponse) {
      let fechaDescarga = cachedResponse.headers.get("fecha");

      if (fechaDescarga) {
        let fecha = new Date(fechaDescarga);
        let hoy = new Date();
        let diferencia = hoy - fecha;

        if (diferencia <= maxage) {
          return cachedResponse;
        }
      }
    }

    let networkResponse = await fetch(req);

    if (networkResponse.ok) {
      let nuevoResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: networkResponse.headers
      });
      nuevoResponse.headers.append("fecha", new Date().toISOString());  // Añadir la fecha de la descarga
      await cache.put(req, nuevoResponse.clone());  // Guardar en el caché

      return nuevoResponse;
    } else {
      return new Response("Error en la red", { status: 502 });
    }

  } catch (error) {
    console.log("Error en timeBasedCache:", error);
    return new Response("Error interno", { status: 500 });
  }
}

async function networkCacheRace(req) {
  try {
    let cache = await caches.open(cacheName);

    let networkPromise = fetch(req).then(response => {
      if (response.ok) {
        cache.put(req, response.clone());
        return response;
      }
      throw new Error("Error en la respuesta de red");
    });

    let cachePromise = cache.match(req);

    return await Promise.race([networkPromise, cachePromise]);

  } catch (error) {
    console.log("Error en networkCacheRace:", error);
    return new Response("Error en la obtención de datos", { status: 500 });
  }
}


//funciones indexdb

function createDatabase() {
  let openRequest = indexedDB.open("encuesta", 1);

  openRequest.onupgradeneeded = function () {
    let db = openRequest.result;
    db.createObjectStore('respuestas', { autoincrement: true });
  }

  openRequest.onerror = function () {
    console.log("Error", openRequest.error);
  }

  openRequest.onsuccess = function () {
  }
}
function addToDatabase(obj) {

}

function getFromDatabase() {

}

function deleteFromDatabase(id) {

}
