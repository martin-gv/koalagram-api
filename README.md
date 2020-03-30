# Koalagram API

Node/Express REST API server for the **[Koalagram app](https://github.com/martin-gv/koalagram)**. Connects to a MySQL database. Accepts HTTP requests from the front-end app and returns JSON.

### Image uploads

Requests to upload an image are first authenticated, then directly uploaded from the front-end to Amazon S3. No images are stored on the server.
