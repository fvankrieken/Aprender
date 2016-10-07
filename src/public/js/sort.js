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

    $scope.sortTypeE = {'val': "order"};
    $scope.sortTypeM = {'val': "order"};
    $scope.sortTypeC = {'val': "order"};
    $scope.sortTypeH = {'val': "order"};
    $scope.sortTypeT = {'val': "order"};
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
    $scope.showOrder = window.showOrder;
    $scope.eLink = '/files/DerechosLenguajeYComprension.pdf';
    $scope.mLink = '/files/DerechosPiensamientoMatematico.pdf';
    $scope.cLink = '/files/DerechosCienciasNaturales.pdf';
    $scope.hLink = '/files/DerechosCienciasSociales.pdf';

    var catsB = [$scope.espB, $scope.matB, $scope.cieB, $scope.hisB, $scope.texB];
    var cats = [$scope.esp, $scope.mat, $scope.cie, $scope.his, $scope.tex];
    var catNames = ['Esp', 'Mat', 'Cie', 'His', 'Tex'];
    var orders = [$scope.sortTypeE, $scope.sortTypeM, $scope.sortTypeC, $scope.sortTypeH, $scope.sortTypeT];

    $scope.options = [{'name':"order"}, {'name':"desde"}, {'name':"sortTitle"}]

    $scope.labelPointer = "auto";
    var newOrder = [];
    var newBOrder = [];
    $scope.editCont = '';
    $scope.editing = {'val': false}
    $scope.display = function() {
        if ($scope.editing.val) { return 'none' } else { return 'inline-cd block' }
    }
    $scope.edit = function(cont) {
        $scope.editCont = cont;
        $scope.labelPointer = "none";
        $scope.editing.val = true;
        var O = [];
        var BO = [];
        var index = catNames.indexOf(cont);
        cats[index].forEach(function(thing, i) {
            O.push(i);
        });
        catsB[index].forEach(function(thing, i) {
            BO.push(i);
        });
        
        newOrder = O;
        newBOrder = BO;
        orders.forEach(function(order, i) {
            if (index == i) {
                order.val = "order";
            }
        });
        $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0)
    }

    $scope.submitOrder = function(cont) {
        var data = {'cont': cont, 'newOrder': newOrder.toString(), 'newBOrder': newBOrder.toString()}
        
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
        newOrder = [];
        newBOrder = [];

    }

    $scope.switch = function(first, second, b) {
        if (b) {
            catsB.forEach(function(cat, i) {
                if (i == catNames.indexOf($scope.editCont)) {
                    cat.forEach(function(tema, index) {
                        if (tema.order == first) {
                            tema.order = second;
                        } else if (tema.order == second) {
                            tema.order = first;
                        }
                    });
                }
            });
        } else {
            cats.forEach(function(cat, i) {
                if (i == catNames.indexOf($scope.editCont)) {
                    cat.forEach(function(tema, index) {
                        if (tema.order == first) {
                            tema.order = second;
                        } else if (tema.order == second) {
                            tema.order = first;
                        }
                    });
                }
            });
        }

        if (b) { toReturn = newBOrder; } else { toReturn = newORder; }
        toReturn.forEach(function(newPos, i) {
            if (newPos == first) {
                toReturn[i] = second;
            } else if (newPos == second) {
                toReturn[i] = first;
            }
        });
        if (b) { newBOrder = toReturn; } else { newORder = toReturn; }
        $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0)
    }

    // index of tema being dragged
    var sourceIndex = -1;
    // current location of tema being dragged (during drag after hovering)
    var tempIndex = -1;
    $scope.dragb = null;
    // counter for dragover shift
    var readyToShift = [];
    var dontLetShift = false;

    $scope.dragstart = function(index, badge) {
        sourceIndex = index;
        tempIndex = index;
        $scope.dragb = badge;
        // MAKE INVISIBLE
    }

    $scope.dragexit = function(targetIndex, badge) {
        if (badge == $scope.dragb) {
            readyToShift[targetIndex] = false;
            dontLetShift = false;
        }
    }

    $scope.dragover = function(targetIndex, badge) {
        if ((tempIndex == -1) || (badge != $scope.dragb) || (dontLetShift) || (targetIndex == tempIndex)) {
            return
        }
        dontLetShift = true;
        readyToShift[targetIndex] = true;
        $timeout(function(){
            if (readyToShift[targetIndex]) {
                shift(targetIndex);
                tempIndex = targetIndex;
                $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0);
                $timeout(function(){dontLetShift = false}, 1250);
            }
        }, 750);
        
        
    }

    //only if 
    $scope.drop = function(targetIndex, badge) {
        if ((sourceIndex == -1) || (badge != $scope.dragb) || (targetIndex == tempIndex)) {
            return
        }
        if (targetIndex == -1) {
            targetIndex = tempIndex;
        }
        shift(targetIndex);
        // make visible
        $timeout(function(){$scope.rearrange('.' + $scope.editCont + 'I', false)}, 0);
        readyToShift = [];

        shiftArray(targetIndex);

        sourceIndex = -1;
        tempIndex = -1;
    }

    shift = function(targetIndex) {
        
        if (targetIndex == tempIndex) {
            return
        }

        var low;
        var high;
        if (targetIndex > tempIndex) {
            low = tempIndex + 1;
            high = targetIndex;
            increment = -1;
        } else {
            low = targetIndex;
            high = tempIndex - 1;
            increment = 1;
        }
        if ($scope.dragb) {
            catsB.forEach(function(cat, i) {
                if (i == catNames.indexOf($scope.editCont)) {
                    cat.forEach(function(tema, index) {
                        var old = tema.order;
                        if (old == tempIndex) {
                            tema.order = targetIndex;
                        } else if ((old >= low) && (old <= high)) {
                            tema.order += increment;
                        }
                    });
                }
            });
        } else {
            cats.forEach(function(cat, i) {
                if (i == catNames.indexOf($scope.editCont)) {
                    cat.forEach(function(tema, index) {
                        var old = tema.order;
                        if (old == tempIndex) {
                            tema.order = targetIndex;
                        } else if ((old >= low) && (old <= high)) {
                            tema.order += increment;
                        }
                    });
                }
            });
        }
    }

    shiftArray = function(targetIndex) {
        if (targetIndex == sourceIndex) {
            return
        }
        var low;
        var high;
        if (targetIndex > sourceIndex) {
            low = sourceIndex + 1;
            high = targetIndex;
            increment = -1;
        } else {
            low = targetIndex;
            high = sourceIndex - 1;
            increment = 1;
        }

        if ($scope.dragb) {
            newBOrder.forEach(function(loc, i) {
                if ((loc >= low) && (loc <= high)) {
                    newBOrder[i] += increment
                } else if (loc == sourceIndex) {
                    newBOrder[i] = targetIndex
                }
            });
            console.log(newBOrder)
        } else {
            newOrder.forEach(function(loc, i) {
                if ((loc >= low) && (loc <= high)) {
                    newOrder[i] += increment
                } else if (loc == sourceIndex) {
                    newOrder[i] = targetIndex
                }
            });
            console.log(newOrder)
        }
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
            index: '=',
            dragstart: '=',
            dragover: '=',
            dragexit: '=',
            drop: '=',
            dragb: '=',
            showorder: '='
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
            index: '=',
            dragstart: '=',
            dragover: '=',
            dragexit: '=',
            drop: '=',
            dragb: '=',
            showorder: '=',
            pdf: '='
    	}, 
    	templateUrl: 'js/directives/bGrid.html'
	};
})

