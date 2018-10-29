const axios = require("axios");

exports.generatePhotos = async users => {
  try {
    const requests = [];
    for (var i = 1; i <= 1; i++) {
      const page = i;
      requests.push(
        axios.get("https://api.unsplash.com/search/photos/", {
          params: {
            query: "animals",
            per_page: 30,
            page
          }
        })
      );
    }
    const results = await Promise.all(requests);
    const dataArr = results.reduce((acc, cur) => {
      return [...acc, ...cur.data.results];
    }, []);

    const data = [];
    dataArr.forEach(x => {
      const randUser = Math.floor(Math.random() * users.length);
      data.push([x.urls.regular, users[randUser].id]);
    });
    const sql = "INSERT INTO photos (image_url, user_id) VALUES ?";
    return { data, sql };
  } catch (err) {
    throw err;
  }
};
