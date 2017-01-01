angular.module('features.user',['ui.router','services.userservice'])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('user',{
    abstract : true,
    url : '/user',
    views : {
      header : {
        templateUrl : 'views/sections/header.html'
      },
      content : {
        templateUrl : 'views/user/usercontent.html'
      }
    },
    controller : 'features.controllers.UserController'
  })
  .state('user.adduser',{
    url : '/adduser',
    templateUrl : 'views/user/adduser.html',
    controller : 'features.controllers.UserController'
  })
  .state('user.manage',{
    url : '/manage',
    templateUrl : 'views/user/manage.html',
    controller : 'features.controllers.UserManageController'
  })
  .state('user.logout',{
    url : '/logout',
    controller : 'features.controllers.UserLogoutController'
  })
}])
.controller("features.controllers.UserLogoutController", [
  '$rootScope',
  '$scope',
  'UserService',
  '$http',
  '$timeout',
  '$location', function($rootScope, $scope, UserService, $http, $timeout, $location){
    $scope.apiUrl = "http://localhost:3000/api/";
    $http.post($scope.apiUrl+'logout')
    .then(function(result){
      $rootScope.isLoggedin = false;
      UserService.destroyUser();
      $location.path('/');
    })
    .catch(function(error){
      if(error.data && error.data.message){
        alert(error.data.message);
      } else {
        alert("Something went wrong try again later!");
      }
    });
}])
.controller("features.controllers.UserController",['$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance){
  //Set deafault role
  $scope.role = String(1);

  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.save = function(){
    if($scope.userForm.$valid){
      var params = {
        username : $scope.username,
        email : $scope.email,
        name : $scope.name,
        password : $scope.password,
        contact : $scope.contact,
        role : $scope.role
      };

      $http.post($scope.apiUrl+'users', params)
      .then(function(result){
        $scope.success = true;
        alert("User added successfully!");
        $uibModalInstance.close(result.data);
      })
      .catch(function(error){
        if(error.data && error.data.message){
          alert(error.data.message);
        } else {
          alert("Something went wrong try again later!");
        }
      });
    }
  }
}])
.controller("features.controllers.UserManageController",['$scope', '$http', '$uibModal', function($scope, $http, $uibModal){
  $scope.users = [];
  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.loadUsers = function(){
    $http.get($scope.apiUrl+'users')
    .then(function(result){
      $scope.users = result.data;
    })
    .catch(function(error){
      if(error.data && error.data.message){
        alert(error.data.message);
      } else {
        alert("Something went wrong try again later!");
      }
    });
  };

  $scope.deleteUser = function(user){
    var confirm = window.confirm("Are you sure you want to delete this user.");
    if(!confirm){
      return;
    }
    $http.delete($scope.apiUrl+"user/"+user._id)
    .then(function(result){
      $scope.loadUsers();
    })
    .catch(function(error){
      if(error.data && error.data.message){
        alert(error.data.message);
      } else {
        alert("Something went wrong try again later!");
      }
    })
  };

  $scope.addUser = function(){
    var modal = $uibModal.open({
      templateUrl: 'views/user/adduser.html',
      controller: 'features.controllers.UserController',
      size: 'md'
    });
    modal.result.then(function(result){
      $scope.users.push(result);
    });
  };

  $scope.editUser = function(user){
    var modal = $uibModal.open({
      templateUrl: 'views/user/edituser.html',
      controller: 'features.controllers.EditUserController',
      size: 'md',
      resolve : {
        user : function(){
          return user;
        }
      }
    });
    modal.result.then(function(result){
      alert("User details updated successfully!")
      $scope.users.forEach(function(user){
        if(user._id==result._id){
          user.username = result.username,
          user.name = result.name,
          user.contact = result.contact,
          user.role = result.role
        }
      });
    });
  };

  $scope.loadUsers();
}])
.controller("features.controllers.EditUserController",['$scope',
'$http',
'$uibModalInstance',
'user',
function($scope, $http, $uibModalInstance, user){
  //Set deafault status
  $scope.user = angular.copy(user);
  $scope.user.role = String($scope.user.role);
  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.save = function(){
    if($scope.editUserForm.$valid){
      var params = {
        _id : $scope.user._id,
        username : $scope.user.username,
        name : $scope.user.name,
        contact : $scope.user.contact,
        role : $scope.user.role
      };

      $http.post($scope.apiUrl+'users', params)
      .then(function(result){
        $scope.success = true;
        $uibModalInstance.close(params);
      })
      .catch(function(error){
        if(error.data && error.data.message){
          alert(error.data.message);
        } else {
          alert("Something went wrong try again later!");
        }
      });
    }
  }
}]);
