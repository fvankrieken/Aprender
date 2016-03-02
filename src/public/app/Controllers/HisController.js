app.controller("HisController", ["$scope", function($scope) {

	$scope.ofertas = [
	
];
$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;
$scope.blueheight=$scope.gridlength*224+197;
if ($scope.gridlength<0) {$scope.blueheight=40};
}]);