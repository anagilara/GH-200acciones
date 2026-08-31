"use strict";

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("clientSince debe ser una fecha valida");
  }
  return date;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function calculateCustomerTenure(clientSince, asOf = new Date()) {
  const start = toDate(clientSince);
  const end = toDate(asOf);

  if (start.getTime() > end.getTime()) {
    throw new Error("clientSince no puede ser una fecha futura");
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = (end.getMonth() + 11) % 12;
    const yearOfPreviousMonth = previousMonth === 11 ? end.getFullYear() - 1 : end.getFullYear();
    days += daysInMonth(yearOfPreviousMonth, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay);

  return {
    years,
    months,
    days,
    totalDays
  };
}

module.exports = {
  calculateCustomerTenure
};
