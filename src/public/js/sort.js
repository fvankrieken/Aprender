angular.module('sort', [])

.controller('MainController', function($scope) {
    $scope.sortTypeM = "order";
    $scope.sortTypeC = "order";
    $scope.sortTypeH = "order";
    $scope.sortTypeT = "order";
    $scope.espB = window.espB;
    $scope.esp = window.esp;
    $scope.matB = window.matB;
    $scope.mat = window.mat;
    $scope.cieB = window.cieB;
    $scope.cie = window.cie;
    $scope.hisB = window.hisB;
    $scope.his = window.his;
    $scope.texB = window.texB;
    $scope.tex = window.tex;
    $scope.options = [{'name':"order"}, {'name':"desde"}, {'name':"title"}]
})

.directive('grid', function() { 
 	return { 
    	restrict: 'E', 
    	scope: { 
    		info: '=' 
    	}, 
    	templateUrl: 'js/directives/grid.html' 
	}; 
})

.directive('bGrid', function() {
	return { 
    	restrict: 'E', 
    	scope: { 
      		info: '=' 
    	}, 
    	templateUrl: 'js/directives/bGrid.html'
	};
});