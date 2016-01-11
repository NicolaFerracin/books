app.controller('SettingsController', ['$scope', '$http', '$window', '$rootScope', function($scope, $http, $window, $rootScope) {


  $scope.user = JSON.parse(window.localStorage.user);


}]);
