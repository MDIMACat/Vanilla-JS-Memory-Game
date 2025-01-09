const fixedValues = {
  classes: {
    card: "cards",
    toggled: "toggled",
    matched: "matched",
    defaultImage: "default-image",
    cardImage: "card-image",
    levelCompleteButton: ".level-complete-buttons button",
    completeContainer: ".complete-container",
    resetButton: ".reset-level-button button",
    resetDiv: ".reset-level-button",
    gridSelector: ".grid-selector",
    gridSubmitButton: "#grid-submit-button",
    rowsInput: ".grid-rows",
    colsInput: ".grid-columns",
    gameContainer: ".game-container",
    timer: "#timer",
    time: "#timer h3",
    timeComplete: "#time-complete p",
    moves: "#timer p",
    movesComplete: "#moves-complete p",
  },
  images: {
    correct: "./images/correct.png",
    fruits: [
      { id: 1, image: "./images/apple.png", alt: "Apple Image" },
      { id: 2, image: "./images/banana.png", alt: "Banana Image" },
      { id: 3, image: "./images/orange.png", alt: "Orange Image" },
      { id: 4, image: "./images/peach.png", alt: "Peach Image" },
      { id: 5, image: "./images/pineapple.png", alt: "Pineapple Image" },
      { id: 6, image: "./images/watermelon.png", alt: "Watermelon Image" },
    ],
  },
};

class MemoryGame {
  constructor() {
    this.flippedCards = [];
    this.totalCompleteCards = [];
    this.domElements = {};
    this.timer;
    this.isFirstClick = false;
    this.seconds = 0;
    this.minutes = 0;
    this.rows = 0;
    this.cols = 0;
    this.turn = 0;
  }

  initializeGame() {
    this.initializedomElements();
    this.setCards();
    this.domElements.resetDiv.style.visibility = "hidden";
    this.domElements.resetButton.disabled = true;
  }

  initializedomElements() {
    this.domElements.cards = document.querySelectorAll(
      `.${fixedValues.classes.card}`
    );
    this.domElements.restartButton = document.querySelector(
      fixedValues.classes.levelCompleteButton
    );
    this.domElements.completeGame = document.querySelector(
      fixedValues.classes.completeContainer
    );
    this.domElements.resetButton = document.querySelector(
      fixedValues.classes.resetButton
    );
    this.domElements.resetDiv = document.querySelector(
      fixedValues.classes.resetDiv
    );
    this.domElements.gridSelector = document.querySelector(
      fixedValues.classes.gridSelector
    );
    this.domElements.gridRows = document.querySelector(
      fixedValues.classes.rowsInput
    );
    this.domElements.gridCols = document.querySelector(
      fixedValues.classes.colsInput
    );
    this.domElements.gridSubmit = document.querySelector(
      fixedValues.classes.gridSubmitButton
    );
    this.domElements.gameContainer = document.querySelector(
      fixedValues.classes.gameContainer
    );
    this.domElements.timer = document.querySelector(fixedValues.classes.timer);
    this.domElements.time = document.querySelector(fixedValues.classes.time);
    this.domElements.timeCompleted = document.querySelector(
      fixedValues.classes.timeComplete
    );
    this.domElements.moves = document.querySelector(fixedValues.classes.moves);
    this.domElements.movesComplete = document.querySelector(
      fixedValues.classes.movesComplete
    );
  }

  setCards() {
    const imageArray = fixedValues.images.fruits;
    const shuffledImages = this.shuffleCards(imageArray);
    this.domElements.resetButton.disabled = true;
    this.domElements.cards.forEach((card, index) => {
      const cardImage = this.getCardImageElement(card);
      cardImage.src = shuffledImages[index].image;
      cardImage.alt = shuffledImages[index].alt;
      cardImage.dataset.id = shuffledImages[index].id;

      this.resetCard(card);
      card.addEventListener("click", this.handleCardClick.bind(this));
    });
    this.domElements.gridSubmit.addEventListener(
      "click",
      this.setGrid.bind(this)
    );
  }

  resetCard(card) {
    const defaultImage = this.getDefaultImageElement(card);
    const fruitImage = this.getCardImageElement(card);

    card.classList.remove(
      fixedValues.classes.toggled,
      fixedValues.classes.matched
    );
    defaultImage.style.display = "flex";
    fruitImage.style.display = "none";
  }

