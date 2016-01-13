app.controller('SettingsController', ['$scope', '$http', '$location', function($scope, $http, $location) {


  $scope.user = JSON.parse(window.localStorage.user);


  $scope.save = function(field, newValue) {
    // if user is logged out, redirect to login page
    if (typeof $scope.user.local === 'undefined') {
      $location.path("/login");
      return;
    }

    console.log('saving')
    if (newValue == "" || !newValue) {
      console.log("error, new value is empty or not valid")
      return;
    }
    // disable all save buttons while saving
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
    // save changes to database
    $http.post("/api/user/" + $scope.user._id, $scope.user)
    .success(function (data, status) {
      console.log('User updated.');
    })
    .error(function (data) {
      console.log('Error: ' + data);
    });
    // re-enable all save buttons
    $(".btn-succes").prop("disabled", false);
    // save new user to localStorage
    window.localStorage.setItem('user', JSON.stringify($scope.user));
  }

}]);
