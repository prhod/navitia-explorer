Navitia Explorer
================

Introduction
------------
This site is a simple tool to visualize and manipulate easily the data and APIs of navitia.
It could be used as an example of an integration of the APIs or as a debugging data tool.

Organisation
------------
Navitia has a CORS configuration activated, that doesn't allow the browser to make direct API calls.
Except for the JavaScript, CSS and images in the subfolder `/assets`, the root folder contains:
* HTML pages, one page for each screen of the site
* `params.default.json` : configuration template file (copy and edit to a `params.json` file to be effective)
* the `proxy` folder conains the python proxy

How to quick use with python
----------------

There is a need of a web server to quick use :
* Clone the project where you want to work (`git clone`)
* In the root of you project, create and edit `params.json` (`cp params.default.json params.json`)
* run `python ./proxy/server.py`
* Enjoy!

How to install properly on Ubuntu 
------------------------

To use Apache, you can :
* Install `apache2` (`sudo apt-get install apache2`)
* Create a symbolic link of the project in `/var/www/html/` (`ln -sf /complete/path/to/navitia-explorer /var/www/html/navitia-explorer`)
* One might have to restart apache (`sudo service apache2 restart`)
* Enjoy! (`firefox http://localhost/navitia-explorer/journey.html`)

How to contribute
-----------------
Fork the github repo, create a new branch, and submit your pull request!