  handleCardClick(event) {
    const clickedCard = event.currentTarget;
    if (
      !clickedCard ||
      clickedCard.classList.contains(fixedValues.classes.toggled) ||
      this.flippedCards.length === 2
    ) {
      return;
    }
    this.turn += 1;
    this.domElements.moves.textContent = `Moves: ${this.turn}`;
    if (!this.isFirstClick) {
      this.isFirstClick = true;
      this.startTimer();
      this.flipCard(clickedCard);
      this.domElements.resetDiv.style.visibility = "visible";
      this.domElements.gridSelector.style.display = "none";
      this.domElements.resetButton.disabled = false;
      this.domElements.resetButton.addEventListener(
        "click",
        this.resetGame.bind(this)
      );

      if (this.flippedCards.length === 2) {
        this.checkForMatch();
      }
    } else {
      this.flipCard(clickedCard);
      this.domElements.resetDiv.style.visibility = "visible";
      this.domElements.gridSelector.style.display = "none";
      this.domElements.resetButton.disabled = false;
      this.domElements.resetButton.addEventListener(
        "click",
        this.resetGame.bind(this)
      );

      if (this.flippedCards.length === 2) {
        this.checkForMatch();
      }
    }
  }

  flipCard(card) {
    const defaultImage = this.getDefaultImageElement(card);
    const fruitImage = this.getCardImageElement(card);

    defaultImage.style.display = "none";
    fruitImage.style.display = "flex";
    card.classList.add(fixedValues.classes.toggled);
    this.flippedCards.push(card);
  }

  checkForMatch() {
    const [firstCard, secondCard] = this.flippedCards;
    const isMatch =
      this.getCardImageElement(firstCard).dataset.id ===
      this.getCardImageElement(secondCard).dataset.id;

    isMatch
      ? this.handleMatch(firstCard, secondCard)
      : this.handleNoMatch(firstCard, secondCard);
  }

  handleMatch(firstCard, secondCard) {
    setTimeout(() => {
      this.totalCompleteCards.push(firstCard.dataset.id, secondCard.dataset.id);
      this.markCardsAsMatched(firstCard, secondCard);
      this.flippedCards = [];
      if (this.totalCompleteCards.length === this.domElements.cards.length) {
        this.showGameComplete();
      }
    }, 500);
  }

  handleNoMatch(firstCard, secondCard) {
    setTimeout(() => {
      this.flipBack(firstCard);
      this.flipBack(secondCard);
      this.flippedCards = [];
    }, 1000);
  }

  markCardsAsMatched(firstCard, secondCard) {
    [firstCard, secondCard].forEach((card) => {
      card.classList.add(fixedValues.classes.matched);
      card.onclick = null;
      const cardImage = this.getCardImageElement(card);
      cardImage.src = fixedValues.images.correct;
    });
  }

  flipBack(card) {
    const defaultImage = this.getDefaultImageElement(card);
    const fruitImage = this.getCardImageElement(card);

    defaultImage.style.display = "flex";
    fruitImage.style.display = "none";
    card.classList.remove(fixedValues.classes.toggled);
  }

  showGameComplete() {
    this.domElements.completeGame.style.display = "flex";
    this.domElements.resetDiv.style.visibility = "hidden";
    const [minutes, seconds] = this.endTimer();
    this.isFirstClick = false;
    if (minutes) {
      this.domElements.timeCompleted.textContent = `Time: ${String(
        minutes
      )} minute(s) and ${String(seconds)} second(s)`;
      this.domElements.movesComplete.textContent = `Total Moves: ${this.turn}`;
    } else {
      this.domElements.timeCompleted.textContent = `Time: ${String(
        seconds
      )} second(s)`;
      this.domElements.movesComplete.textContent = `Total Moves: ${this.turn}`;
    }

    this.domElements.restartButton.addEventListener(
      "click",
      this.resetGame.bind(this)
    );
  }

  resetGame() {
    this.flippedCards = [];
    this.totalCompleteCards = [];
    this.endTimer();
    this.isFirstClick = false;
    this.domElements.moves.textContent = `Moves: 0`;
    this.turn = 0;
    this.domElements.resetDiv.style.visibility = "hidden";
    this.domElements.completeGame.style.display = "none";
    this.domElements.gridSelector.style.display = "flex";
    this.domElements.gridRows.value = "";
    this.domElements.gridCols.value = "";

    if (this.rows && this.cols) {
      this.domElements.moves.textContent = `Moves: 0`;
      this.turn = 0;
      this.setGrid();
    } else {
      this.domElements.cards.forEach((card) => this.resetCard(card));
      this.setCards();
    }
  }

