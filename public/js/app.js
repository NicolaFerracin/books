// angular routing
var app = angular.module('BooksApp', ['ngRoute']);

// User global object to check loggedin status anywhere in the app
app.service('User', function () {
  return {};
})

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
  .otherwise({
    controller: 'HomeController',
    templateUrl: 'views/home.html'
  });


  // use the HTML5 History API
  // this line is needed because the SPA urls would show # characters otherwise. It also needs line 6 in index.html
  $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $location, $http, User) {
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    var privateViews = ["views/settings.html", "views/myBooks.html"];
    if (privateViews.indexOf(next.templateUrl) > -1) {
      // check if user is loggedin
      $http.get("/loggedin")
      .success(function (data) {
        User = data;
        if (!data.isLoggedIn) {
          $location.path("/login");
        }
      })
      .error(function (err) {
        console.log('Error: ' + err);
      });
    }
  });
});
