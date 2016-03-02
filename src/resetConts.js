fs = require('fs');

conts = ['Esp', 'Mat', 'Cie', 'His']

for (var i = 0; i < conts.length; i++) {
	var controller = conts[i] + 'Controller';
	var toWrite = 'app.controller("' + controller + '", ["$scope", function($scope) {\n\n	$scope.ofertas = [\n	\n];\n$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;\n$scope.blueheight=$scope.gridlength*224+197;\nif ($scope.gridlength<0) {$scope.blueheight=40};\n}]);';
	fs.writeFile(__dirname + '/public/app/Controllers/' + controller +'.js', toWrite)
}

fs.writeFile(__dirname + '/pdfData.js', 'var pdfData = {\n	\n};\nmodule.exports = pdfData;')
