app.directive('inactive', function() { 
  return { 
    restrict: 'E', 
    scope: { 
      info: '=' 
    }, 
    templateUrl: 'app/navbar/navbar.html' 
  }; 
});