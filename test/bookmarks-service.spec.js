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
    const secondID = "2";
    const secontTestArticle = data[secondID - 1];
    return supertest(app)
      .get(`/bookmarks/${secondID}`)
      .expect(200, secontTestArticle);
  });
});

describe(`POST /articles`, () => {
  it(`creates an article, responding with 201 and the new article`, function () {
    return supertest(app)
      .post("/bookmarks")
      .send({
        title: "Test new article",
        url: "www.newurl.com",
        description: "Listicle",
        rating: 1,
      })
      .expect(201);
  });

  describe(`DELETE /bookmarks/:id`, () => {
    context("Given there are bookmarks in the database", () => {
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(data);
      });

      it("responds with 204 and removes the article", () => {
        const idToRemove = "1";
        const expectedBookmarks = data.filter((bm) => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/bookmarks`).expect(expectedBookmarks)
          );
      });
    });
  });
});

/*
- 1 happy path per endpoint
- does it exist
- is it the right data type
- is it the right value

*/
