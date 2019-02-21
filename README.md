# farmOS Client

[![Licence](https://img.shields.io/badge/Licence-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0/)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/farmOS-client.svg?style=flat)](https://github.com/farmOS/farmOS-client/commits)
[![Twitter](https://img.shields.io/twitter/follow/farmOSorg.svg?label=%40farmOSorg&style=flat)](https://twitter.com/farmOSorg)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Client is a lightweight application for connecting to a farmOS server from any mobile device. It is a hybrid app, meaning it can run in a web browser but can also be packaged as a native app for iOS and Android. The goal is to create a fast and focused client app for day-to-day and in-the-field record keeping that stores data locally for offline use, and syncs back to a farmOS server when internet access is available.

The application consists of the main client, which provides the UI and core features, in addition to native plugins, which provide specific support for native functionality, like the ability to persist data and access the camera. It is built using Vue.js and Apache Cordova.

## GETTING STARTED

To run the client in your browser using the Webpack DevServer, clone this repo and run:
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm start
```

For more details on the client's development and how to build it from source for native devices, see the [documentation on farmos.org](https://farmos.org/development/client/).

If you would like to install and host a farmOS server yourself, see the official
documentation on farmOS.org: https://farmOS.org/hosting/installing

If you would like to pay for hosting, [Farmier](https://farmier.com) provides
affordable options for individual farms and organizations.

## MAINTAINERS

Current maintainers:
 * Jamie Gaehring - https://jgaehring.com

This project has been sponsored by:
 * [Farmier](http://farmier.com)
 * [Paicines Ranch](https://paicinesranch.com/index.php)
 * [Knuth Farms](https://knuthfarms.com/)
