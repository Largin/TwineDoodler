<!DOCTYPE html>
<html ng-app="TwineDoodlerApp">
<head>
	<title>Twine Doodler 2</title>

	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

	<style>
		html, body {
			margin: 0;
			padding: 0;
		}
		[ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
			display: none !important;
		}
		select {
			padding: 1px;
		}
		.leftTab {
			transition: left 0.6s ease-out;

			border: 1px solid black;
			background-color: white;
			padding: 10px 0;
			padding-right: 5px;
			border-radius: 0 10px 10px 0;
			left: -1px;
			display: inline-block;
			position: fixed;
		}
		.leftTab.hidden {
			left: -200px;
		}
		#TiddlerSelector {
			top: 50px;
		}
	</style>
</head>
<body ng-controller="mainCtrl" ng-cloak>
	<div class="leftTab" id="GameSelector" ng-controller="selectorCtrl" ng-class="{hidden: hidden}">
		<div style="display: inline-block;">
			<select ng-model="game" ng-options="g.id as g.name for g in games" style="width:134px">
				<option label=" -- Choose one -- "></option>
			</select>
			<button ng-click="getGame()" ng-disabled="loading || !games"><i class="fa" ng-class="{'fa-spinner fa-spin': loading && games, 'fa-folder-open': !loading || !games}"></i></button>
			<button ng-click="getGamesList()" ng-disabled="loading"><i class="fa" ng-class="{'fa-spinner fa-spin': loading && !games, 'fa-refresh': !loading || games}"></i></button>
		</div>

		<button ng-click="hidden = !hidden"><i class="fa" ng-class="{'fa-caret-left': !hidden, 'fa-caret-right': hidden}"></i></button>
	</div>

	<div class="leftTab" id="TiddlerSelector" ng-class="{hidden: hidden || !tiddlers}">
		<select ng-model="tiddler" ng-options="key for (key , value) in tiddlers" style="width:145px">
			<option label=" -- Choose one -- "></option>
		</select>
		<button ng-click="readTiddler()">Read</button>

		<button ng-click="hidden = !hidden" ng-disabled="!tiddlers"><i class="fa" ng-class="{'fa-caret-left': !hidden, 'fa-caret-right': hidden}"></i></button>
	</div>



	<div id="troll"></div>



	<script type="text/javascript" src="bower_components/angular/angular.min.js"></script>
	<script type="text/javascript" src="td.js"></script>
</body>
</html>