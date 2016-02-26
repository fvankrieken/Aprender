app.directive('slickTab', function() { 
  return { 
    restrict: 'E', 
    scope: { 
      info: '=' 
    }, 
    templateUrl: 'app/slick/slick.html' 
  }; 
});