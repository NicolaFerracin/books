app.controller('HomeController', ['$scope', '$http', function($scope, $http) {

  $scope.toggleBooks = false;

  $scope.showBooks = function() {
      $("#loggedInHome").slideUp({ duration: 1000, queue: false }).fadeOut({ duration: 1000, queue: false});
      $scope.toggleBooks = true;
  }

}]);
