app.controller('IndexController', ['$scope',  '$http', '$rootScope', '$window', function($scope,  $http, $rootScope, $window) {

  // User is the global obj we use to check the user login status
  $scope.user = JSON.parse(window.localStorage.user);

  $scope.logout = function() {
    // user is logging out
    $http.get("/logout");
    // update global object
    window.localStorage.removeItem('user');
    // update local copy of the global obj
    $scope.user = window.localStorage.user;
    console.log($scope.user)
  }
}]);
