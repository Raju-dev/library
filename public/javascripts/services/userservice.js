angular.module("services.userservice",['ngStorage'])
.service("UserService", ['$localStorage', function($localStorage){
  this.setUser = function(user){
    $localStorage.user = user;
  },
  this.getUser = function(){
    return angular.copy($localStorage.user);
  },
  this.destroyUser = function(){
    $localStorage.user = null;
  }
}]);
