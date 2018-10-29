const axios = require("axios");
const db = require("../db");

function flattenArray(arr) {
  return arr.reduce((acc, cur) => {
    return [...acc, ...cur];
  }, []);
}

exports.getUnsplashImages = async (req, res, next) => {
  try {
    //  const { searchTerm, numPages, startPage } = req.body;
   //  done: portrait 4 pages, start 1; animals 40 pages, start 1
    const searchTerm = "animals",
      numPages = 40,
      startPage = 1;
    if (searchTerm && numPages && startPage) {
      const requests = [];
      for (var i = startPage; i <= startPage + numPages - 1; i++) {
        requests.push(
          axios.get("https://api.unsplash.com/search/photos/", {
            params: { query: searchTerm, per_page: 30, page: i }
          })
        );
      }
      const resolvedPromises = await Promise.all(requests);
      const resultsArr = resolvedPromises.map(x => x.data.results);
      const results = flattenArray(resultsArr);
      const insertData = results.map(x => [
        searchTerm,
        x.urls.raw,
        x.urls.full,
        x.urls.regular,
        x.urls.small,
        x.urls.thumb
      ]);
      const sql =
        "INSERT INTO images (type, raw_url, full_url, regular_url, small_url, thumb_url) VALUES ?";
      db.query(sql, [insertData], (err, result) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ result });
        }
      });
    } else {
      next({
        message: "Required parameters are searchTerm, numPages, and startPage"
      });
    }
  } catch (err) {
    next(err);
  }
};
