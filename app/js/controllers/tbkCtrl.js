'use strict';

/**
 * Main controller for eTuneBook. 
 */
eTuneBook.controller( 'tbkCtrl', function tuneBookCtrl( $scope, $location, $timeout, $rootScope, tbkStorage ) {
	// Test for first-time navigation to the welcome-page
	//localStorage.clear();
	
	// Test whether changes in eTuneBook.appcache are detected by the browser 
	// Todo: Chrome reagiert hier mit Confirm-Panel, Firefox macht zwar den zweiten Reload, aber ohne das Confirm-Panel anzuzeigen!
	askForRefreshFromServer();
		
	// Get tuneBook from localStorage 
	var tuneBook =  eTBk.TuneBook.getTuneBookFromStore();
  
	if (tuneBook.hasOwnProperty("tuneSets")){
		// Show TuneBook from LocalStorage
		$scope.tuneBook = tuneBook;
		show("loading");
		
		$timeout(function(){
			initView("tuneSets", "loadPage");
			$scope.$apply();
		},1000);
  
	} else {
		// Init TuneBook
		$scope.tuneBook = tuneBook =  eTBk.TuneBook.initializeTuneBook();
		
		// First time here -> show Welcome-Page
		initView("introduction", "loadPage");
	}
	
	$scope.setCurrentPage = function(page) {
		$scope.currentPage = page.number -1;	
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};

	
	function askForRefreshFromServer() {
		if (window.applicationCache) {
			applicationCache.addEventListener('updateready', function() {
				if (confirm('An eTuneBook update is available. Reload now?')) {
					window.location.reload();
				}
			});
		}
	}
	
	function setPages(currentPage) {
		$timeout(function(){
			var tuneSetCount = 0;
		
			if ($scope.tuneSetsFiltered) {
				tuneSetCount = $scope.tuneSetsFiltered.length;
			} else if ($scope.tuneBook.tuneSets) {
				tuneSetCount = $scope.tuneBook.tuneSets.length;	
			}
			
			var numberOfPages = Math.ceil(tuneSetCount/$scope.pageSize);
			var pages = new Array();
			var page = new Array();
			
			for (var i = 0; i < numberOfPages; i++) {
				page = new Array();
				page.number = i+1;
				pages.push(page);
			}
			
			$scope.pages = pages	
			
			//Auf Seite 1 positionieren 
			$scope.currentPage = currentPage;
		
			$scope.$apply();
		},0);
	}
	
	function initView(view, process){
		initTuneSetViewDetailPanels();
			
		if (process == "loadPage") {
			// Process = Load TuneBook from local storage
		
			// Set current example
			$scope.exampleFileNameWithoutAbc = eTBk.EXAMPLE_FILENAME_WITHOUTABC;
			$scope.exampleVersion = eTBk.EXAMPLE_VERSION;
			
			// Init TuneSet-Detail-Lines  
			$scope.showTuneSecondLine = true;
			$scope.showTuneThirdLine = true;
			$scope.showTuneForthLine = true;
			
			// Init TuneSet Sorter
			$scope.tuneSetSortField = "tuneSetId";
			$scope.tuneSetSortReverse = false;
			
			// Init TuneSet Filters
			initTuneSetFilters();
			
			// Init Abc-Export-Settings
			$scope.tuneSetAbcIncl = true;
			$scope.playDateAbcIncl = true;
			$scope.skillAbcIncl = true;
			$scope.colorAbcIncl = true;
			$scope.annotationAbcIncl = true;
			$scope.siteAbcIncl = true;
			$scope.tubeAbcIncl = true;
			$scope.fingeringAbcIncl = true;
			
			// Init available colors
			$.fn.colorPicker.defaults.colors = ['F5F5F5', 'CCFFCC', 'EFEBD6', 'FFFF99', 'C7DAD4', 'BFE4FF', 'D8CFE6', 'FFE6E6', 'EEE6FF', 'E6FFE6', 'FFCCBF', 'FFFFFF', 'CCCCFF', 'FFFFCC', 'FF9980'];
		
			// Init Pagination
			$scope.currentPage = 0;
			$scope.pageSize = 5;
			$scope.showPageButtons = true;
					
			// Override Default by Settings from localStorage			
		
			// Get Settings from localStorage  
			var settings =  eTBk.TuneBook.getSettingsFromStore();
		
			// Apply Settings
			
			// Ab 06.05.13: Wegfall der M�glichkeit, Buttons ein- und auszublenden (showTuneSecond,Third,Forth Line immer true)
			/*	
			if (settings.hasOwnProperty("showTuneSecondLine")){
				$scope.showTuneSecondLine = settings.showTuneSecondLine;
			} 
			
			if (settings.hasOwnProperty("showTuneThirdLine")){
				$scope.showTuneThirdLine = settings.showTuneThirdLine;
			} 
			
			if (settings.hasOwnProperty("showTuneForthLine")){
				$scope.showTuneForthLine = settings.showTuneForthLine;
			}
			*/

			if (settings.hasOwnProperty("sessionModus")){
				$scope.sessionModus = settings.sessionModus;
			}			
			
			if (settings.hasOwnProperty("tuneSetSortField")){
				$scope.tuneSetSortField = settings.tuneSetSortField;
			} 
			
			if (settings.hasOwnProperty("tuneSetSortReverse")){
				$scope.tuneSetSortReverse = settings.tuneSetSortReverse;
			} 
			
			if (settings.hasOwnProperty("tuneSetIdToFilter")){
				$scope.tuneSetIdToFilter = settings.tuneSetIdToFilter;
			}

			if (settings.hasOwnProperty("tuneSetPositionToFilter")){
				$scope.tuneSetPositionToFilter = settings.tuneSetPositionToFilter;
			}	
			
			if (settings.hasOwnProperty("tuneSetTypeFilter")){
				$scope.tuneSetTypeFilter = settings.tuneSetTypeFilter;
			} 
			
			if (settings.hasOwnProperty("tuneSetKeyToFilter")){
				$scope.tuneSetKeyToFilter = settings.tuneSetKeyToFilter;
			} 
			
			if (settings.hasOwnProperty("tuneSetColorToFilter")){
				$scope.tuneSetColorToFilter = settings.tuneSetColorToFilter;
			} 
			
			if (settings.hasOwnProperty("tuneSetSkillToFilter")){
				$scope.tuneSetSkillToFilter = settings.tuneSetSkillToFilter;
			} 
			
			if (settings.hasOwnProperty("currentPage")){
				$scope.currentPage = settings.currentPage;
			} 
			
		} else  {
			// Process = Import TuneBook from Abc-File (Server or Local)
			initTuneSetFilters();
			// Set page 1 as current page
			$scope.currentPage = 0;
			// Put Settings to localStorage
			eTBk.TuneBook.storeSettings(getSettings());
		} 
				
		setSelectors();
		setPages($scope.currentPage);
		show(view);
	}
	
	// ----  Beginn Synchronisation URL mit Anzeige  --- //
	// URL --> Anzeige //
	var pageKey = "page";
	var tuneSetSortFieldKey = "sortfield";
	var tuneSetSortReverseKey = "sortdesc";
	var tuneSetIdToFilterKey = "set";
	var tuneSetPositionToFilterKey = "pos";
	var tuneSetTypeFilterKey = "type";
	var tuneSetKeyToFilterKey = "key";
	var tuneSetColorToFilterKey = "color";
	var tuneSetSkillToFilterKey = "skill";
    
	$scope.$watch(function () { return $location.search(); }, function() {
		//Die Search-Komponente in der URL hat ge�ndert 
		//(zB. weil der Back-Button gedr�ckt wurde -> Browser l�dt die vorherige URL).
		//-> entsprechende Filter setzen, so dass die Anzeige wieder der URL entspricht.
		
		var path = $location.path();
		var pathSplits = path.split("/");
		var view = pathSplits[1];
		
		if (view == "tuneSets") {
			var updateFilter = false;
		
			// Page	
			var page = $location.search()[pageKey] || "";
			if (page == "") {
				$scope.currentPage = 0;
			} else {
				$scope.currentPage = page - 1;
			}
			setPages($scope.currentPage);
			
			// Sortierung: Feld
			var sortField = $location.search()[tuneSetSortFieldKey] || "";
			if ($scope.tuneSetSortField != sortField){
				if (sortField == "") {
					// Sollte eigentlich nicht vorkommen
					$scope.tuneSetSortField = "tuneSetId";
				} else {
					$scope.tuneSetSortField = sortField;
				}
			}
			
			// Sortierung: Richtung
			var sortReverse = $location.search()[tuneSetSortReverseKey] || "";
			if ($scope.tuneSetSortReverse != sortReverse){
				if (sortReverse == "") {
					// Sollte eigentlich nicht vorkommen
					$scope.tuneSetSortReverse = false;
				} else if (sortReverse == "false") {
					$scope.tuneSetSortReverse = false;
				} else if (sortReverse == "true") {
					$scope.tuneSetSortReverse = true;
				}
			}
			
			// TuneSetPostion
			updateFilter = false;
			// Set-Id
			var tuneSetId = $location.search()[tuneSetIdToFilterKey] || "";
			if (tuneSetId == "") {
				if ($scope.tuneSetIdToFilter != 0) { 
					updateFilter = true;
					$scope.tuneSetIdToFilter = 0;
				}
			} else if (tuneSetId != $scope.tuneSetIdToFilter)  {
				updateFilter = true;
				$scope.tuneSetIdToFilter = tuneSetId;
			}
			// Set-Position
			var position = $location.search()[tuneSetPositionToFilterKey] || "";
			if (position == ""){ 
				if ($scope.tuneSetPositionToFilter != 0){
					updateFilter = true;
					$scope.tuneSetPositionToFilter = 0;
				}
			} else if (position != $scope.tuneSetPositionToFilter)  {
				updateFilter = true;
				$scope.tuneSetPositionToFilter = position;
			}
			
			if (updateFilter) {
				// Hinweis: tuneSetPositionToFilter wird nicht f�r den Filter verwendet (tuneSetIdToFilter gen�gt, da das Set selektioniert wird)
				// tuneSetPositionToFilter wird nur gebraucht, damit das gleiche Tune in der Auswahl wieder angezeigt wird (und nicht ein anderes im Set)
				setSelectedTuneSetPositionFilter($scope.tuneSetIdToFilter, $scope.tuneSetPositionToFilter);
			}
			
			// Type
			updateFilter = false;
			var type = $location.search()[tuneSetTypeFilterKey] || "";
			if (type == ""){
				if ($scope.tuneSetTypeFilter != null) {	
					updateFilter = true;
					$scope.tuneSetTypeFilter = null;	
					type = "All Types";
				}
			} else if (type != $scope.tuneSetTypeFilter.type) {
				updateFilter = true;
				$scope.tuneSetTypeFilter.type = type;
			}
			if (updateFilter){
				setSelectedTuneSetTypeFilter(type);
			}
			
			// Key
			var key = $location.search()[tuneSetKeyToFilterKey] || "";
			updateFilter = false;
			if (key == "") {
				if ($scope.tuneSetKeyToFilter != "All Keys") {
					updateFilter = true;
					$scope.tuneSetKeyToFilter = "All Keys";
				}
			} else if (key != $scope.tuneSetKeyToFilter) {
				updateFilter = true;
				$scope.tuneSetKeyToFilter = key;
			}
			if (updateFilter) {
				setSelectedTuneSetKeyFilter($scope.tuneSetKeyToFilter);
			}
			
			// Color
			var color = $location.search()[tuneSetColorToFilterKey] || "";
			updateFilter = false;
			if (color == ""){
				if ($scope.tuneSetColorToFilter != "All Colors") {
					updateFilter = true;
					$scope.tuneSetColorToFilter = "All Colors";
				}
			} else if (color != $scope.tuneSetColorToFilter) {
				updateFilter = true;
				$scope.tuneSetColorToFilter = color;
			}
			
			
			if (updateFilter){
				setSelectedTuneSetColorFilter($scope.tuneSetColorToFilter);
			}
			
			// Skill
			var skill = $location.search()[tuneSetSkillToFilterKey] || "";
			updateFilter = false;
			if (skill == ""){
				if ($scope.tuneSetSkillToFilter != 0) {
					updateFilter = true;
					$scope.tuneSetSkillToFilter = 0;
				}
			} else if (skill != $scope.tuneSetSkillToFilter) {
				updateFilter = true;
				$scope.tuneSetSkillToFilter = skill;
			}
			if (updateFilter){
				setSelectedTuneSetSkillFilter($scope.tuneSetSkillToFilter);
			}
			
			// In jedem Fall allf�llig vorher offene Detail-Panels schliessen
			initTuneSetViewDetailPanels();
		}
    });
	
	
	
	$scope.$watch(function () { return $location.path(); }, function() {
		//Pfad = aktuelle view (z.B. /tuneSets)
		var path = $location.path();
		var pathSplits = path.split("/");
		show(pathSplits[1]);
    });
		

	// Anzeige --> URL //
	// Hinweis: der Pfad wird in show(view) gesetzt (ev. sp�ter refactorieren).
	// Die Search-Parameter werden 'gewatched':
	$scope.$watch('currentPage', function(currentPage) {
		//Aktuelle Seite hat ge�ndert -> URL aktualisieren.
		$location.search(pageKey, currentPage + 1);
    });
	
	$scope.$watch('tuneSetPositionForFilter', function(tuneSetPositionForFilter) {
		//Tune-Auswahl hat ge�ndert -> URL aktualisieren.
		var tuneSetId = tuneSetPositionForFilter.tuneSetId;
		var position = tuneSetPositionForFilter.position;
		if (tuneSetId == 0) {
			tuneSetId = null;
			position = null;
		}
		$location.search(tuneSetIdToFilterKey, tuneSetId);
		$location.search(tuneSetPositionToFilterKey, position);
    });
	
	$scope.$watch('tuneSetTypeFilter', function(tuneSetTypeFilter) {
		//Type-Filter hat ge�ndert -> URL aktualisieren.
		var type = "";
		if (tuneSetTypeFilter == null || tuneSetTypeFilter.type == "") {
			// Type = "" sollte nicht vorkommen
			type = null;
		} else {
			type = tuneSetTypeFilter.type;
		}
		$location.search(tuneSetTypeFilterKey, type);
    });
	
	$scope.$watch('tuneSetKeyToFilter', function(tuneSetKeyToFilter) {
		//Key-Filter hat ge�ndert -> URL aktualisieren.
		var key = tuneSetKeyToFilter;
		if (key == "All Keys" || key == "") {
			// Key = "" sollte nicht vorkommen
			key = null;
		}
		$location.search(tuneSetKeyToFilterKey, key);
    });
	
	$scope.$watch('tuneSetColorToFilter', function(tuneSetColorToFilter) {
		//Color-Filter hat ge�ndert -> URL aktualisieren.
		var color = tuneSetColorToFilter;
		if (color == "All Colors" || color == "") {
			// Color = "" sollte nicht vorkommen
			color = null;
		}
		$location.search(tuneSetColorToFilterKey, color);
    });
	
	$scope.$watch('tuneSetSkillToFilter', function(tuneSetSkillToFilter) {
		//Skill-Auswahl hat ge�ndert -> URL aktualisieren.
		var skill = tuneSetSkillToFilter;
		if (skill == 0) {
			skill = null;
		}
		$location.search(tuneSetSkillToFilterKey, skill);
    });
	
	$scope.$watch('tuneSetSortField', function(tuneSetSortField) {
		//Sortierungs-Feld hat ge�ndert -> URL aktualisieren.
		$location.search(tuneSetSortFieldKey, tuneSetSortField);
    });
	
	$scope.$watch('tuneSetSortReverse', function(tuneSetSortReverse) {
		//Sortierungs-Richtung hat ge�ndert -> URL aktualisieren.
		
		var sortReverse = null;
		if (tuneSetSortReverse == null){
			//Sollte nicht vokommen
		} else if (tuneSetSortReverse) {
			sortReverse = "true";
		} else {
			sortReverse = "false";
		}
		$location.search(tuneSetSortReverseKey, sortReverse);
    });
	
	// ----  Ende Synchronisation URL mit Anzeige  --- //
	
	function initTuneSetFilters() {
		$scope.tuneSetColorToFilter = "All Colors";
		$scope.tuneSetSkillToFilter = 0;
		$scope.tuneSetKeyToFilter = "All Keys";
		$scope.tuneSetIdToFilter = 0;
		$scope.tuneSetPositionToFilter = 0;
		$scope.tuneSetTypeFilter = null;
	}
		
	function getSettings(){
		return {
			showTuneSecondLine: $scope.showTuneSecondLine,			// TuneSet-View 	// General Settings			
			showTuneThirdLine: $scope.showTuneThirdLine, 
			showTuneForthLine: $scope.showTuneForthLine,
			sessionModus: $scope.sessionModus,						// Session Modus
			tuneSetSortField: $scope.tuneSetSortField, 				// TuneSet-Sort
			tuneSetSortReverse: $scope.tuneSetSortReverse,			 
			//tuneSetAbcIncl: $scope.tuneSetAbcIncl,				// Abc-Export
			//playDateAbcIncl: $scope.playDateAbcIncl,
			//skillAbcIncl: $scope.skillAbcIncl,
			//colorAbcIncl: $scope.colorAbcIncl,
			//annotationAbcIncl: $scope.annotationAbcIncl,
			//siteAbcIncl: $scope.siteAbcIncl,
			//tubeAbcIncl: $scope.tubeAbcIncl,
			//fingeringAbcIncl: $scope.fingeringAbcIncl,
			tuneSetIdToFilter: $scope.tuneSetIdToFilter,			// TuneSet Filter	// Tunebook-specific Settings
			tuneSetPositionToFilter: $scope.tuneSetPositionToFilter,	
			tuneSetTypeFilter: $scope.tuneSetTypeFilter,
			tuneSetKeyToFilter: $scope.tuneSetKeyToFilter,
			tuneSetColorToFilter: $scope.tuneSetColorToFilter,		
			tuneSetSkillToFilter: $scope.tuneSetSkillToFilter,
			currentPage: $scope.currentPage							// Selected Page
		};
	}
	
	function initTuneSetViewDetailPanels(){
		// Init TuneSet-View-Detail-Panels (Panels shown on the right side of the tuneSets)
		$scope.editedTune = null;
		$scope.infoEditedTuneSetPosition = null;
		$scope.infoEditedTuneSet = null;
		$scope.movedTuneSetPosition = null;
		//$scope.exportedTuneBook = null; ..darf nicht auf null gestellt werden, da auch aus 'watch location.search' heraus aufgerufen
		$scope.youTubeTune = null;
		$scope.youTubeUrl = null;
		$scope.dotsViewerTune = null;
	}
	
	
	function setSelectors(){
		setFilterOptions();
		setTargetTuneSetPositionsForMoving();
	}
	
	
	function show(view){
		$scope.showTuneSets = false;
		$scope.showExport = false;
		$scope.showIntroduction = false;  
		$scope.showGettingStarted = false;
		$scope.showManual = false;
		$scope.showReleaseNotes = false;
		$scope.showCredits = false;
		$scope.showFeedback = false;
		$scope.showProgress = false;
		$scope.progress = 0;
	
		if (view == "tuneSets") {
			$scope.showTuneSets = true;
			
		} else if (view == "export") {
			$scope.showExport = true;
		
		} else if (view == "manual") {
			$scope.showManual = true;
		
		} else if (view == "credits") {
			$scope.showCredits = true;
		
		} else if (view == "introduction") {
			$scope.showIntroduction = true;		
			
		} else if (view == "gettingStarted") {
			$scope.showGettingStarted = true;
			
		} else if (view == "releaseNotes") {
			$scope.showReleaseNotes = true;
			
		} else if (view == "feedback") {
			$scope.showFeedback = true;

		} else if (view == "loading") {
			$scope.showProgress = true;
			$scope.progress = 50;
		}
		// URL aktualisieren
		// Achtung: Im Prinzip m�sste hier entflechtet werden 
		//(show wird auch von 'watch location.path' aufgerufen, da macht ein erneutes Setzen des Pfads eigentlich keinen Sinn
		// Refactoring ist aber kompliziert...)
		// Desweiteren: search(null) bei nicht-TuneSet-Schirmen hatte immer einen Streueffekt auf den TuneSet-Schirm (nach Dr�cken des Back-Button)
		// -> nicht umgesetzt -> page und sorting werden auch bei nicht-TuneSet-Schirmen gef�hrt.
		if (view != "loading") {
			$location.path(view);
		}
	}
	
	$scope.viewTuneSets = function() {
		show("tuneSets");
	};
	
	$scope.manual = function() {
		show("manual");
	};
	
	$scope.credits = function() {
		show("credits");
	};
	
	$scope.introduction = function() {
		show("introduction");
	};
	
	$scope.gettingStarted = function() {
		show("gettingStarted");
	};
	
	$scope.releaseNotes = function() {
		show("releaseNotes");
	};
	
	$scope.feedback = function() {
		show("feedback");
	};
	
	
	$scope.filterForTuneSetType = function(tuneSetTypeForFilter) {
		if (tuneSetTypeForFilter.type == "All Types"){
			$scope.tuneSetTypeFilter = null;
		} else {
			$scope.tuneSetTypeFilter = {type: tuneSetTypeForFilter.type};
		}
		initTuneSetViewDetailPanels();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);	
		show("tuneSets");
	};
	
	$scope.filterForTuneSetKey = function(tuneSetKeyForFilter) {
		if (tuneSetKeyForFilter.key == "All Keys"){
			$scope.tuneSetKeyToFilter = "All Keys";
		} else {
			$scope.tuneSetKeyToFilter = tuneSetKeyForFilter.key;
		}
		initTuneSetViewDetailPanels();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
		show("tuneSets");
	};
	
	$scope.filterForTuneSetColor = function(tuneSetColorForFilter) {
		if (tuneSetColorForFilter.color == "All Colors"){
			$scope.tuneSetColorToFilter = "All Colors";
		} else {
			$scope.tuneSetColorToFilter = tuneSetColorForFilter.color;
		}
		initTuneSetViewDetailPanels();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
		show("tuneSets");
	};
	
	$scope.tuneSetColorFilter = function(tuneSet) {
		var match = false;
		
		if ($scope.tuneSetColorToFilter == "All Colors") {
			match = true;
		
		} else {
			for (var i = 0; i < tuneSet.tuneSetPositions.length; i++) {
				if (tuneSet.tuneSetPositions[i].tune.color == $scope.tuneSetColorToFilter) {
					match = true;
				}
			}
		}
		
		return match;
	};
	
	
	$scope.tuneSetKeyFilter = function(tuneSet) {
		var match = false;
		
		if ($scope.tuneSetKeyToFilter == "All Keys") {
			match = true;
		
		} else {
			for (var i = 0; i < tuneSet.tuneSetPositions.length; i++) {
				if (tuneSet.tuneSetPositions[i].tune.key == $scope.tuneSetKeyToFilter) {
					match = true;
				}
			}
		}
		
		return match;
	};
	
	
	
	$scope.filterForTuneSetSkill = function(skillType) {
		$scope.tuneSetSkillToFilter = skillType.skill;
		initTuneSetViewDetailPanels();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
		show("tuneSets");
	};
	
	$scope.tuneSetSkillFilter = function(tuneSet) {
		var match = false;
		
		if ($scope.tuneSetSkillToFilter == 0) {
			match = true;
		
		} else {
			for (var i = 0; i < tuneSet.tuneSetPositions.length; i++) {
				if (tuneSet.tuneSetPositions[i].tune.skill == $scope.tuneSetSkillToFilter) {
					match = true;
				}
			}
		}
		
		return match;
	};
	
	
	$scope.tuneSetIdFilter = function(tuneSet) {
		var match = false;
		var nTuneSetId = 0;
		var nTuneSetFilterId = 0;
		
		if ($scope.tuneSetIdToFilter == 0) {
			match = true;
		
		} else {
			nTuneSetId = parseInt(tuneSet.tuneSetId);
			nTuneSetFilterId = parseInt($scope.tuneSetIdToFilter);
			
			if (nTuneSetId == nTuneSetFilterId) {
				match = true;
			}
		}
		
		return match;
	};
	
	$scope.orderByLastModified = function() {
		if ($scope.tuneSetSortField == "lastModified"){
			$scope.tuneSetSortReverse = !$scope.tuneSetSortReverse;
			
		} else {
			$scope.tuneSetSortField = "lastModified";
		}
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
			
	$scope.orderByFrequencyPlayed = function() {
		if ($scope.tuneSetSortField == "frequencyPlayed"){
			$scope.tuneSetSortReverse = !$scope.tuneSetSortReverse;
			
		} else {
			$scope.tuneSetSortField = "frequencyPlayed";
		}
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};

	$scope.orderByLastPlayed = function() {
		if ($scope.tuneSetSortField == "lastPlayed"){
			$scope.tuneSetSortReverse = !$scope.tuneSetSortReverse;
			
		} else {
			$scope.tuneSetSortField = "lastPlayed";
		}
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.orderByRandomNumber = function() {
		if ($scope.tuneSetSortField == "sort"){
			$scope.tuneSetSortReverse = !$scope.tuneSetSortReverse;
			
		} else {
			eTBk.TuneBook.setRandomSort($scope.tuneBook);	// calculate new random numbers
			$scope.tuneSetSortField = "sort";
		}
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.orderByTuneSetId = function() {
		if ($scope.tuneSetSortField == "tuneSetId"){
			$scope.tuneSetSortReverse = !$scope.tuneSetSortReverse;
			
		} else {
			$scope.tuneSetSortField = "tuneSetId";
		}
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.filterForTuneSet = function(tuneSetPositionForFilter) {
		if (tuneSetPositionForFilter.tuneSetId == 0){
			$scope.tuneSetIdToFilter = 0;
		} else {
			$scope.tuneSetIdToFilter = tuneSetPositionForFilter.tuneSetId;
		}
		initTuneSetViewDetailPanels();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
		show("tuneSets");
	};

	$scope.toggleTuneSecondLine = function() {
		if ($scope.sessionModus) {
			$scope.sessionModus = false;
			$scope.showTuneSecondLine = true;
		
		} else {
			$scope.showTuneSecondLine = !$scope.showTuneSecondLine;
		}
		
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.toggleTuneThirdLine = function() {
		if ($scope.sessionModus) {
			$scope.sessionModus = false;
			$scope.showTuneThirdLine = true;
		
		} else {
			$scope.showTuneThirdLine = !$scope.showTuneThirdLine;
		}
		
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.toggleTuneForthLine = function() {
		if ($scope.sessionModus) {
			$scope.sessionModus = false;
			$scope.showTuneForthLine = true;
		
		} else {
			$scope.showTuneForthLine = !$scope.showTuneForthLine;
		}
		
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.toggleSessionModus = function() {
		$scope.sessionModus = !$scope.sessionModus;
		
		if ($scope.sessionModus) {
			// Session-Modus: Button-Linien: visibility = hidden 
			// -> Buttons sind zwar unsichtbar, aber der Platz der Button-Linien wird dem sample-dots zur Verf�gung gestellt.
			// (mit z.B. showTuneSecondLine = false: display = none -> Second Line w�rde verschinden -> sample-dots w�rde in die erste Line rein rutschen).
			$scope.showTuneSecondLine = true;
			$scope.showTuneThirdLine = true;
			$scope.showTuneForthLine = true;
		}
		
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
	};
	
	$scope.loadBxplTuneBook = function( ) {
		show("loading");
		
		// Asynchron (Job Submit): Starte in einer Sekunde (1000 ms), damit UI Zeit hat, den Progress-Bar anzuzeigen
		// Ansonsten ist das UI eingefroren (Menu bleibt solange offen, bis TuneBook geladen)
		// Asynchron heisst: 
		// 		-loadBxplTuneBook geht zu Ende, digest-cyclus l�uft an ohne das neue Tunebook, nur mit dem Progress-Bar. 
		// 		-W�hrend der Progress-Bar angezeigt wird, l�uft das Laden der Daten, wenn fertig: apply -> n�chster digest-cyclus macht UI-update mit Tunebook
		// Hinweis: Javascript ist nicht multithreaded. Es wird also immer nur eine Funktion ausgef�hrt. Mit Events und Timer (setTimeout) wird die Ausf�hrung 
		// nur in die Warteschlange gestellt, wo sie dann abgearbeitet wird, wenn keine andere Funktion mehr l�uft (blockiert). 
		
		$timeout(function(){
			try {
				tuneBook = tbkStorage.getDefaultFromServer();
				$scope.tuneBook = tuneBook;
				//TODO: Die nachfolgenden Statements l�sen das Problem mit der fehlenden Aktualisierung der Version im Titel nicht
				//$scope.tuneBook.name = tuneBook.name;
				//$scope.tuneBook.version = tuneBook.version;
				//$scope.tuneBook.description = tuneBook.description;
				
				eTBk.TuneBook.storeAbc($scope.tuneBook);			
			} catch(e) {
				alert("eTuneBook cannot import " + eTBk.EXAMPLE_FILENAME + " due to: " + e.toString());		
			} finally {
				initView("tuneSets", "loadExampleTunebook");
				$scope.$apply();
			}
		},1000);	
	};
		
	$scope.newTune = function( ) {
		initializeTune( );
	};
	
	function initializeTune( ) {
		// A new Tune gets the highest TuneId, intTuneId and TuneSetId
		// Set OrderBy to -tuneSetId, so that new TuneSet appears on top
		var initTuneBook = false;
		
		if ($scope.hasOwnProperty("tuneBook")) {
			if ($scope.tuneBook.hasOwnProperty("tuneSets")){
				var newTuneSet = eTBk.TuneBook.initializeTuneSet($scope.tuneBook.tuneSets);
				$scope.tuneBook.tuneSets.unshift(newTuneSet);
				initView("tuneSets", "initializeTune");
				selectTuneSet(newTuneSet.tuneSetPositions[0]);
				
				//Setzen tune f�r Editor -> Textarea geht gleich auf
				$scope.editedTune = newTuneSet.tuneSetPositions[0].tune;
			} else {
				initTuneBook = true;
			}
		} else {
			initTuneBook = true;
		}
		
		if (initTuneBook) {
			$scope.tuneBook = eTBk.TuneBook.initializeTuneBook();
		}
	}
	
	$scope.initializeTuneBook = function( ) {
		// Init TuneBook
		$scope.tuneBook = eTBk.TuneBook.initializeTuneBook();
		
		if ($scope.tuneBook.hasOwnProperty("tuneSets")){
			initView("tuneSets", "initializeTune");
			selectTuneSet($scope.tuneBook.tuneSets[0].tuneSetPositions[0]);
				
			//Setzen tune f�r Editor -> Textarea geht gleich auf
			$scope.editedTune = $scope.tuneBook.tuneSets[0].tuneSetPositions[0].tune;
		
		} else {
			alert("TuneBook could not be initialized!");
		}
	};
   
	$scope.editTune = function( tuneSetPosition ) {
		// Wenn alle TuneSets angezeigt werden, reagiert der Cursor in der Textarea sehr sehr langsam. 
		//-> Sicht einschr�nken auf das TuneSet mit dem zu editierenden Tune
		// (Mit Pagination wird's zwar besser, aber immer noch langsamer, als wenn nur ein Set angezeigt wird.) 
		selectTuneSet(tuneSetPosition);
		
		// Only one TuneSet-View-Detail-Panel can be active -> Init
		initTuneSetViewDetailPanels();
		
		//Setzen tune f�r Editor
		$scope.editedTune = tuneSetPosition.tune;
	};
	
	$scope.editTuneInfo = function( tuneSetPosition ) { 
		if ($scope.infoEditedTuneSetPosition == tuneSetPosition) {
			$scope.infoEditedTuneSetPosition = null;
			//todo: bei 'unselect' springt wird top of page angezeigt, auch wenn das tune weiter unten lag
			//-> m�sste vor Einf�hrung gel�st werden
			//unselectTuneSet(tuneSetPosition);
		
		} else {
			selectTuneSet(tuneSetPosition);
			
			// Only one TuneSet-View-Detail-Panel can be active -> Init
			initTuneSetViewDetailPanels();
		
			//Setzen tuneSetPosition f�r Info-Editor
			$scope.infoEditedTuneSetPosition = tuneSetPosition;
		}
		
		// Put TuneBook to localStorage
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
	
	$scope.editTuneSetInfo = function( tuneSet ) { 
		if ($scope.infoEditedTuneSet == tuneSet) {
			$scope.infoEditedTuneSet = null;
			
			// �bertragen TuneSet-Infos auf erste TuneSetPosition
			for (var z = 0; z < tuneSet.tuneSetPositions.length; z++) {	
				if (tuneSet.tuneSetPositions[z].position == "1"){
					tuneSet.tuneSetPositions[z].tuneSetTarget = tuneSet.tuneSetTarget;
					tuneSet.tuneSetPositions[z].tuneSetEnv = tuneSet.tuneSetEnv;
					tuneSet.tuneSetPositions[z].tuneSetName = tuneSet.tuneSetName;	
				} 	
			}
		
		} else {
			selectTuneSet(tuneSet);
			
			// Only one TuneSet-View-Detail-Panel can be active -> Init
			initTuneSetViewDetailPanels();
		
			//Setzen tuneSet f�r Info-Editor
			$scope.infoEditedTuneSet = tuneSet;
		}
		
		// Put TuneBook to localStorage
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
	
	$scope.dotsViewer = function( tuneSetPosition ) { 
		if ($scope.dotsViewerTune == tuneSetPosition.tune) {
			$scope.dotsViewerTune = null;
			
			// Sync Sample Dots (needed after transposition)
			$scope.showSampleDots(tuneSetPosition);
			//todo: bei 'unselect' springt wird top of page angezeigt, auch wenn das tune weiter unten lag
			//-> m�sste vor Einf�hrung gel�st werden
			//unselectTuneSet(tuneSetPosition);
		
		} else {
			selectTuneSet(tuneSetPosition);
			
			// Only one TuneSet-View-Detail-Panel can be active -> Init
			initTuneSetViewDetailPanels();
		
			//Setzen tuneSetPosition.tune f�r showTheDots
			$scope.dotsViewerTune = tuneSetPosition.tune;
			
			renderAbc($scope.dotsViewerTune);
		}
	};
	
	$scope.tuneUp = function( tuneSetPosition) {
		// Transpose up and store on tunesetPosition
		var tune = eTBk.TuneBook.tuneUp(tuneSetPosition);
		// Sync Tune-Key
		tuneSetPosition.tune.key = eTBk.TuneBook.getTuneKey(tuneSetPosition.tune);
		// Show Transposition
		renderAbc(tune);
	};
	
	$scope.tuneDown = function( tuneSetPosition) {
		// Transpose down and store on tunesetPosition
		var tune = eTBk.TuneBook.tuneDown(tuneSetPosition);
		// Sync Tune-Key
		tuneSetPosition.tune.key = eTBk.TuneBook.getTuneKey(tuneSetPosition.tune);
		// Show Transposition
		renderAbc(tune);
	};
	
	$scope.printTune = function( tuneSetPosition) {
		// Im CSS wird beim Drucken alles bis auf .dotsViewer.showDotsViewer ausgeblendet 	
		$timeout(function() {
			window.print();
		}, 0, false);
	};
	
	$scope.showSampleDots = function( tuneSetPosition ) { 
		$timeout(function() {
			var showHere = 'sampleDotsViewerFor'+tuneSetPosition.tune.id;
			var tuneAbc = eTBk.TuneBook.getSampleAbc(tuneSetPosition);
			tuneAbc = skipFingering(tuneAbc);
			
			var sampleDotsScale = 0.9;
			var sampleDotsStaffWidth = 960;
			/*
			if ($scope.sessionModus) {
				sampleDotsScale = 0.6;
				sampleDotsStaffWidth = 840;
			}
			*/
			
			ABCJS.renderAbc(showHere, tuneAbc, {}, {scale:sampleDotsScale, paddingtop:0, paddingbottom:0, staffwidth:sampleDotsStaffWidth}, {});	
		}, 0, false);
	};
	
	function renderAbc(tune) {
		//Render Abc
		//Important: Has to be timed-out, otherwise fingerings won't show up
		//Compare with tbkTuneFocus: ABCJS.Editor also timed-out -> fingerings show up
		//Compare with tbkPopover: ABCJS.renderAbc is not timed-out -> fingerings dont' show (timeout in popover -> no popover is shown) 
	
		$timeout(function() {
			var showHere = 'renderTheDotsFor'+tune.id;
			var playHere = 'renderMidiFor'+tune.id;
			var tuneAbc = skipFingering(tune.pure);
			var dotsScale = 1.0;
			/*
			if ($scope.sessionModus) {
				dotsScale = 0.6;
			}
			*/
			ABCJS.renderAbc(showHere, tuneAbc, {print:true}, {scale:dotsScale}, {});
			ABCJS.renderMidi(playHere, tuneAbc, {}, {}, {});
		}, 0, false);
	}

	function skipFingering(tuneAbc) {	
		if (!$scope.fingeringAbcIncl) {
			tuneAbc = tuneAbc.replace(eTBk.PATTERN_FINGER, '');
		}
		return tuneAbc
	}

	$scope.toggleFingeringAbc = function() { 
		$scope.fingeringAbcIncl = !$scope.fingeringAbcIncl;
	
		if ($scope.showExport == true) {
			$scope.exportTuneBook(false);
			
		} else if ($scope.dotsViewerTune != null) {
			renderAbc($scope.dotsViewerTune);
		
		} else if ($scope.editedTune == null && $scope.infoEditedTuneSetPosition == null && $scope.infoEditedTuneSet == null && $scope.movedTuneSetPosition == null && $scope.dotsViewerTune == null  && $scope.youTubeTune == null) {  
			$timeout(function() {
				if ($scope.tuneSetsDisplayed && $scope.tuneSetsDisplayed.length > 0) {
					for (var i = 0; i < $scope.tuneSetsDisplayed.length; i++) {
						for (var z = 0; z < $scope.tuneSetsDisplayed[i].tuneSetPositions.length; z++) {
							$scope.showSampleDots($scope.tuneSetsDisplayed[i].tuneSetPositions[z]);
						}
					}
				}
			}, 1000, false);
		}
	};
	
	$scope.toggleTuneSetAbc = function() { 
		$scope.tuneSetAbcIncl = !$scope.tuneSetAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.togglePlayDateAbc = function() { 
		$scope.playDateAbcIncl = !$scope.playDateAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.toggleSkillAbc = function() { 
		$scope.skillAbcIncl = !$scope.skillAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.toggleColorAbc = function() { 
		$scope.colorAbcIncl = !$scope.colorAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.toggleAnnotationAbc = function() { 
		$scope.annotationAbcIncl = !$scope.annotationAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.toggleSiteAbc = function() { 
		$scope.siteAbcIncl = !$scope.siteAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	$scope.toggleTubeAbc = function() { 
		$scope.tubeAbcIncl = !$scope.tubeAbcIncl;
	
		if ($scope.showExport  == true) {
			$scope.exportTuneBook(false);
		}
	};
	
	
	
	function selectTuneSet(tuneSetPosition){
		// Setzen tune im Auswahl-Filter
		setSelectedTuneSetPositionFilterByTuneSetPosition(tuneSetPosition);
		// Merken aktuelles Tune im Filter f�r sp�teren 'unselect'
		$scope.tuneSetIdToFilterPrev = $scope.tuneSetIdToFilter;
		//Setzen tune f�r Filter
		$scope.tuneSetIdToFilter = tuneSetPosition.tuneSetId;
	
		// Merken aktuelle Seite f�r sp�teren 'unselect'
		$scope.currentPagePrev = $scope.currentPage;
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
	}
	
	function selectTuneSet(tuneSet){
		// Setzen tune im Auswahl-Filter (first tune): 
		setSelectedTuneSetPositionFilterByTuneSet(tuneSet);
		
		// Merken aktuelles Tune im Filter f�r sp�teren 'unselect'
		$scope.tuneSetIdToFilterPrev = $scope.tuneSetIdToFilter;
		//Setzen tune f�r Filter
		$scope.tuneSetIdToFilter = tuneSet.tuneSetId;
	
		// Merken aktuelle Seite f�r sp�teren 'unselect'
		$scope.currentPagePrev = $scope.currentPage;
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
	}
	
	function unselectTuneSet(tuneSetPosition){
		// Setzen vorherige Selektion im Tune-Auswahl-Filter
		$scope.tuneSetPositionForFilter = $scope.tuneSetPositionForFilterPrev;
		//Setzen vorheriges tune f�r Filter
		$scope.tuneSetIdToFilter = $scope.tuneSetIdToFilterPrev;
		
		// Setzen vorherige Seite als aktuelle Seite
		$scope.currentPage = $scope.currentPagePrev;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
	}
	
	
	$scope.moveTune = function( tuneSetPosition ) {
		if ($scope.movedTuneSetPosition == tuneSetPosition) {
			$scope.movedTuneSetPosition = null;
		
		} else {
			//selectTuneSet(tuneSetPosition);
			
			// Only one TuneSet-View-Detail-Panel can be active -> Init
			initTuneSetViewDetailPanels();
			
			$scope.movedTuneSetPosition = tuneSetPosition;
		}
	};
	
	function setSelectedTuneSetPositionFilterByTuneSetPosition(tuneSetPosition) {
		for (var i = 0; i < $scope.tuneSetPositionsForFilter.length; i++) {	
			if ($scope.tuneSetPositionsForFilter[i].tuneSetId == tuneSetPosition.tuneSetId  && $scope.tuneSetPositionsForFilter[i].intTuneId == tuneSetPosition.intTuneId){
				// Merken aktueller Filter f�r sp�teren 'unselect'
				$scope.tuneSetPositionForFilterPrev = $scope.tuneSetPositionForFilter
				// Setzen neuer Filter
				$scope.tuneSetPositionForFilter = $scope.tuneSetPositionsForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetPositionFilterByTuneSet(tuneSet) {
		for (var i = 0; i < $scope.tuneSetPositionsForFilter.length; i++) {	
			if ($scope.tuneSetPositionsForFilter[i].tuneSetId == tuneSet.tuneSetId  && $scope.tuneSetPositionsForFilter[i].position == "1"){
				// Merken aktueller Filter f�r sp�teren 'unselect'
				$scope.tuneSetPositionForFilterPrev = $scope.tuneSetPositionForFilter
				// Setzen neuer Filter
				$scope.tuneSetPositionForFilter = $scope.tuneSetPositionsForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetPositionFilter(tuneSetId, position) {
		for (var i = 0; i < $scope.tuneSetPositionsForFilter.length; i++) {	
			if ($scope.tuneSetPositionsForFilter[i].tuneSetId == tuneSetId  && $scope.tuneSetPositionsForFilter[i].position == position){
				// Setzen neuer Filter
				$scope.tuneSetPositionForFilter = $scope.tuneSetPositionsForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetTypeFilter(type) {
		for (var i = 0; i < $scope.tuneSetTypesForFilter.length; i++) {	
			if ($scope.tuneSetTypesForFilter[i].type == type){
				// Setzen neuer Filter
				$scope.tuneSetTypeForFilter = $scope.tuneSetTypesForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetKeyFilter(key) {
		for (var i = 0; i < $scope.tuneSetKeysForFilter.length; i++) {	
			if ($scope.tuneSetKeysForFilter[i].key == key){
				// Setzen neuer Filter
				$scope.tuneSetKeyForFilter = $scope.tuneSetKeysForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetColorFilter(color) {
		for (var i = 0; i < $scope.tuneSetColorsForFilter.length; i++) {	
			if ($scope.tuneSetColorsForFilter[i].color == color){
				// Setzen neuer Filter
				$scope.tuneSetColorForFilter = $scope.tuneSetColorsForFilter[i];
			}
		}
	}
	
	function setSelectedTuneSetSkillFilter(skill) {
		for (var i = 0; i < $scope.skillTypes.length; i++) {	
			if ($scope.skillTypes[i].skill == skill){
				// Setzen neuer Filter
				$scope.skillType = $scope.skillTypes[i];
			}
		}
	}


	$scope.doneEditing = function( tuneSetPosition ) {
		$scope.editedTune = null;
		
		if ( !tuneSetPosition.tune.pure ) {
			$scope.removeTuneSetPosition(tuneSetPosition);
			
			$scope.tuneSetIdToFilter = 0;
		
		} else {
			// Sync Tune-Fields
			tuneSetPosition.tune.title = eTBk.TuneBook.getTuneTitle(tuneSetPosition.tune);
			tuneSetPosition.tune.type = eTBk.TuneBook.getTuneType(tuneSetPosition.tune);
			tuneSetPosition.tune.key = eTBk.TuneBook.getTuneKey(tuneSetPosition.tune);
			tuneSetPosition.tune.id = eTBk.TuneBook.getTuneId(tuneSetPosition.tune);
		}
		
		// Selectors pauschal setzen
		setSelectors();
		// Set page 1 as current page
		$scope.currentPage = 0;
		// Put Settings to localStorage
		eTBk.TuneBook.storeSettings(getSettings());
		setPages($scope.currentPage);
			
		// Setzen tune im Auswahl-Filter
		setSelectedTuneSetPositionFilterByTuneSetPosition(tuneSetPosition);

		// Put TuneBook to localStorage
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
	
	$scope.doneMoving = function( tuneSetPosition, targetTuneSetPosition, beforeOrAfter, moveOrCopy ) {
		// Hinweis:	Der OrderBy-Filter auf position (siehe HTML) funktioniert nat�rlich nur,
		// 			wenn alle Positionen das gleiche Format haben (alles Strings oder alles Zahlen). 
		//			Beim Lesen aus der ABC-Datei sowie beim lesen aus LocalStorage ist dies der Fall (alles Strings). 
		//			Sobald aber mit position gerechnet wird, wird eine Zahl daraus, welche dann wieder 
		//			zu einem String konvertiert werden muss, damit die View (OrderBy) die ge�nderten 
		//			Positionen richtig sortieren kann.
	
		// View after moving
		$scope.movedTuneSetPosition = null;
		
		var twoSetsInvolved = false;
		
		if (tuneSetPosition.tuneSetId !== targetTuneSetPosition.tuneSetId){
			twoSetsInvolved = true;
		}
		
		var removedPosition = 0; 
		removedPosition = parseInt(tuneSetPosition.position);
		
		
		// Handle Sending TuneSet 
		// (only in case of moving and if sending tuneSet ist different from target tuneSet)
		if (moveOrCopy == "move" && twoSetsInvolved){
			for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {
				if ($scope.tuneBook.tuneSets[i].tuneSetId == tuneSetPosition.tuneSetId){
					// Sending TuneSet
					
					// Remove TuneSetPosition from TuneSet
					for (var z = 0; z < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; z++) {	
						if ($scope.tuneBook.tuneSets[i].tuneSetPositions[z].intTuneId == tuneSetPosition.intTuneId){
							// Moving TuneSetPosition
							
							// Delete TuneSetDirective from TuneSetPosition
							//eTBk.TuneBook.deleteTuneSetDirective(tuneSetPosition);
							// Delete TuneSetPosition from TuneSet
							$scope.tuneBook.tuneSets[i].tuneSetPositions.splice($scope.tuneBook.tuneSets[i].tuneSetPositions.indexOf(tuneSetPosition), 1);
						} 
					}
					
					if ($scope.tuneBook.tuneSets[i].tuneSetPositions.length == 0) {
						// Empty TuneSet
						// Remove TuneSet from the List
						$scope.tuneBook.tuneSets.splice(i,1);
					
					} else {
						// TuneSet still has TuneSetPositions
						// Adjust Positions of remaining TuneSetPositions: Only necessary for tunes that come after the removed tune
						var currentPosition = 0;		
						
						for (var y = 0; y < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; y++) {	
							currentPosition = parseInt($scope.tuneBook.tuneSets[i].tuneSetPositions[y].position);
							
							if (currentPosition > removedPosition) {
								currentPosition--;
								// Change Position on TuneSetPosition
								$scope.tuneBook.tuneSets[i].tuneSetPositions[y].position = currentPosition.toString();
								// Change Position on TuneSetDirective
								//eTBk.TuneBook.changePositionOnTuneSetDirective($scope.tuneBook.tuneSets[i].tuneSetPositions[y]);
							}
						}
					}
				} 	
			}
		}

		// Handle Target TuneSet
		for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {
			if ($scope.tuneBook.tuneSets[i].tuneSetId == targetTuneSetPosition.tuneSetId) {
				var newPosition = 0;
				newPosition = parseInt(targetTuneSetPosition.position);
				
				if (beforeOrAfter == "after"){
					newPosition++;
				
				} else {
					newPosition--;
					
					if (newPosition < 1) {
						newPosition = 1;
					}
				}
				
				var newTuneSetPosition = new Array();
				
				// Todo: Handle TuneSet-Fields on first TuneSetPosition
				if (moveOrCopy == "move"){
					// Set new TuneSetId and Position on TuneSetPosition
					// copy by reference
					newTuneSetPosition = tuneSetPosition 
					newTuneSetPosition.tuneSetId = targetTuneSetPosition.tuneSetId;
					newTuneSetPosition.position = newPosition.toString();
				
				} else if (moveOrCopy == "copy"){
					// Set new TuneSetId and Position on TuneSetPosition
					// copy by value (primitive types), copy by reference (objects) -> tune is shared
					newTuneSetPosition = eTBk.TuneBook.newTuneSetPosition(targetTuneSetPosition.tuneSetId,
																tuneSetPosition.tuneSetTarget, tuneSetPosition.tuneSetEnv, 
																tuneSetPosition.tuneSetName,
																tuneSetPosition.intTuneId, tuneSetPosition.tune, 
																newPosition.toString(), tuneSetPosition.repeat);
				} 
				
				// Add TuneSetPosition to TuneSet (only if sending tuneSet ist different from target tuneSet)
				if (twoSetsInvolved) {
					// At index (newPosition--) insert the moving TuneSetPosition, but don't remove other TuneSetPositions
					var insertAt = newPosition - 1;
					$scope.tuneBook.tuneSets[i].tuneSetPositions.splice(insertAt,0,newTuneSetPosition);
					// Add new TuneSetDirective
					//eTBk.TuneBook.addNewTuneSetDirective(tuneSetPosition);
				
				} else {
					// Change Position on TuneSetDirective
					//eTBk.TuneBook.changePositionOnTuneSetDirective(tuneSetPosition);
				}
				
				// Change Position of other TuneSetPositions in the Set: Only necessary for tunes that come after the inserted tune
				// TODO: Beachte aber Spezialfall: Nach hinten schieben im gleichen Set! Hier muss so was wie ein Delete simuliert werden (position runterz�hlen)
				// (ist aber nicht trivial). Die jetzige Version sortiert in einem solchen Fall die View zwar richtig, es gehen aber positions verloren.
				// Bsp: move position 2 after position 3 in the same tuneSet: before: 1,2,3,4, after: 1,3,4,5 -> position 2 ist verloren gegangen.
				for (var y = 0; y < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; y++) {	
	
					var currentPosition = 0;		
					
					if ($scope.tuneBook.tuneSets[i].tuneSetPositions[y].intTuneId == tuneSetPosition.intTuneId){
						// Moving TuneSetPosition: Already Done	
					
					} else {
						// TuneSetPositions that where here before
						currentPosition = parseInt($scope.tuneBook.tuneSets[i].tuneSetPositions[y].position);
						//var positionStored = currentPosition;
						
						/*
						if (!twoSetsInvolved && currentPosition > removedPosition) {
							currentPosition--;
						}
						*/
						
						if (currentPosition >= newPosition) {
							currentPosition++;
							// Change Position on TuneSetPosition
							$scope.tuneBook.tuneSets[i].tuneSetPositions[y].position = currentPosition.toString();
							// Change Position on TuneSetDirective
							//eTBk.TuneBook.changePositionOnTuneSetDirective($scope.tuneBook.tuneSets[i].tuneSetPositions[y]);
						}
						
						/*
						if (currentPosition < 1) {
							currentPosition = 1;
						}
						*/
						
						/*
						if (currentPosition !== positionStored) {
							// Change Position on TuneSetPosition
							$scope.tuneBook.tuneSets[i].tuneSetPositions[y].position = currentPosition.toString();
							// Change Position on TuneSetDirective
							eTBk.TuneBook.changePositionOnTuneSetDirective($scope.tuneBook.tuneSets[i].tuneSetPositions[y]);
						}
						*/
					}
				}
			}	
		}
		
		eTBk.TuneBook.storeAbc($scope.tuneBook);	
	};
	
	$scope.putTuneBookToLocalStorage = function() {
		//tbkStorage.putToLocalStorage($scope.tuneBook);
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
  
	$scope.removeTuneSetPosition = function( tuneSetPosition ) {
		for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {	
			
			if ($scope.tuneBook.tuneSets[i].tuneSetId == tuneSetPosition.tuneSetId){
				// TuneSetPosition aus TuneSet rausl�schen
				$scope.tuneBook.tuneSets[i].tuneSetPositions.splice($scope.tuneBook.tuneSets[i].tuneSetPositions.indexOf(tuneSetPosition), 1);
			
				if ($scope.tuneBook.tuneSets[i].tuneSetPositions.length == 0) {
					// TuneSet l�schen, wenn keine TuneSetPosition mehr dranh�ngt
					$scope.tuneBook.tuneSets.splice(i,1);
				}
			}
		}
	};
  
	$scope.importTuneBook = function(abc, fileName) {
		show("loading");
		
		$timeout(function(){
			try {
				$scope.tuneBook = tbkStorage.getFromImportedFile(abc, fileName);
				eTBk.TuneBook.storeAbc($scope.tuneBook);			
			} catch(e) {
				alert("eTuneBook cannot import " + fileName + " due to: " + e.toString());		
			} finally {
				initView("tuneSets", "importTuneBook");
				$scope.$apply();
			}
		},1000);
	};
	
	$scope.exportTuneBook = function(startDownload) {
		var tuneSets = new Array();
		var convertToAbc = false;
		
		if ($scope.hasOwnProperty("tuneBook")) {
			// Umfang des Exports bestimmen
			if ($scope.tuneSetsFiltered && $scope.tuneSetsFiltered.length > 0) {
				// Subset of the TuneBook
				tuneSets = $scope.tuneSetsFiltered;
				convertToAbc = true;
			
			} else if ($scope.tuneBook.tuneSets) {
				// TuneBook
				tuneSets = $scope.tuneBook.tuneSets;
				convertToAbc = true;
			}
		}
		
		if (convertToAbc) {
			// Exportieren
			var date = moment(new Date());
			var tuneBookVersion = date.format("YYYY-MM-DDTHH:mm");
			
			$scope.exportedTuneBook = eTBk.TuneBook.getAbc(tuneSets, $scope.tuneBook.name, tuneBookVersion, $scope.tuneBook.description, $scope.tuneSetAbcIncl, $scope.playDateAbcIncl, $scope.skillAbcIncl, $scope.colorAbcIncl, $scope.annotationAbcIncl, $scope.siteAbcIncl, $scope.tubeAbcIncl, $scope.fingeringAbcIncl);
			show("export");
			// Generieren Object URL zum exportierten Tunebook (f�r Backup des Abc-Codes in File)
			saveTuneBookAsFile($scope.exportedTuneBook, startDownload);
		
		} else {
			alert("No TuneBook loaded yet.");
		}
		
	};
	
	
	function saveTuneBookAsFile(exportedTuneBookAsText, startDownload){
	    var exportedTuneBookAsBlob = new Blob([exportedTuneBookAsText], {type:'text/plain'});
	    var fileNameToSaveAs = "My TuneBook";
	    
	    var downloadLink = document.getElementById("saveTuneBookToFile");
	    downloadLink.href = createObjectURL(exportedTuneBookAsBlob);
	    downloadLink.download = fileNameToSaveAs;
	    
	    if (startDownload) {
	    	downloadLink.click();
	    }
	}
	
	function createObjectURL ( file ) {
	    if ( window.webkitURL ) {
	    	// Chrome
	        return window.webkitURL.createObjectURL( file );
	    } else if ( window.URL && window.URL.createObjectURL ) {
	    	// Firefox
	        return window.URL.createObjectURL( file );
	    } else {
	        return null;
	    }
	}
		
	
	function setTuneSetTypesForFilter(){
		//Extract TuneSetTypes for TypeFilter
		var tuneSetTypeForFilter = new Array();
		var tuneSetTypesForFilter = new Array();
		var addToTypeFilter = true;
		var tuneSetCount = 0;
		var tuneCount = 0;
		var tuneCountInTheSet = 0;
		var selectedTuneSetTypeForFilter = new Array ();
		
		if ($scope.hasOwnProperty("tuneBook")) {
			for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {	
				addToTypeFilter = true;
				tuneCountInTheSet = 0;
				tuneSetCount = tuneSetCount + 1;
				tuneCountInTheSet  = $scope.tuneBook.tuneSets[i].tuneSetPositions.length;
				tuneCount = tuneCount + tuneCountInTheSet;
				
				for (var z = 0; z < tuneSetTypesForFilter.length; z++) {	
					if (tuneSetTypesForFilter[z].type == $scope.tuneBook.tuneSets[i].type) {
						addToTypeFilter = false;
						tuneSetTypesForFilter[z].setCount = tuneSetTypesForFilter[z].setCount + 1;
						tuneSetTypesForFilter[z].tuneCount = tuneSetTypesForFilter[z].tuneCount + tuneCountInTheSet;	
					}
				}
				if (addToTypeFilter) {
					tuneSetTypeForFilter = new Array();
					tuneSetTypeForFilter.type = $scope.tuneBook.tuneSets[i].type;
					tuneSetTypeForFilter.setCount = 1;
					tuneSetTypeForFilter.tuneCount = tuneCountInTheSet;
					tuneSetTypesForFilter.push(tuneSetTypeForFilter);
					
					if ($scope.tuneSetTypeFilter != null && $scope.tuneSetTypeFilter.type == tuneSetTypeForFilter.type) {
						// Last selected Type, restored from local storage
						selectedTuneSetTypeForFilter = tuneSetTypeForFilter;
					}
				}
			}
		}
		
		tuneSetTypeForFilter = new Array();
		tuneSetTypeForFilter.type = "All Types";
		tuneSetTypeForFilter.setCount = tuneSetCount;
		tuneSetTypeForFilter.tuneCount = tuneCount;
		tuneSetTypesForFilter.unshift(tuneSetTypeForFilter);
				
		$scope.tuneSetTypesForFilter = tuneSetTypesForFilter;
		
		// Set selected Type
		if ($scope.tuneSetTypeFilter == null) {
			$scope.tuneSetTypeForFilter = $scope.tuneSetTypesForFilter[0];	//Set "All Types" as default		
		} else {
			// Last selected Type, restored from local storage
			$scope.tuneSetTypeForFilter = selectedTuneSetTypeForFilter;
		}
	}
	
	function setTuneSetKeysForFilter(){
		//Extract TuneSetKeys for KeyFilter
		var tuneSetKeyForFilter = new Array();
		var tuneSetKeysForFilter = new Array();
		var tuneSetKeysCounted = new Array();
		var addToTuneSetCount = true;
		var addToKeyFilter = true;
		var tuneSetCount = 0;
		var tuneCount = 0;
		var selectedTuneSetKeyForFilter = new Array ();
		
		if ($scope.hasOwnProperty("tuneBook")) {
			
			tuneSetCount = $scope.tuneBook.tuneSets.length;
			
			for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {
				tuneSetKeysCounted = new Array();
				
				for (var c = 0; c < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; c++) {
					addToKeyFilter = true;
					
					tuneCount = tuneCount + 1;
				
					for (var z = 0; z < tuneSetKeysForFilter.length; z++) {	
						if (tuneSetKeysForFilter[z].key == $scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.key) {
							addToKeyFilter = false;
							
							tuneSetKeysForFilter[z].tuneCount = tuneSetKeysForFilter[z].tuneCount + 1;
							addToTuneSetCount = true;
							
							for (var y = 0; y < tuneSetKeysCounted.length; y++) {
								if (tuneSetKeysCounted[y] == $scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.key) {
									addToTuneSetCount = false;		
								}
							}
							
							if (addToTuneSetCount) {
								// Pro Key ein Set nur einmal z�hlen
								tuneSetKeysForFilter[z].setCount = tuneSetKeysForFilter[z].setCount + 1;
								tuneSetKeysCounted.push($scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.key);
							}
						}
					}
					
					if (addToKeyFilter) {
						tuneSetKeyForFilter = new Array();
						tuneSetKeyForFilter.key = $scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.key;
						tuneSetKeyForFilter.sort = tuneSetKeyForFilter.key;
						tuneSetKeyForFilter.setCount = 1;
						tuneSetKeyForFilter.tuneCount = 1;
						tuneSetKeysCounted.push($scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.key);
						tuneSetKeysForFilter.push(tuneSetKeyForFilter);
						
						if ($scope.tuneSetKeyToFilter == tuneSetKeyForFilter.key) {
							// Last selected Key, restored from local storage
							selectedTuneSetKeyForFilter = tuneSetKeyForFilter;
						}
					}		
				}
			}
		}
		
		tuneSetKeyForFilter = new Array();
		tuneSetKeyForFilter.key = "All Keys";
		tuneSetKeyForFilter.sort = "";  // Sort, damit zum Beispiel "Ador" nicht vor "All Keys" kommt
		tuneSetKeyForFilter.setCount = tuneSetCount;
		tuneSetKeyForFilter.tuneCount = tuneCount;
		tuneSetKeysForFilter.unshift(tuneSetKeyForFilter);
		$scope.tuneSetKeysForFilter = tuneSetKeysForFilter;
		
		// Set selected Key
		if ($scope.tuneSetKeyToFilter == "All Keys") {
			$scope.tuneSetKeyForFilter = $scope.tuneSetKeysForFilter[0];	//Set "All Keys" as default		
		} else {
			// Last selected Key, restored from local storage
			$scope.tuneSetKeyForFilter = selectedTuneSetKeyForFilter;
		}
	}
	
	function setTuneSetColorsForFilter(){
		//Extract TuneSetColors for ColorFilter
		var tuneSetColorForFilter = new Array();
		var tuneSetColorsForFilter = new Array();
		var addToColorFilter = true;
		var selectedTuneSetColorForFilter = new Array ();
		
		if ($scope.hasOwnProperty("tuneBook")) {
			for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {	
				for (var c = 0; c < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; c++) {
					addToColorFilter = true;
				
					for (var z = 0; z < tuneSetColorsForFilter.length; z++) {	
						if (tuneSetColorsForFilter[z].color == $scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.color) {
							addToColorFilter = false;
						}
					}
					
					if (addToColorFilter) {
						tuneSetColorForFilter = new Array();
						tuneSetColorForFilter.color = $scope.tuneBook.tuneSets[i].tuneSetPositions[c].tune.color;
						tuneSetColorForFilter.text = "     "; 
						tuneSetColorsForFilter.push(tuneSetColorForFilter);
						
						if ($scope.tuneSetColorToFilter == tuneSetColorForFilter.color) {
							// Last selected Color, restored from local storage
							selectedTuneSetColorForFilter = tuneSetColorForFilter;
						}
					}		
				}
			}
		}
		
		tuneSetColorForFilter = new Array();
		tuneSetColorForFilter.color = "All Colors";
		tuneSetColorForFilter.text = "     "; 
		tuneSetColorsForFilter.unshift(tuneSetColorForFilter);
				
		$scope.tuneSetColorsForFilter = tuneSetColorsForFilter;
		
		// Set selected Color
		if ($scope.tuneSetColorToFilter == "All Colors") {
			$scope.tuneSetColorForFilter = $scope.tuneSetColorsForFilter[0];	//Set "All Colors" as default		
		} else {
			// Last selected Color, restored from local storage
			$scope.tuneSetColorForFilter = selectedTuneSetColorForFilter;
		}
	}
	
	function setSkillFilter(){
		// Put Skill-Definitions to the SkillFilter
		var skillType = new Array();
		var skillTypes = new Array();
		var selectedSkillType = new Array();
		
		for (var i = 1; i < 7; i++) {
			skillType = new Array();
			skillType.skill = i;
			if (skillType.skill == 1) {
				skillType.description = "*";
			} else if (skillType.skill == 2) {
				skillType.description = "* *";	
			} else if (skillType.skill == 3) {
				skillType.description = "* * *";
			} else if (skillType.skill == 4) {
				skillType.description = "* * * *";
			} else if (skillType.skill == 5) {
				skillType.description = "* * * * *";
			} else if (skillType.skill == 6) {
				skillType.description = "* * * * * *";
			}
			skillTypes.push(skillType);

			if ($scope.tuneSetSkillToFilter == skillType.skill) {
				// Last selected Skill, restored from local storage
				selectedSkillType = skillType;
			}	
		}
		
		skillType = new Array();
		skillType.skill = 0;
		skillType.description = "All Skills";
		skillTypes.unshift(skillType);
		
		$scope.skillTypes = skillTypes;
		
		// Set selected Skill
		if ($scope.tuneSetSkillToFilter == 0) {
			$scope.skillType = $scope.skillTypes[0];	//Set "All Skills" as default		
		} else {
			// Last selected Skill, restored from local storage
			$scope.skillType = selectedSkillType;
		}
		
		
		
	}
	
	function setFilterOptions(){
		setTuneSetTypesForFilter();
		setTuneSetKeysForFilter();
		setTuneSetColorsForFilter();
		setSkillFilter();	
		setTuneSetPositionsForFilter();
	}
	
	$scope.refreshColorFilter = function( ) {
		setTuneSetColorsForFilter();
	}
	
	function setTargetTuneSetPositionsForMoving(){
		var targetTuneSetPositionsForMoving = new Array();
		var tuneSets = new Array();
		
		if ($scope.hasOwnProperty("tuneBook")) {
			tuneSets = $scope.tuneBook.tuneSets;
			
			// targetTuneSetPositionsForMoving aufbereiten
			for (var i = 0; i < tuneSets.length; i++) {	
				for (var z = 0; z < tuneSets[i].tuneSetPositions.length; z++) {	
					targetTuneSetPositionsForMoving.push(tuneSets[i].tuneSetPositions[z]);
				}
			}
		}
		
		$scope.targetTuneSetPositionsForMoving = targetTuneSetPositionsForMoving;
	}
	
	function setTuneSetPositionsForFilter(){
		var tuneSetPositionsForFilter = new Array();
		var tuneSetPositionForFilter = new Array();
		var titleSplits = new Array();
		var selectedTuneSetPositionForFilter = new Array();
		
		// tuneSetPositionsForFilter aufbereiten		
		if ($scope.hasOwnProperty("tuneBook")) {
			for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {	
			
				for (var z = 0; z < $scope.tuneBook.tuneSets[i].tuneSetPositions.length; z++) {	
					tuneSetPositionForFilter = new Array();
					tuneSetPositionForFilter.tuneSetId = $scope.tuneBook.tuneSets[i].tuneSetPositions[z].tuneSetId;
					tuneSetPositionForFilter.tuneType = $scope.tuneBook.tuneSets[i].tuneSetPositions[z].tune.type;
					tuneSetPositionForFilter.intTuneId = $scope.tuneBook.tuneSets[i].tuneSetPositions[z].intTuneId;
					tuneSetPositionForFilter.position = $scope.tuneBook.tuneSets[i].tuneSetPositions[z].position;
					
					titleSplits = new Array();
					titleSplits = $scope.tuneBook.tuneSets[i].tuneSetPositions[z].tune.title.split(",");
					tuneSetPositionForFilter.tuneTitle = titleSplits[0];
				
					tuneSetPositionsForFilter.push(tuneSetPositionForFilter);
					
					if ($scope.tuneSetIdToFilter == tuneSetPositionForFilter.tuneSetId) {
						// Last selected Color, restored from local storage
						selectedTuneSetPositionForFilter = tuneSetPositionForFilter;
					}
				}
			}
		}
		
		// Sort by tuneTitle
		tuneSetPositionsForFilter.sort(function(a, b){
			return a.tuneTitle-b.tuneTitle;
		});
		
		tuneSetPositionForFilter = new Array();
		tuneSetPositionForFilter.tuneSetId = 0;
		tuneSetPositionForFilter.intTuneId = 0;
		tuneSetPositionForFilter.position = 0;
		tuneSetPositionForFilter.tuneTitle = "All Tunes";	
		tuneSetPositionsForFilter.unshift(tuneSetPositionForFilter);
		
		$scope.tuneSetPositionsForFilter = tuneSetPositionsForFilter;
		
		// Set selected TuneSet
		if ($scope.tuneSetIdToFilter == 0) {
			$scope.tuneSetPositionForFilter = $scope.tuneSetPositionsForFilter[0];	//Set "All Tunes" as default		
		} else {
			// Last selected TuneSet, restored from local storage
			$scope.tuneSetPositionForFilter = selectedTuneSetPositionForFilter;
		}
	}
	
	$scope.toggleYouTubeVideo = function(tuneSetPosition, youTubeUrl) {
		if ($scope.youTubeTune == tuneSetPosition.tune && $scope.youTubeUrl == youTubeUrl) {
			$scope.youTubeUrl = null;
			$scope.youTubeTune = null;
			//todo: bei 'unselect' springt wird top of page angezeigt, auch wenn das tune weiter unten lag
			//-> m�sste vor Einf�hrung gel�st werden 
			//unselectTuneSet(tuneSetPosition);
		
		} else {
			selectTuneSet(tuneSetPosition);
			
			// Only one TuneSet-View-Detail-Panel can be active -> Init
			initTuneSetViewDetailPanels();
			
			$scope.youTubeUrl = youTubeUrl;
			$scope.youTubeTune = tuneSetPosition.tune;
		}
	};
		
	$scope.justPlayedTheTune = function( tuneSetPosition) {
		var now = new Date();
		eTBk.TuneBook.addPlayDate(tuneSetPosition, now);
			
		// Identify tuneSet in order to set the the new Date and calculate frequencyPlayed
		for (var i = 0; i < $scope.tuneBook.tuneSets.length; i++) {	
			
			if ($scope.tuneBook.tuneSets[i].tuneSetId == tuneSetPosition.tuneSetId){
				$scope.tuneBook.tuneSets[i].lastPlayed = tuneSetPosition.tune.lastPlayed;
				eTBk.TuneBook.setFrequencyPlayed($scope.tuneBook.tuneSets[i]);
			}
		}
		
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
	
	$scope.decreaseSkill = function( tuneSetPosition) {
		if (!tuneSetPosition.tune.skill){
			tuneSetPosition.tune.skill = 1;
		
		} else if (tuneSetPosition.tune.skill < 1){
			tuneSetPosition.tune.skill = 1;
		
		} else if (tuneSetPosition.tune.skill == 1){
		
		} else if (tuneSetPosition.tune.skill > 6) {
			tuneSetPosition.tune.skill = 6;
		
		} else {
			tuneSetPosition.tune.skill = tuneSetPosition.tune.skill - 1;
		}
		
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
	
	$scope.increaseSkill = function( tuneSetPosition) {
		if (!tuneSetPosition.tune.skill){
			tuneSetPosition.tune.skill = 1;
		
		} else if (tuneSetPosition.tune.skill < 1){
			tuneSetPosition.tune.skill = 1;
	
		} else if (tuneSetPosition.tune.skill >= 6) {
			tuneSetPosition.tune.skill = 6;
		
		} else {
			tuneSetPosition.tune.skill = tuneSetPosition.tune.skill + 1;
		}
	
		eTBk.TuneBook.storeAbc($scope.tuneBook);
	};
});





