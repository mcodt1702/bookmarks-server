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

context("it testes the get/api/bookmarks with DATA", () => {
  beforeEach(() => {
    return db.into("bookmarks").insert(data);
  });

  it("publishes all bookmarks on table", () => {
    return supertest(app).get("/api/bookmarks").expect(200);
  });
});

context("it testes the get/api/bookmarks:id endpoint witht data", () => {
  beforeEach("load the data to the DB", () => {
    return db.into("bookmarks").insert(data);
  });

  it("publishes the correct item from id", () => {
    const secondID = "2";
    const secontTestbookmark = data[secondID - 1];
    return supertest(app)
      .get(`/api/bookmarks/${secondID}`)
      .expect(200, secontTestbookmark);
  });
});

describe(`POST /bookmarks`, () => {
  it(`creates an bookmark, responding with 201 and the new bookmark`, function () {
    return supertest(app)
      .post("/api/bookmarks")
      .send({
        title: "Test new bookmark",
        url: "www.newurl.com",
        description: "Listicle",
        rating: 1,
      })
      .expect(201);
  });

  describe(`DELETE /api/bookmarks/:id`, () => {
    context("Given there are bookmarks in the database", () => {
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(data);
      });

      it("responds with 204 and removes the bookmark", () => {
        const idToRemove = "2";
        const expectedBookmarks = data.filter((bm) => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/bookmarks`).expect(expectedBookmarks)
          );
      });
    });
  });

  describe("patch/api/bookarks", () => {
    context("with no bookmarks in the database", () => {
      it(`responds with 404`, () => {
        const articleId = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${articleId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });
    context("given there is data in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(data);
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)

          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must content either 'title', 'url', 'description' or 'rating'`,
            },
          });
      });

      it("respons with a 204 and updates the bookmark given an id", () => {
        const idToUpdate = 3;
        const updateArticle = {
          title: "updated bookmark",
          url: "www.newurl.com",
          description: "updated bookmark shines ",
          rating: 1,
        };

        const expectedBookmark = {
          ...data[idToUpdate - 1],
          ...updateArticle,
        };
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send(updateArticle)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/bookmarks/3`).expect(expectedBookmark)
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
