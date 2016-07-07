angular.module('sort', [])

.controller('MainController', ['$scope', '$http', function($scope, $http) {
    $scope.sortTypeE = "order";
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

    $scope.labelPointer = "auto";
    $scope.newOrder = [];
    $scope.newBOrder = [];
    $scope.editCont = '';
    $scope.editing = {'val': false}
    $scope.edit = function(cont) {
        $scope.sortTypeE = "order";
        $scope.sortTypeM = "order";
        $scope.sortTypeC = "order";
        $scope.sortTypeH = "order";
        $scope.sortTypeT = "order";
        $scope.editCont = cont;
        $scope.labelPointer = "none";
        $scope.editing.val = true;
        var O = [];
        var BO = [];
        var contStrings = ['Esp', 'Mat', 'Cie', 'His', 'Tex'];
        var conts = [$scope.esp, $scope.mat, $scope.cie, $scope.his, $scope.tex];
        var bConts = [$scope.espB, $scope.matB, $scope.cieB, $scope.hisB, $scope.texB];
        var index = contStrings.indexOf(cont);
        conts[index].forEach(function(thing, index) {
            O.push(-1);
        });
        bConts[index].forEach(function(thing, index) {
            BO.push(-1);
        });
        $scope.newOrder = O;
        $scope.newBOrder = BO;
    }

    $scope.submitOrder = function(cont) {
        var data = {'cont': cont, 'newOrder': $scope.newOrder.toString(), 'newBOrder': $scope.newBOrder.toString()}
        console.log(data)
        $http({
            url: '/CatalogoDeOfertas',
            method: 'POST',
            data: data,
            headers: {
                     'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            //do nothing for success
        }, function errorCallback(response) {
            window.alert('Lo siento, el orden no se pudo guardar')
        })
        $scope.editCont = '';
        $scope.labelPointer = "auto";
        $scope.editing.val = false;
        $scope.newOrder = [];
        $scope.newBOrder = [];

    }

    $scope.switch = function(first, second, b) {
        if ($scope.editCont == "Esp") {
            if (b) {
                $scope.espB.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            } else {
                $scope.esp.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            }
        } else if ($scope.editCont == "Mat") {
            if (b) {
                $scope.matB.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            } else {
                $scope.mat.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            }
        } else if ($scope.editCont == "Cie") {
            if (b) {
                $scope.cieB.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            } else {
                $scope.cie.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            }
        } else if ($scope.editCont == "His") {
            if (b) {
                $scope.hisB.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            } else {
                $scope.his.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            }
        } else if ($scope.editCont == "Tex") {
            if (b) {
                $scope.texB.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            } else {
                $scope.tex.forEach(function(tema, index) {
                    if (tema['order'] == first) {
                        tema['order'] = second;
                    } else if (tema['order'] == second) {
                        tema['order'] = first;
                    }
                });
            }
        }

        if (b) { toReturn = $scope.newBOrder; } else { toReturn = $scope.newORder; }
        if (toReturn[first] == -1) { new2 = first; } else { new2 = toReturn[first]; }
        if (toReturn[second] == -1) { toReturn[first] = second; } else { toReturn[first] = toReturn[second]; }
        toReturn[second] = new2;
        if (b) { $scope.newBOrder = toReturn; } else { $scope.newORder = toReturn; }
    }
}])

.directive('grid', function() { 
 	return { 
    	restrict: 'E', 
    	scope: { 
    		info: '=',
            edit: '=',
            switch: '=',
            l: '=',
            first: '=',
            last: '=',
            index: '='
    	}, 
    	templateUrl: 'js/directives/grid.html' 
	}; 
})

.directive('bGrid', function() {
	return { 
    	restrict: 'E', 
    	scope: { 
      		info: '=',
            edit: '=',
            switch: '=',
            l: '=',
            first: '=',
            last: '=',
            index: '='
    	}, 
    	templateUrl: 'js/directives/bGrid.html'
	};
});