const knex = require("knex");
const BookmarksService = require("../src/bookmarks-service");
const { makeBookmarksArray } = require("./bookmarks.fixtures");
const supertest = require("supertest");
const app = require("../src/app");
const { destroy } = require("../src/logger");

let db;
let data = makeBookmarksArray();

before(() => {
  db = knex({
    client: "pg",
    connection: process.env.TEST_DB_URL,
  });
  app.set("db", db);
});

before(() => db("bookmarks").truncate());
afterEach(() => db("bookmarks").truncate());
after(() => db.destroy());

context("it testes the get/bookmarks with DATA", () => {
  beforeEach(() => {
    return db.into("bookmarks").insert(data);
  });

  it("publishes all bookmarks on table", () => {
    return supertest(app).get("/bookmarks").expect(200, data);
  });
});
