<!DOCTYPE html>
<html ng-app="TwineDoodlerApp">
<head>
	<title>Twine Doodler 2</title>

	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

	<style>
		[ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
			display: none !important;
		}
		select {
			padding: 1px;
		}
		#GameSelector {
			display: inline-block;
			position: fixed;
			top: 10px;
			left: 2px;
			transition: left 0.6s ease-out;
		}
		#GameSelector.hidden {
			left: -200px;
		}
	</style>
</head>
<body ng-controller="mainCtrl" ng-cloak>
	<div id="GameSelector" ng-controller="selectorCtrl" ng-class="{hidden: hidden}">
		<div style="display: inline-block;">
			<select ng-model="game" ng-options="g.id as g.name for g in games" style="width:134px">
				<option label=" -- Choose one -- "></option>
			</select>
			<button ng-click="getGame()" ng-disabled="loading || !games"><i class="fa" ng-class="{'fa-spinner fa-spin': loading && games, 'fa-folder-open': !loading || !games}"></i></button>
			<button ng-click="getGamesList()" ng-disabled="loading"><i class="fa" ng-class="{'fa-spinner fa-spin': loading && !games, 'fa-refresh': !loading || games}"></i></button>
		</div>

		<button ng-click="hidden = !hidden"><i class="fa" ng-class="{'fa-caret-left': !hidden, 'fa-caret-right': hidden}"></i></button>
	</div>

	<select ng-model="tiddler" ng-options="key for (key , value) in tiddlers" style="width:134px">
		<option label=" -- Choose one -- "></option>
	</select>
	<button ng-click="readTiddler()">Read</button>

	<div id="troll"></div>



	<script type="text/javascript" src="bower_components/angular/angular.min.js"></script>
	<script type="text/javascript" src="td.js"></script>
</body>
</html>