Dragon Racer (ionic)
=====================

# dragonracer
An Ionic Framework and Cordova project featuring pixie (2d animation library), gsap (tween), and angular audio.

This ionic project also utilises SASS as it's CSS framework. 

The game is simple, choose how many dragons you want, change the "odds" of each dragon winning (i.e. a real horse race) and bet on the dragon. Utilising a random generator, simulate a real betting and racing enviroment.

All options are configurable (including what animates, how many "steps" there are in the race, disable audio, name each dragon etc)

## Installation

You will need to include ionic-cli on your computer, then git clone the repo and run npm install && bower install. To run it, simply open your terminal/cmd prompt, cd to the directory, and run ionic serve.

Even better, download the ionic app and simulate it running on your phone!

## Using this project

We recommend using the [Ionic CLI](https://github.com/driftyco/ionic-cli) to create new Ionic projects that are based on this project but use a ready-made starter template.

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ npm install -g ionic
```

Then run:

```bash
$ ionic start myProject tabs
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.

### With the Ionic tool:

Take the name after `ionic-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myApp sidemenu
```

Then, to run it, cd into `myApp` and run:

```bash
$ ionic platform add ios
$ ionic build ios
$ ionic emulate ios
```

Substitute ios for android if not on a Mac, but if you can, the ios development toolchain is a lot easier to work with until you need to do anything custom to Android.

## Demo
http://plnkr.co/edit/0RXSDB?p=preview

## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/contribute/#issues) to the main Ionic repository. On the other hand, pull requests are welcome here!



