// angular routing
var app = angular.module('BooksApp', ['ngRoute']);

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

app.run(function($rootScope, $location, $http) {
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    var privateViews = ["views/settings.html", "views/myBooks.html"];
    // check if user is loggedin
    $http.get("/loggedin")
    .success(function (data) {
      window.localStorage.setItem('user', JSON.stringify(data));
    })
    .error(function (err) {
      console.log('Error: ' + err);
    });

    if (privateViews.indexOf(next.templateUrl) > -1) {
      if (!data.local.email) {
        $location.path("/login");
      }
    }
  });
});
