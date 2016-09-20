angular.module('arch', [])

.controller('MainCtlr', ['$scope', function($scope) {
	$scope.archivos = window.archivos;
	$scope.sortType = 'temaNombre';
	$scope.sortHeaders = [
		{'name': 'temaNombre', 'display': 'Título'},
		{'name': 'tema', 'display': 'Documento'},
		{'name': 'tutor', 'display': 'Ejemplo de registro del tutor'}
	]
	$scope.sortReverse = false;
	$scope.tSort = function(index) {
		var sortType = $scope.sortHeaders[index].name
		if ($scope.sortType == sortType) {
			$scope.sortReverse = !$scope.sortReverse;
		} else {
			$scope.sortType = sortType;
			$scope.sortReverse = (sortType == 'date');
		}
	}
}])