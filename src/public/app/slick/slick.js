app.directive('slickInfo', function() { 
  return { 
    restrict: 'E', 
    scope: { 
      info: '=' 
    }, 
    templateUrl: 'app/slick/slick.html' 
  }; 
});