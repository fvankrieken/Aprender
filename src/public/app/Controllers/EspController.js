app.controller('EspController', ['$scope', function($scope) {
//	$scope.remove = function(item) { 
// 	 var index = $scope.ofertas.indexOf(item);
// 	 $scope.ofertas.splice(index, 1);     
//	}
	$scope.ofertas = [
	
];
$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;
$scope.blueheight=$scope.gridlength*224+197;
if ($scope.gridlength<0) {$scope.blueheight=40};
}]);