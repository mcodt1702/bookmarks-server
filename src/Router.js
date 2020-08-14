const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("./logger");

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const BookmarksService = require("./bookmarks-service");
const xss = require("xss");

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
});

bookmarksRouter
  .route("/api/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");

    BookmarksService.getAllArticles(knexInstance)
      .then((bookmark) => {
        res.status(200).json(bookmark);
      })
      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { title, url, description, rating } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }

    if (!url) {
      logger.error(`URL is required`);
      return res.status(400).send("Invalid data");
    }

    if (!description) {
      logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
    }

    if (rating < 0 || rating > 5) {
      logger.error("rating must be between 1 to 5");
      return res
        .status(400)
        .send("Invalid Data, rating should be between 1 and 5");
    }

    const id = uuid();

    const newBookmark = {
      id,
      title,
      url,
      description,
      rating,
    };

    BookmarksService.insertArticle(knexInstance, newBookmark)
      .then((bookmark) => {
        res.status(201).json({
          id: bookmark.id,
          title: xss(bookmark.title),
          url: xss(bookmark.url),
          description: xss(bookmark.description),
          rating: bookmark.rating,
        });
      })
      .catch(next);
  });

bookmarksRouter

  .route("/api/bookmarks/:bookmark_id")
  .all((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.getById(req.app.get("db"), bookmark_id)
      .then((bookmark) => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` },
          });
        }
        res.bookmark = bookmark; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const newBookmarkFields = { title, url, rating, description };

    BookmarksService.updateBookmark(
      req.app.get("db"),
      req.params.bookmark_id,
      newBookmarkFields
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    // TODO: update to use db
    const knexInstance = req.app.get("db");
    const { bookmark_id } = req.params;
    BookmarksService.deleteArticle(knexInstance, bookmark_id)
      .then((numRowsAffected) => {
        logger.info(`Card with id ${bookmark_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
