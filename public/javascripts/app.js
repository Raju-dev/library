var myApp = angular.module("myApp", ['ui.router', 'services.userservice', 'features.user', 'features.book', 'ui.bootstrap']);

myApp.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider){
    $httpProvider.interceptors.push(['$rootScope', '$q', '$location', 'UserService', function($rootScope, $q, $location, UserService) {
      return {
        'responseError': function(errorResponse) {
            if(errorResponse.status == 403)
            {
                UserService.destroyUser();
                $rootScope.loggedIn = false;
                $location.path('/');
            }
            return $q.reject(errorResponse);
        }
      };
    }]);
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('home',{
    url : '/',
    views : {
      header : {
        templateUrl : 'views/sections/header.html'
      },
      content : {
        templateUrl : 'views/user/login.html'
      },
      footer : {
        templateUrl : 'views/sections/footer.html'
      }
    },
    controller: 'ApplicationController'
  })
}])
.constant('publicUrls', [
  '/'
])
.factory('isOnPublicUrl', ['publicUrls', function(publicUrls) {
    return function(path) {
      return publicUrls.indexOf(path) == -1 ? true : false;
    };
}])
.run([
  '$rootScope',
  'isOnPublicUrl',
  '$location',
  'UserService',
  '$state',
  '$timeout',
  function($rootScope, isOnPublicUrl, $location, UserService, $state, $timeout){
      $rootScope.$on('$stateChangeStart', function(event) {
        var isPublicLink = isOnPublicUrl($location.path());
        var user = UserService.getUser();
        var forbidden = !user && isPublicLink;
        if(forbidden){
          event.preventDefault();
          $location.path('/');
        }
    });
}])
.controller('ApplicationController',[
  '$rootScope',
  '$scope',
  'UserService',
  '$http',
  'UserService',
  '$state',
  function($rootScope, $scope, UserService, $http, UserService, $state){
    if(UserService.getUser()){
      $rootScope.isLoggedin = true;
    };

    $scope.apiUrl = "http://localhost:3000/api/auth";
    $scope.login = function(){
      console.log($scope.email);
      if(!$scope.loginForm.$valid){
        return;
      }
      console.log($scope.email);
      var data = {
        email : $scope.email,
        password : $scope.password
      };

      $http.post($scope.apiUrl, data)
      .then(function(result){
          $rootScope.isLoggedin = true;
          UserService.setUser(result.data);
          $state.go("user.manage");
      })
      .catch(function(error){
        $scope.errorMessage = error.data.message;
      });
    }
}]);