  getDefaultImageElement(card) {
    return card.querySelector(`.${fixedValues.classes.defaultImage}`);
  }

  getCardImageElement(card) {
    return card.querySelector(`.${fixedValues.classes.cardImage}`);
  }

  shuffleCards(array) {
    const duplicatedArray = [...array, ...array];

    for (let i = duplicatedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicatedArray[i], duplicatedArray[j]] = [
        duplicatedArray[j],
        duplicatedArray[i],
      ];
    }

    return duplicatedArray;
  }

  showErrorMessage(message) {
    let errorElement = document.querySelector("#error-message");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.id = "error-message";
      errorElement.style.color = "white";
      errorElement.style.fontSize = "medium";
      errorElement.style.display = "none";
      this.domElements.gridSelector.appendChild(errorElement);
    }

    const pTag = errorElement.querySelector("p") || document.createElement("p");
    pTag.textContent = message;
    errorElement.appendChild(pTag);
    errorElement.style.display = "block";

    setTimeout(() => {
      errorElement.style.display = "none";
    }, 4000);
  }

  gridValue() {
    let inputRow = Number(this.domElements.gridRows.value);
    let inputCols = Number(this.domElements.gridCols.value);
    if (inputRow || inputCols) {
      this.rows = inputRow;
      this.cols = inputCols;
    }
  }

  setGrid() {
    this.gridValue();
    if (this.rows < 1 || this.cols < 1 || !this.rows || !this.cols) {
      this.showErrorMessage("Error: Please enter a value in both input places");
      return;
    }

    this.newGrid();
  }

  newGrid() {
    const totalCards = this.rows * this.cols;
    if (totalCards % 2 !== 0) {
      this.showErrorMessage(
        "Error: Please enter values that result in an even number of cards."
      );
      return;
    }

    this.domElements.gameContainer.style.display = "grid";
    this.domElements.gameContainer.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    this.domElements.gameContainer.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.domElements.gameContainer.style.gap = "10px";

    const currentCards = this.domElements.cards.length;

    if (totalCards > currentCards) {
      let cardsToAdd = totalCards - currentCards;
      for (let i = 0; i < cardsToAdd; i++) {
        let clonedCard =
          this.domElements.cards[i % currentCards].cloneNode(true);
        this.domElements.gameContainer.appendChild(clonedCard);
      }
    } else if (totalCards < currentCards) {
      for (let i = currentCards - 1; i >= totalCards; i--) {
        this.domElements.gameContainer.removeChild(this.domElements.cards[i]);
      }
    }

    this.domElements.cards = document.querySelectorAll(
      `.${fixedValues.classes.card}`
    );

    const newLength = totalCards / 2;
    let shuffledImages = this.shuffleCards(
      fixedValues.images.fruits.slice(0, newLength)
    );

    this.domElements.cards.forEach((card, index) => {
      const cardImage = this.getCardImageElement(card);
      cardImage.src = shuffledImages[index].image;
      cardImage.alt = shuffledImages[index].alt;
      cardImage.dataset.id = shuffledImages[index].id;

      this.resetCard(card);
      card.addEventListener("click", this.handleCardClick.bind(this));
    });

    this.flippedCards = [];
    this.totalCompleteCards = [];
    this.domElements.resetButton.disabled = true;
    this.domElements.resetDiv.style.visibility = "hidden";
    this.domElements.gridSelector.style.display = "flex";
    this.domElements.gridRows.value = "";
    this.domElements.gridCols.value = "";
    this.domElements.gridSubmit.addEventListener(
      "click",
      this.setGrid.bind(this)
    );
    this.domElements.resetButton.addEventListener(
      "click",
      this.resetGame.bind(this)
    );
  }

  startTimer() {
    let totalSecond = 0;

    this.timer = setInterval(() => {
      totalSecond++;

      this.seconds = totalSecond % 60;
      this.minutes = Math.floor(totalSecond / 60);

      this.domElements.time.textContent = `Timer: ${String(
        this.minutes
      ).padStart(2, "0")}:${String(this.seconds).padStart(2, "0")}`;
    }, 1000);
  }

  endTimer() {
    clearInterval(this.timer);
    this.domElements.time.textContent = "Timer: 00:00";
    const finalMins = this.minutes;
    const finalSecs = this.seconds;
    return [finalMins, finalSecs];
  }
}

if (typeof document !== "undefined") {
  const memoryGame = new MemoryGame();
  memoryGame.initializeGame();
}

module.exports = { MemoryGame, fixedValues };
