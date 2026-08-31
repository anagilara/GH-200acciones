"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { UserService } = require("./userService");

const webDirectory = path.join(__dirname, "web");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON invalido"));
      }
    });

    req.on("error", reject);
  });
}

function sendFile(res, statusCode, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "Recurso no encontrado" });
      return;
    }

    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(data);
  });
}

function serveWebAsset(pathname, res) {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname.replace(/^\/web/, "");
  const requestedPath = path.join(webDirectory, normalizedPath);
  const safePath = path.resolve(requestedPath);

  if (!safePath.startsWith(path.resolve(webDirectory))) {
    sendJson(res, 400, { error: "Ruta invalida" });
    return true;
  }

  const extension = path.extname(safePath);
  const contentType = mimeTypes[extension];
  if (!contentType) {
    sendJson(res, 404, { error: "Recurso no soportado" });
    return true;
  }

  sendFile(res, 200, safePath, contentType);
  return true;
}

function createApp() {
  const userService = new UserService();

  return http.createServer(async (req, res) => {
    try {
      const method = req.method || "GET";
      const requestUrl = new URL(req.url || "/", "http://localhost");
      const pathname = requestUrl.pathname;

      if (method === "GET" && (pathname === "/" || pathname.startsWith("/web/"))) {
        serveWebAsset(pathname, res);
        return;
      }

      if (method === "GET" && pathname === "/health") {
        sendJson(res, 200, { status: "ok" });
        return;
      }

      if (method === "GET" && pathname === "/users") {
        const includeTenure = requestUrl.searchParams.get("includeTenure") === "true";
        const users = userService.listUsers({ includeTenure });
        sendJson(res, 200, users);
        return;
      }

      if (method === "POST" && pathname === "/users") {
        const payload = await parseJsonBody(req);
        const created = userService.createUser(payload);
        sendJson(res, 201, created);
        return;
      }

      const userMatch = pathname.match(/^\/users\/(\d+)$/);
      if (userMatch) {
        const userId = userMatch[1];

        if (method === "GET") {
          const user = userService.getUserById(userId);
          if (!user) {
            sendJson(res, 404, { error: "Usuario no encontrado" });
            return;
          }
          sendJson(res, 200, user);
          return;
        }

        if (method === "PUT") {
          const payload = await parseJsonBody(req);
          const updated = userService.updateUser(userId, payload);
          if (!updated) {
            sendJson(res, 404, { error: "Usuario no encontrado" });
            return;
          }
          sendJson(res, 200, updated);
          return;
        }

        if (method === "DELETE") {
          const deleted = userService.deleteUser(userId);
          if (!deleted) {
            sendJson(res, 404, { error: "Usuario no encontrado" });
            return;
          }
          sendJson(res, 204, {});
          return;
        }
      }

      const tenureMatch = pathname.match(/^\/users\/(\d+)\/tenure$/);
      if (method === "GET" && tenureMatch) {
        const user = userService.getUserWithTenure(tenureMatch[1]);
        if (!user) {
          sendJson(res, 404, { error: "Usuario no encontrado" });
          return;
        }
        sendJson(res, 200, user);
        return;
      }

      sendJson(res, 404, { error: "Ruta no encontrada" });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
  });
}

module.exports = {
  createApp
};
