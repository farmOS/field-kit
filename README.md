# farmOS Field Kit

[![Licence](https://img.shields.io/badge/Licence-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0/)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/field-kit.svg?style=flat)](https://github.com/farmOS/field-kit/commits)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Field Kit is a lightweight application for connecting to a farmOS server from any mobile device. It is a Progressive Web App (PWA), meaning it can run from a browser, even offline, and will persist data in between sessions.

Note that the default branch for this repository is `develop`, not `master`;
`develop` should represent the most current set of complete features that
are only awaiting further testing before release. You should branch or fork
off `develop` and submit pull requests to be merged back into it. The 
`deploy` branch represents the latest tagged release.

As of September 2021, the `develop` branch will point at the latest alpha or beta version for the upcoming 2.0.0 release, compatible with farmOS 2.x. Versions 0.8 and lower will only receive minimal support going forward, with no new feature development. Stay tuned for more details on the forthcoming Field Module API, which will enable developers to develop modules for Field Kit, similar to farmOS modules!

## GETTING STARTED

To run the Field Kit in your browser using the Webpack DevServer, clone this repo and run:
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm start
```

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
 * [OpenTEAM](https://openteam.community)
