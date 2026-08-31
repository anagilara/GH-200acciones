"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateCustomerTenure } = require("../package/index");

test("calcula antiguedad en anos, meses y dias", () => {
  const tenure = calculateCustomerTenure("2020-01-15", "2023-03-20");

  assert.deepEqual(tenure, {
    years: 3,
    months: 2,
    days: 5,
    totalDays: 1160
  });
});

test("lanza error cuando clientSince es futuro", () => {
  assert.throws(
    () => calculateCustomerTenure("2099-01-01", "2026-01-01"),
    /fecha futura/
  );
});

test("lanza error cuando la fecha es invalida", () => {
  assert.throws(
    () => calculateCustomerTenure("no-es-fecha", "2026-01-01"),
    /fecha valida/
  );
});
