app.controller('EspController', ['$scope', function($scope) {
//	$scope.remove = function(item) { 
// 	 var index = $scope.ofertas.indexOf(item);
// 	 $scope.ofertas.splice(index, 1);     
//	}
	$scope.ofertas = [

{ title: "Teorema de Pitagoras", descript: "But let's dispel with this fiction that Barack Obama doesn't know what he's doing: he knows exactly what he's doing. He is trying to make this country more like european...", filename: "CV.pdf"},
{ title: "Teorema de Pitagoras", descript: "But let's dispel with this fiction that Barack Obama doesn't know what he's doing: he knows exactly what he's doing. He is trying to make this country more like european...", filename: "CV.pdf"},
{ title: "Teorema de Pitagoras", descript: "But let's dispel with this fiction that Barack Obama doesn't know what he's doing: he knows exactly what he's doing. He is trying to make this country more like european...", filename: "CV.pdf"},
{ title: "Teorema de Pitagoras", descript: "But let's dispel with this fiction that Barack Obama doesn't know what he's doing: he knows exactly what he's doing. He is trying to make this country more like european...", filename: "CV.pdf"},
];
$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;
$scope.blueheight=$scope.gridlength*224+197;
if ($scope.gridlength<0) {$scope.blueheight=40};
}]);