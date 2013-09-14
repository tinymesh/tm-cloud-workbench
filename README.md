# Tinymesh Cloud - Workbench

The workbench application provides a web GUI to aid in development,
deployment and management of Tinymesh networks.

The application depends on code from AngularJS, UnderscoreJS and Bootstrap

## Working with your local copy

The code utilizes `grunt`[1] and `npm`[2] to for dependency management and
building. The following command will aid you in getting started with
your local copy:

```bash
# Fetch all dependencies
$ npm install

# Building the code
$ grunt build

# Run a local copy on port :8080
$ grunt dev
```

## Contributing
Tinymesh encourages contributions to the Workbench from the community.
All changes are managed by git[1], and changes should be made using
the following guidelines:

 - Create a fork of the repository [2]
 - Create a new branch. The name should contain your username and some keywords
   describing your changes, for example: `lafka-update-message-view`
 - Push your branch to git and create a pull request [3]
 - A Tinymesh engineer will review your changes and possibly merge them.

As a second option you can send patches to `code <at> tiny-mesh.com`.

[1] GIT is a version control system, to learn git checkout http://www.git-scm.com/book
[2] https://help.github.com/articles/fork-a-repo
[3] https://help.github.com/articles/using-pull-requests

## Licensing

The code for the Workbench application is released under a 2-clause
BSD license. This license can be found in the `./LICENSE` file.

Additionally the application dependencies uses the following licenses:

+ AngularJS:    MIT license - https://github.com/angular/angular.js/blob/master/LICENSE
+ UnderscoreJS: MIT license - https://github.com/jashkenas/underscore/blob/master/LICENSE
+ Bootstrap:    Apache 2.0 License - https://github.com/twbs/bootstrap/blob/master/LICENSE
