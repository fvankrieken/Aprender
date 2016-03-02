app.controller("EspController", ["$scope", function($scope) {

	$scope.ofertas = [
	
{ filename: "[Free-scores.com]_bach-johann-sebastian-six-partitas-clavierubung-part-6-giga-215.pdf", title: "Teorema de Pitágoras", descript: "oiwejfoaiwef waoeifjwao w iowjoiw oiw wijfoa oiv  eiufawe oiawf awefi o owi fowe foia foa fjwa fi wifo awof jaof aoi foaiw foia foiw oaw faowe fawoi faw foiaw faoif woif woif woi fawoif aowif awiof aowifwoif awf awoioaw foiaw faw f owej oawe foawe oi  faoiwf awof waoif awof a fiowej fo", comps: ["This tim e I want a lot", "okay I want mroe", "and a third"], temas: ["Let's have like 5 of", "these okay", "that sseems like a lot", "but it's not that much", "keep going"], pathName: "TeoremaDePitagoras", email: "finnvankrieken@gmail.com"},
];
$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;
$scope.blueheight=$scope.gridlength*224+197;
if ($scope.gridlength<0) {$scope.blueheight=40};
}]);