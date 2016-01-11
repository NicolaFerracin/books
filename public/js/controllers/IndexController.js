app.controller('IndexController', ['$scope',  '$http', '$window', function($scope,  $http, $window) {

  // User is the global obj we use to check the user login status
  $http.get("/loggedIn")
  .success(function(data) {
    window.localStorage.setItem('user', JSON.stringify(data));
    $scope.user = JSON.parse(window.localStorage.user);
  })
  .error(function(err) {
    console.log("An error occured: " + err);
  })



  $scope.logout = function() {
    // user is logging out
    $http.get("/logout")
    .success(function() {
      // update global object
      window.localStorage.removeItem('user');
      // update local copy of the global obj
      $scope.user = undefined;
      var privateLocations = ["/settings", "/myBooks"];
      if (privateLocations.indexOf(window.location.pathname) > -1) {
        $window.location = "/login";
      }
    })
    .error(function(err) {
      console.log("An error occured: " + err);
    })
  }
}]);
