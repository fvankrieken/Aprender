angular.module('sort', [])

.controller('MainController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    
    $scope.rearrange = function(cl, quick){
        $(cl).each(function(idx, el){
            var $el = $(el);                
            var newTop = Math.floor(idx / 3) * 239 + 40;
            var newLeft = (idx % 3) * 274 + 20

            if(!quick) {
                if ((newTop != parseInt($el.css('top'))) || (newLeft != parseInt($el.css('left')))) {
                    $el.css({
                        'top': newTop,
                        'left': newLeft,
                        '-webkit-transition': '.5s ease-in-out all',
                        'transition': '.5s ease-in-out all'
                    });
                }
            } else {
                $el.css({
                    'top': newTop,
                    'left': newLeft,
                    '-webkit-transition': '0s',
                    'transition': '0s'
                });
            }   
            
        });
    }

    $scope._rearrange = function(cont, bool) {
        $timeout(function() {
            $scope.rearrange(cont, bool)
        }, 0)
    }

    $scope.init = function() {
        $timeout(function(){
            $scope.rearrange('.EspI', true);
            $scope.rearrange('.MatI', true);
            $scope.rearrange('.CieI', true);
            $scope.rearrange('.HisI', true);
            $scope.rearrange('.TexI', true);
        }, 0);
        
    };

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
    $scope.display = function() {
        if ($scope.editing.val) {
            return 'none'
        } else {
            return 'block'
        }
    }
    $scope.edit = function(cont) {
        $scope.editCont = cont;
        $scope.labelPointer = "none";
        $scope.editing.val = true;
        var O = [];
        var BO = [];
        var contStrings = ['Esp', 'Mat', 'Cie', 'His', 'Tex'];
        var conts = [$scope.esp, $scope.mat, $scope.cie, $scope.his, $scope.tex];
        var bConts = [$scope.espB, $scope.matB, $scope.cieB, $scope.hisB, $scope.texB];
        var index = contStrings.indexOf(cont);
        conts[index].forEach(function(thing, i) {
            O.push(-1);
        });
        bConts[index].forEach(function(thing, i) {
            BO.push(-1);
        });
        
        $scope.newOrder = O;
        $scope.newBOrder = BO;

        var orders = [$scope.sortTypeE, $scope.sortTypeM, $scope.sortTypeC, $scope.sortTypeH, $scope.sortTypeT]
        orders.forEach(function(order, i) {
            if (index == i) {
                order = "order";
            }
        });
        $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0)
    }

    $scope.submitOrder = function(cont) {
        var data = {'cont': cont, 'newOrder': $scope.newOrder.toString(), 'newBOrder': $scope.newBOrder.toString()}
        
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
        console.log($scope.editCont)
        $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0)
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