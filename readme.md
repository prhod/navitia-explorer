Navitia Explorer
================

Introduction
------------
This site is a simple tool to visualize and manipulate easily the data and APIs of navitia.
It could be used as an example of an integration of the APIs or as a debugging data tool.

Organisation
------------
Except for the JavaScript and images in the subfolder `/assets`, the root folder contains:
* HTML pages, one page for each screen of the site
* `navitia.php` : needed to secure the use of the token needed by the navitia's API call
* `params.default.json` : configuration template file (copy and edit to a `params.json` file to be effective)

How to install on Ubuntu
------------------------
From a scratch installation of Ubuntu this is one possibility (not the only one):
* Clone the project where you want to work (`git clone`)
* Install `apache2`, `php5`,`php5-curl` and `libapache2-mod-php5` (`sudo apt-get install apache2 php5 php5-curl libapache2-mod-php5`)
* Create a symbolic link of the project in `/var/www/html/` (`ln -sf /complete/path/to/navitia-explorer /var/www/html/navitia-explorer`)
* In the root of you project, create and edit `params.json` (`cp params.default.json params.json`)
* One might have to restart apache (`sudo service apache2 restart`)
* Enjoy! (`firefox http://localhost/navitia-explorer/journey.html`)

How to contribute
-----------------
Fork the github repo, create a new branch, and submit your pull request!
 
