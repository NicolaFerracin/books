app.controller('SettingsController', function($scope, $http, $location, loggedIn) {

  // check if user logged in and set boolean
  loggedIn.getUser().then(
    function(payload) {
      if (payload.data) {
        $scope.city = payload.data.city;
        $scope.fullName = payload.data.fullName;
        $scope.state = payload.data.state;
      } else {
        console.log("The user is logged out")
      }
    },
    function(errorPayload) {
      console.log("Error: " + errorPayload)
    });

  $scope.save = function(field, newValue) {
    // check if user logged in
    loggedIn.getUser().then(
      function(payload) {
        if (payload.data) {
          var user = { city : $scope.city, state : $scope.state, fullName : $scope.fullName };
          // get user _id
          user._id = payload.data._id;
          console.log('saving ' + field)
          if (newValue == "" || !newValue) {
            console.log("error, new value is empty or not valid")
            return;
          }
          // disable all save buttons while saving
          $(".btn-succes").prop("disabled", true);
          $scope.showChangeCity = false;
          $scope.showChangeName = false;
          $scope.showChangeState = false;
          // save changes to database
          $http.post("/api/user/" + user._id, user)
          .success(function (data, status) {
            console.log('User updated.');
          })
          .error(function (data) {
            console.log('Error: ' + data);
          });
          // re-enable all save buttons
          $(".btn-succes").prop("disabled", false);
        } else {
          $location.path("/login");
          return;
        }
      },
      function(errorPayload) {
        console.log("Error: " + errorPayload)
      });
    }

  });
