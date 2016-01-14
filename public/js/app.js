// angular routing
var app = angular.module('BooksApp', ['ngRoute']);

app.run(function($rootScope, $location, $http) {
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    var privateViews = ["views/settings.html", "views/myBooks.html", "views/myTrades.html"];
    // if the url is private
    if (privateViews.indexOf(next.templateUrl) > -1) {
      // check if user is logged in
      // if NOT logged in redirect to login page
      $http.get("/loggedIn")
      .success(function(data) {
        if (!data) {
          $location.path("/login");
        }
      })
      .error(function(err) {
        console.log("An error occured: " + err);
      })
    }
  });
});

// route provider to redirect the user to the requested view, using a single page application setup
app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/login', {
    controller: 'LoginController',
    templateUrl: 'views/login.html'
  })
  .when('/signup', {
    controller: 'SignupController',
    templateUrl: 'views/signup.html'
  })
  .when('/settings', {
    controller: 'SettingsController',
    templateUrl: 'views/settings.html'
  })
  .when('/myBooks', {
    controller: 'MyBooksController',
    templateUrl: 'views/myBooks.html'
  })
  .when('/myTrades', {
    controller: 'MyTradesController',
    templateUrl: 'views/myTrades.html'
  })
  .otherwise({
    controller: 'HomeController',
    templateUrl: 'views/home.html'
  });


  // use the HTML5 History API
  // this line is needed because the SPA urls would show # characters otherwise. It also needs line 6 in index.html
  $locationProvider.html5Mode(true);
});

app.factory('loggedIn', function($http) {
    return {
      getUser: function() {
         return $http.get('/loggedIn');
      }
    }
  });
