"use strict";

const userForm = document.querySelector("#user-form");
const usersBody = document.querySelector("#users-body");
const formMessage = document.querySelector("#form-message");
const listMessage = document.querySelector("#list-message");
const refreshButton = document.querySelector("#refresh-btn");

function showMessage(target, text, isError = false) {
  target.textContent = text;
  target.style.color = isError ? "#9e2f12" : "#1f5f4b";
}

function tenureText(tenure) {
  if (!tenure) {
    return "-";
  }

  return `${tenure.years}a ${tenure.months}m ${tenure.days}d`;
}

function buildRow(user) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${user.id}</td>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.clientSince}</td>
    <td>${tenureText(user.tenure)}</td>
    <td>
      <button type="button" class="btn-delete" data-user-id="${user.id}">Eliminar</button>
    </td>
  `;
  return tr;
}

async function loadUsers() {
  try {
    showMessage(listMessage, "Cargando usuarios...");
    const response = await fetch("/users?includeTenure=true");
    const users = await response.json();

    if (!response.ok) {
      throw new Error(users.error || "No se pudo listar usuarios");
    }

    usersBody.innerHTML = "";

    if (users.length === 0) {
      showMessage(listMessage, "No hay usuarios registrados.");
      return;
    }

    users.forEach((user) => {
      usersBody.appendChild(buildRow(user));
    });

    showMessage(listMessage, `Total de usuarios: ${users.length}`);
  } catch (error) {
    showMessage(listMessage, error.message, true);
  }
}

async function createUser(event) {
  event.preventDefault();
  const formData = new FormData(userForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    clientSince: String(formData.get("clientSince") || "").trim()
  };

  try {
    const response = await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo crear el usuario");
    }

    userForm.reset();
    showMessage(formMessage, `Usuario ${result.name} creado correctamente.`);
    await loadUsers();
  } catch (error) {
    showMessage(formMessage, error.message, true);
  }
}

async function deleteUser(event) {
  const button = event.target;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const userId = button.dataset.userId;
  if (!userId) {
    return;
  }

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "No se pudo eliminar el usuario");
    }

    showMessage(listMessage, `Usuario ${userId} eliminado.`);
    await loadUsers();
  } catch (error) {
    showMessage(listMessage, error.message, true);
  }
}

userForm.addEventListener("submit", createUser);
usersBody.addEventListener("click", deleteUser);
refreshButton.addEventListener("click", loadUsers);

loadUsers();
