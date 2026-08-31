"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { UserService } = require("../src/userService");

test("crea y lista usuarios", () => {
  const service = new UserService();

  const user = service.createUser({
    name: "Ana",
    email: "Ana@Correo.com",
    clientSince: "2024-01-01"
  });

  assert.equal(user.id, "1");
  assert.equal(user.email, "ana@correo.com");

  const users = service.listUsers();
  assert.equal(users.length, 1);
  assert.equal(users[0].name, "Ana");
});

test("actualiza y elimina usuarios", () => {
  const service = new UserService();
  const user = service.createUser({
    name: "Luis",
    email: "luis@example.com",
    clientSince: "2023-06-20"
  });

  const updated = service.updateUser(user.id, {
    name: "Luis Gomez"
  });

  assert.equal(updated.name, "Luis Gomez");

  const deleted = service.deleteUser(user.id);
  assert.equal(deleted, true);
  assert.equal(service.getUserById(user.id), null);
});

test("incluye antiguedad cuando se solicita", () => {
  const service = new UserService();
  const user = service.createUser({
    name: "Carla",
    email: "carla@example.com",
    clientSince: "2020-01-15"
  });

  const userWithTenure = service.getUserWithTenure(user.id, "2023-03-20");

  assert.deepEqual(userWithTenure.tenure, {
    years: 3,
    months: 2,
    days: 5,
    totalDays: 1160
  });
});
