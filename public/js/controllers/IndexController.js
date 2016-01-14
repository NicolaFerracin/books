app.controller('IndexController', function($scope,  $http, $location, loggedIn) {

  // check if user logged in and set userLoggedIn boolean
  loggedIn.getUser().then(
    function(payload) {
      if (payload.data) {
        $scope.userLoggedIn = true;
      } else {
        console.log("The user is logged out")
      }
    },
    function(errorPayload) {
      console.log("Error: " + errorPayload)
    });

    $scope.logout = function() {
      // user is logging out
      $http.get("/logout")
      .success(function() {
        $scope.userLoggedIn = false;
        var privateLocations = ["/settings", "/myBooks", "/myTrades"];
        if (privateLocations.indexOf(window.location.pathname) > -1) {
          $location.path("/login");
        }
      })
      .error(function(err) {
        console.log("An error occured: " + err);
      })
    }
  });
