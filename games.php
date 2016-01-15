<?php

	class Doodler
	{
		public $games = array();
		public $tiddlers = array();

		function __construct()
		{
			$games = scandir('Games');
			foreach ($games as $game) {
				if($game != '.' && $game != '..')
					$this->games[] = array("id" => count($this->games), "name" => $game);
			}
		}

		public function openGame($idx){
			$file = $this->games[$idx]['name'];
			$doc = new DOMDocument();
			$doc->preserveWhiteSpace = true;
			$doc->formatOutput = true;
			// modify state
			$libxml_previous_state = libxml_use_internal_errors(true);
			// parse
			$doc->loadHTMLFile("Games/".$file);
			// Usuwanie scriptow - bład z tagamiw scripcie
			$domNodeList = $doc->getElementsByTagname('script');
			$domElemsToRemove = array();
			foreach ( $domNodeList as $domElement ) {
				$domElemsToRemove[] = $domElement;
			}
			foreach( $domElemsToRemove as $domElement ){
				$domElement->parentNode->removeChild($domElement);
			}

			$xpath = new DomXpath($doc);
			// traverse all results
			foreach ($xpath->query('//div[@tiddler]') as $tid) {
				if($tid->getAttribute('tiddler') != 'checkvars')
					$this->tiddlers[$tid->getAttribute('tiddler')] = $tid->nodeValue;

			}

			// handle errors
			libxml_clear_errors();
			// restore
			libxml_use_internal_errors($libxml_previous_state);
		}
	}


	$d = new Doodler();

	//sleep(2);

	if(isset($_GET['get'])) {
		if($_GET['get'] == 'games') {
			echo json_encode($d->games);
		}
		if($_GET['get'] == 'game'){
			$POST = json_decode(file_get_contents('php://input'));
			if(!isset($POST->game)) {
				echo json_encode(array('errors' => 'No game chosen.'));
				return;
			}

			$d->openGame($POST->game);
			echo json_encode($d->tiddlers);
		}
	}


?>

