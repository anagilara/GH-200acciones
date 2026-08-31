"use strict";

const { calculateCustomerTenure } = require("../package/index");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeUserPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("El cuerpo de la solicitud debe ser un objeto JSON");
  }

  const { name, email, clientSince } = payload;

  if (!isNonEmptyString(name)) {
    throw new Error("name es obligatorio");
  }

  if (!isNonEmptyString(email)) {
    throw new Error("email es obligatorio");
  }

  if (!isNonEmptyString(clientSince)) {
    throw new Error("clientSince es obligatorio y debe tener formato de fecha");
  }

  const parsedClientSince = new Date(clientSince);
  if (Number.isNaN(parsedClientSince.getTime())) {
    throw new Error("clientSince debe ser una fecha valida");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    clientSince: parsedClientSince.toISOString().slice(0, 10)
  };
}

class UserService {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }

  createUser(payload) {
    const normalized = normalizeUserPayload(payload);
    const now = new Date().toISOString();

    const user = {
      id: String(this.nextId++),
      ...normalized,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(user.id, user);
    return { ...user };
  }

  listUsers(options = {}) {
    const { includeTenure = false, asOf = new Date() } = options;
    return Array.from(this.users.values()).map((user) => {
      if (!includeTenure) {
        return { ...user };
      }

      return {
        ...user,
        tenure: calculateCustomerTenure(user.clientSince, asOf)
      };
    });
  }

  getUserById(id) {
    const user = this.users.get(String(id));
    return user ? { ...user } : null;
  }

  getUserWithTenure(id, asOf = new Date()) {
    const user = this.getUserById(id);
    if (!user) {
      return null;
    }

    return {
      ...user,
      tenure: calculateCustomerTenure(user.clientSince, asOf)
    };
  }

  updateUser(id, updates) {
    const existing = this.users.get(String(id));
    if (!existing) {
      return null;
    }

    const merged = {
      name: updates?.name ?? existing.name,
      email: updates?.email ?? existing.email,
      clientSince: updates?.clientSince ?? existing.clientSince
    };

    const normalized = normalizeUserPayload(merged);

    const updatedUser = {
      ...existing,
      ...normalized,
      updatedAt: new Date().toISOString()
    };

    this.users.set(updatedUser.id, updatedUser);
    return { ...updatedUser };
  }

  deleteUser(id) {
    return this.users.delete(String(id));
  }
}

module.exports = {
  UserService,
  normalizeUserPayload
};
