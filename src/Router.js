const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("./logger");
const bookmarks = require("./store");
const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })

  .post(bodyParser, (req, res) => {
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

    const id = uuid();

    const bookmark = {
      id,
      title,
      url,
      description,
      rating,
    };

    bookmarks.push(bookmark);
    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find((c) => c.id == id);

    // make sure we found a card
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  }) // move implementation logic into here

  .delete((req, res) => {
    const { id } = req.params;
    const markIndex = bookmarks.findIndex((c) => c.id == id);

    if (markIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    //remove card from lists
    //assume cardIds are not duplicated in the cardIds array

    bookmarks.splice(markIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);

    res.status(204).end();
  }); // move implementation logic into here

module.exports = bookmarksRouter;
