angular.module('sort', [])

.controller('MainController', function($scope) {
    $scope.sortTypeE = "order";
    $scope.sortTypeM = "order";
    $scope.sortTypeC = "order";
    $scope.sortTypeH = "order";
    $scope.sortTypeT = "order";
    $scope.labelPointer = "auto"
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

    $scope.newOrder = [];
    $scope.newBOrder = [];
    $scope.editCont = '';
    $scope.edit = function(cont) {
        $scope.editCont = cont;
        $scope.labelPointer = "none";
    }
    $scope.switch = function(first, second, b) {
        if ($scope.editCont == "esp") {
            if (b) {
                $scope.espB.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            } else {
                $scope.esp.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            }
        } else if ($scope.editCont == "mat") {
            if (b) {
                $scope.matB.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            } else {
                $scope.mat.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            }
        } else if ($scope.editCont == "cie") {
            if (b) {
                $scope.cieB.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            } else {
                $scope.cie.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            }
        } else if ($scope.editCont == "his") {
            if (b) {
                $scope.hisB.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            } else {
                $scope.his.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            }
        } else if ($scope.editCont == "tex") {
            if (b) {
                $scope.texB.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            } else {
                $scope.tex.forEach(function(tema, index) {
                    if (tema[order] == first) {
                        tema[order] = second;
                    } else if (tema[order] == second) {
                        tema[order] = first;
                    }
                });
            }
        }

        if (b) { toReturn = newBOrder; } else { toReturn = newORder; }
        if (toReturn[first] == -1) { new2 = first; } else { new2 = toReturn[first]; }
        if (toReturn[second] == -1) { toReturn[first] = second; } else { toReturn[first] = toReturn[second]; }
        toReturn[second] = new2;
        if (b) { newBOrder = toReturn; } else { newORder = toReturn; }
    }
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