$(document).ready(function(){
  //Get the element with the ID of board
  //Use $ to signify it has a jQuery object
  var $board = $('#minesweeperBoard');

  //Create the Header, which contains controls to enter the size and number of mines
  var headingDivContainer = '<div id="headingContainerClass"></div>'
  $("#title").after(headingDivContainer);
  var numberOfRowsForm = '<form class="rowsForm">Number of Rows (between 8 and 40): <input type="number" id="rowField" min="8" max="40"></form>';
  var numberOfColumnsForm = '<form class="columnsForm">Number of Columns (between 8 and 30): <input type="number" id="columnField" min="8" max="30"></form>';
  var numberOfMinesForm = '<form id="numberOfMinesForm">Number of Mines: <input type="number" id="minesField" min="1" max="1200"></form>';
  $( "#headingContainerClass" ).append(numberOfRowsForm).append(numberOfColumnsForm).append(numberOfMinesForm);
  var $createNewGameButton = $('<input type="button" class= "newGameButton" value="Create/Restart Game with New Minefield"/>');
  $("#numberOfMinesForm").after($createNewGameButton);

  //Adding the div container to show the leaderboard
  $board.after("<div id='leaderboardContainer'>High Scores: </div>");

  //Add text to show the number of mines remaining, only show once game has started
  var numberOfMinesRemaining = '<p id="minesRemainingLabel">Number of Mines Remaining: </p>';
  $board.after(numberOfMinesRemaining);
  $('#minesRemainingLabel').hide();

  //Add text to show the timer, only show once game has started
  var timerLabel = '<p id="timerLabel">Timer (seconds): </p>';
  $board.after(timerLabel);
  $('#timerLabel').hide();
  var $timer;

  /**
  * Functionality to begin the game once the button to click a new game is clicked
  */
  $($createNewGameButton).click(function(){
    var highScoreToBeat = null;
    var timeCounter = 0;
    var numberOfFlags = 0;
    var $numberOfRowsField = $('#rowField');
    var $numberOfColumnsField = $('#columnField');
    var $numberOfMinesField = $('#minesField');
    var totalNumberOfRows = $numberOfRowsField.val();
    var totalNumberOfColumns = $numberOfColumnsField.val();
    var requestedNumberOfMines = $numberOfMinesField.val();
    if ((totalNumberOfRows < 8)||(totalNumberOfRows > 40)||(totalNumberOfColumns < 8)||(totalNumberOfColumns > 30)){
      alert("Invalid minefield dimensions. Minefields must be at least 8x8 and no greater than 40x30");
    }
    else {
      if ((requestedNumberOfMines < 1) || (requestedNumberOfMines > ((totalNumberOfRows * totalNumberOfColumns)-1))){
        alert("Invalid number of Mines. Requested number of mines must be between 1 and the size of the minefield minus 1.");
      }
      else {
        createBoard(totalNumberOfRows,totalNumberOfColumns, requestedNumberOfMines); //Creates a board with 10 rows, 10 columns
        /**
        * Creates a board in the div with the given number
        * of rows and columns passed in
        * @param row Number of rows for minesweeperBoard
        * @param columns Number of columns for minesweeperBoard
        * @param mines Number of mines to be added to minesweeperBoard
        */
        function createBoard(rows, columns, mines){
          var cellIdNo = 0;
          $board.empty(); //Clear out the board, in case of restart
          $board.off(); //Remove the listeners that are on the board
          var randomCellNumbers = [];
          for (counter = 0; counter < mines; counter++){
            //This line produces a number between 0 and the size of the array -1, inclusive
            mineCell = Math.floor(Math.random() * Math.floor(rows * columns));
            randomCellNumbers.push(mineCell);
          }
          for (i = 0; i < rows; i++){
            //First create the row elements
            var $rowElement = $('<div class= "rowElement"/>');
            for (j = 0; j < columns; j++){
              const $flag = $('<img class= "redFlag" src="redFlag.jpg">');
              //Create column elements and append to each row
              var $columnElement = $('<div class= "columnElement hidden"/>');
              //Attach columnNumber and rowNumber attributes to each column div
              $columnElement.attr('data-row', i).attr('data-col', j);
              $columnElement.append($flag);
              $columnElement.attr('id', cellIdNo);
              $rowElement.append($columnElement);
              if (randomCellNumbers.includes(cellIdNo)){
                $columnElement.addClass('mine');
              }
              cellIdNo++;
            }
            $board.append($rowElement);
          }
          var $minesRemainingLabel = $('#minesRemainingLabel');
          $minesRemainingLabel.show();
          $minesRemainingLabel.text("Number of Mines Remaining: " +(requestedNumberOfMines-numberOfFlags));
          var $timerLabel = $('#timerLabel');
          $timerLabel.show();
          $timerLabel.text("Timer (seconds): " +timeCounter);
          $timer = setInterval(myTimer, 1000);
          function myTimer() {
            timeCounter++;
            $timerLabel.text("Timer (seconds): " +timeCounter);
          }

        }//Ends function createBoard(rows, columns, mines){

          /**
          * Called upon cases that end the game
          * @param wonOrLost is a boolean. True => win, False => game over
          */
          function gameEnd(wonOrLost){
            var message = null;
            //Stop the timer
            clearInterval($timer);

            if (wonOrLost){
              message = "Game won!";
              alert("Game won! Click the Create/Restart Game button to play again.");
              var $newScoreLabel = "<li class='highScore' score='x'>" +timeCounter +" seconds</li>";
              $('#leaderboardContainer').append($newScoreLabel);
              $("li[score='x']").attr("score", timeCounter);
              var unsortedItems = $('.highScore');
              var sortedItems = getSorted('li.highScore', 'score').clone();
              unsortedItems.remove();
              $('#leaderboardContainer').append(sortedItems);
            } else {
              alert("Game over. Click the Create/Restart Game button to play again.");
            }
          }


          /**
          * Reveals the content under the tile
          */
          function showContents(rowIndexI, columnIndexJ){
            //Depth-First Search to check the neighboring
            //cells for mines
            var visitedCells = {}

            //recursive function
            function cellVisit(i, j){
              //base case when hitting walls
              if (i >= totalNumberOfRows || j >= totalNumberOfColumns || i < 0 || j < 0){
                return;
              }
              var key = '${i} ${j}';
              //another base case, if we have visited this before
              if (visitedCells[key]){
                return;
              }
              const $cell = $(`.columnElement.hidden[data-row=${i}][data-col=${j}]`);
              const $flagImage = $cell.children('.redFlag');
              const mineCount = getMineCount(i,j);
              //Stop if the cell has a mine or isn't hidden
              if (!$cell.hasClass('hidden') || $cell.hasClass('mine') || (($flagImage.css('display') == 'inline'))){
                return;
              }
              //We have now seen it, so remove the hidden class
              $cell.removeClass('hidden');
              if (mineCount) {
                $cell.text(mineCount); //Set the text of the cell to the mineCount
                return;
              }
              //Look through adjacent cells
              for (let di = -1; di <=1; di++){
                for (let dj = -1; dj <=1; dj++){
                  cellVisit(i+di, j+dj);
                }
              }
              //
            }//ends function cellVisit
            var mineCount = getMineCount(rowIndexI, columnIndexJ);
            cellVisit(rowIndexI, columnIndexJ);
          }//Ends function showContents(rowIndexI, columnIndexJ){

            function getMineCount(i,j){
              let count = 0;
              //Look through adjacent cells
              for (let di = -1; di <=1; di++){
                for (let dj = -1; dj <=1; dj++){
                  var newRowIndexI = i + di;
                  var newColumnIndexJ = j+ dj;
                  //Check Boundaries
                  if (newRowIndexI >= totalNumberOfRows || newColumnIndexJ >= totalNumberOfColumns || newRowIndexI < 0 || newColumnIndexJ < 0){
                    continue;
                  }
                  //At a valid spot
                  const $cell =
                  $(`.columnElement.hidden[data-row=${newRowIndexI}][data-col=${newColumnIndexJ}]`);
                  if ($cell.hasClass('mine')){
                    count++;
                  }
                }//ends inner for loop
              }//Ends outer for loop
              return count;
            }


            $board.on('click', '.columnElement.hidden', function(e){
              var $currentCell = $(this);
              var $redFlag = $currentCell.children('.redFlag');
              var $minesRemainingLabel = $('#minesRemainingLabel');
              //Responding to marking a unit as a bomb via shift+click
              if (e.shiftKey){
                $redFlag.toggle();
                if ($redFlag.css('display') == 'inline'){
                  //That means we just added one redFlag
                  numberOfFlags++;
                  console.log("number of flags: " +numberOfFlags);
                  $minesRemainingLabel.text("Number of Mines Remaining: " +(requestedNumberOfMines-numberOfFlags));
                }
                else {
                  //That means we just removed a redFlag
                  numberOfFlags--;
                  console.log("number of flags: " +numberOfFlags);
                  $minesRemainingLabel.text("Number of Mines Remaining: " +(requestedNumberOfMines-numberOfFlags));
                }
              }
              else {
                //Makes clicking on a flagged cell do nothing
                if (($redFlag.css('display') == 'inline')){
                  return
                }
                var currentCellRow = $currentCell.data('row');
                var currentCellColumn = $currentCell.data('col');
                if ($currentCell.hasClass('mine')){
                  gameEnd(false); //passed in false, bc game has been lost
                } else { //Cell is an empty space (safe)
                  showContents(currentCellRow, currentCellColumn); //Row and column are the
                  //The game is over if the # of hidden cells left == the number of mines
                  var isGameOver = $('.columnElement.hidden').length == $('.columnElement.hidden.mine').length;
                  if (isGameOver){
                    gameEnd(true); //game has been won, so pass in true
                  }
                }
              }
            });
          } //ends the else block (indicating the minefield dims & number of mines are acceptable)
        } //ends the else block (indicating the minefield dimensions are acceptable)
      }) //Ends $($createNewGameButton).click(function(){ block

        //Sorts questions by score
        function getSorted(selector, attrName) {
          return $($(selector).toArray().sort(function(a, b){
            var aVal = parseInt(a.getAttribute(attrName)),
            bVal = parseInt(b.getAttribute(attrName));
            return aVal - bVal;
          }));
        }


      }); //Ends $(document).ready(function(){
