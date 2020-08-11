const knex = require("knex");

const { makeBookmarksArray } = require("./bookmarks.fixtures");
const supertest = require("supertest");
const app = require("../src/app");
const { destroy } = require("../src/logger");

let db;
const data = makeBookmarksArray();

before(() => {
  db = knex({
    client: "pg",
    connection: process.env.TEST_DB_URL,
  });
  app.set("db", db);
});

before("clean the table", () => db("bookmarks").truncate());

after("disconnect from db", () => db.destroy());
afterEach("cleanup", () => db("bookmarks").truncate());

context("it testes the get/bookmarks with DATA", () => {
  beforeEach(() => {
    return db.into("bookmarks").insert(data);
  });

  it("publishes all bookmarks on table", () => {
    return supertest(app).get("/bookmarks").expect(200);
  });
});

context("it testes the get/bookmarks:id endpoint witht data", () => {
  beforeEach("load the data to the DB", () => {
    return db.into("bookmarks").insert(data);
  });

  it("publishes the correct item from id", () => {
    const secondID = "cjozyzcil0000lxygs3gyg2mr";
    const secontTestArticle = data[0];
    return supertest(app)
      .get(`/bookmarks/${secondID}`)
      .expect(200, {
        id: "cjozyzcil0000lxygs3gyg2mr",
        title: "Thinkful",
        url: "https://www.thinkful.com",
        description: "Think outside the classroom",
        rating: 5,
      });
  });
});

/*
- 1 happy path per endpoint
- does it exist
- is it the right data type
- is it the right value

*/