.directive('dragdrop', function() {
    return {
        scope: {
            dragstart: '=',
            dragover: '=',
            dragexit: '=',
            drop: '=',
            index: '=',
            badge: '=',
            dragb: '='
        },
        link: function(scope, element, attrs) {
            var el = element[0];

            el.draggable = true

            el.addEventListener(
                'dragstart',
                function(e) {
                    e.dataTransfer.effectAllowed = 'move';
                    this.classList.add('drag');
                    scope.$apply('dragstart(index, badge)');
                    EventUtil.getCurrentTarget(e).style.cursor = 'move';
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragenter',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragover',
                function(e) {
                    if (scope.dragb == scope.badge) {
                        this.classList.add('over');
                    }
                    if (e.preventDefault) e.preventDefault();
                    scope.$apply('dragover(index, badge)');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    this.classList.remove('over');
                    scope.$apply('dragexit(index, badge)');
                    return false;
                },

                false
            );

            el.addEventListener(
                'dragend',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    this.classList.remove('drag');
                    scope.$apply('drop(-1, badge)');
                    $(document.body).css('cursor', 'initial');
                    return false;
                },
                false
            );

            el.addEventListener(
                'drop',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    this.classList.remove('over');
                    scope.$apply('drop(index, badge)');
                    return false;
                },
                false
            );
        }
    }
});









