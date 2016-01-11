app.controller('SettingsController', ['$scope', '$http', function($scope, $http) {


  $scope.user = JSON.parse(window.localStorage.user);

  $scope.save = function(field, newValue) {
    // disable all save buttons
    $(".btn-succes").prop("disabled", true);
    switch (field) {
      case "name":
      $scope.user.fullName = newValue;
      $scope.showChangeName = false;
      break;
      case "city":
      $scope.user.city = newValue;
      $scope.showChangeCity = false;
      break;
      case "state":
      $scope.user.state = newValue;
      $scope.showChangeState = false;
      break;
    }
    // TODO save changes to DB
    $http.post("/api/user/" + $scope.user._id, $scope.user)
    .success(function (data, status) {
      console.log('User updated.');
    })
    .error(function (data) {
      console.log('Error: ' + data);
    });
    // re-enable all save buttons
    $(".btn-succes").prop("disabled", false);
  }

}]);
