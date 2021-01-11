'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "98ee89fdcde6918d9f1e69241a09eb83",
"index.html": "a52143edd735d41e8fbeb8217eab532f",
"/": "a52143edd735d41e8fbeb8217eab532f",
"main.dart.js": "afbd775424aaf50faf70d4f865a3d603",
"assets/AssetManifest.json": "148e59be2113554c5fb2d70a1acea41c",
"assets/NOTICES": "19ce36e1cc15aa4b3315794203767a5a",
"assets/FontManifest.json": "ffa3da2f631363bd4d88edf76f5e8ef7",
"assets/fonts/Poppins-Medium.ttf": "ba95810b56f476990ca71d15139d5111",
"assets/fonts/Poppins-Regular.ttf": "41e8dead03fb979ecc23b8dfb0fef627",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/fonts/Poppins-Bold.ttf": "c23534acbeddbaadfd0ab2d2bbfdfc84",
"assets/fonts/Poppins-Thin.ttf": "c0fafa8397437c95848724aed686d63b",
"assets/assets/images/news.png": "db65d04fa10f9f484e280cb83bce4758",
"assets/assets/images/loader.png": "452561fa39165cd99d3ec7a0f497336f",
"assets/assets/images/medi.jpg": "5db6c6ce0e02f29918e9a197491dd77f",
"assets/assets/images/amavas.png": "3152f2bd528cb8024a8abe68ee753edb",
"assets/assets/images/gallery.png": "d48f075ddd44ce2e55487faefa7a2fdd",
"assets/assets/images/bhajanlalji.png": "1b32281fd236f47f5b499b4b24181fc4",
"assets/assets/images/jambhgurutrans.png": "435029f045d27469100db4b9aee0be5c",
"assets/assets/images/aum.jpg": "e5d6e3a7ec8dbb6a5db9bd1b9ce54572",
"assets/assets/images/kids.png": "8243b208530243b3a4a6bbe9b636ef5f",
"assets/assets/images/music.png": "19888854f2fc229a3e04f3e339417867",
"assets/assets/images/jambhguru.png": "0cbb9617ab5281f8553303ede824180c",
"assets/assets/images/earth.png": "eae4c4c778c9495e2fb0f23cefee1588",
"assets/assets/images/gurujinew.jpeg": "41a3f04a02dd882710ada43b7b812bcb",
"assets/assets/images/gurujipaper.jpg": "d37e27ed2cdbd5010107cdeb051dd7bb",
"assets/assets/images/jambhgurucircle.png": "8ddfb4887be44adf0c779ea6fcda758c",
"assets/assets/images/tree.png": "2f570c1bcf8e5a059b92447b865314c1",
"assets/assets/images/jambhgurutrans_new.png": "0667c3f10cbb8144623c2ff9a8bcfdc2",
"assets/assets/images/youtube.png": "84a99d574d8d3068adbfe62f05bc859e",
"assets/assets/images/more.png": "e5361d198d657d28bfe9d72f233e5d88",
"assets/assets/images/facebook.png": "c8b9937c3742cb90994e9b03928e0b5c",
"assets/assets/json/events.json": "cde8102ff9e166cb9a9832a0a9d187c6",
"assets/assets/json/shabd_content.json": "9d5d2af2c0922d62e25fa1fea6686181",
"assets/assets/json/bl_titles.json": "4acf436002594ffa415aef53191d83c0",
"assets/assets/json/bl_content.json": "91dfc0b279e88941a418cb7b95980d93",
"assets/assets/json/shabd_titles.json": "c5a72041bd0915fb56157571358a3f46"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
