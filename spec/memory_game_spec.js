const path = require("path");
const jsdom = require("jsdom");
const fs = require("fs");
const htmlFilePath = path.resolve(__dirname, "../index.html");
const htmlFileContent = fs.readFileSync(htmlFilePath, "utf-8");

const { MemoryGame, fixedValues } = require("../src/memory_game_script");
const exp = require("constants");

describe("Memory Game UI", () => {
  let firstCard,
    secondCard,
    memoryGame,
    domElements,
    resetButton,
    resetDiv,
    cards;

  beforeEach(() => {
    const { JSDOM } = jsdom;
    const { document } = new JSDOM(htmlFileContent).window;
    global.document = document;

    spyOn(MemoryGame.prototype, "setCards").and.callThrough();
    spyOn(MemoryGame.prototype, "flipCard").and.callThrough();
    spyOn(MemoryGame.prototype, "resetGame").and.callThrough();
    spyOn(MemoryGame.prototype, "showGameComplete").and.callThrough();
    spyOn(MemoryGame.prototype, "flipBack").and.callThrough();
    spyOn(MemoryGame.prototype, "markCardsAsMatched").and.callThrough();
    spyOn(MemoryGame.prototype, "handleNoMatch").and.callThrough();
    spyOn(MemoryGame.prototype, "handleMatch").and.callThrough();
    spyOn(MemoryGame.prototype, "checkForMatch").and.callThrough();
    spyOn(MemoryGame.prototype, "resetCard").and.callThrough();
    spyOn(MemoryGame.prototype, "handleCardClick").and.callThrough();
    spyOn(MemoryGame.prototype, "setGrid").and.callThrough();
    spyOn(MemoryGame.prototype, "newGrid").and.callThrough();
    spyOn(MemoryGame.prototype, "showErrorMessage").and.callThrough();
    spyOn(MemoryGame.prototype, "startTimer").and.callThrough();
    spyOn(MemoryGame.prototype, "endTimer").and.callThrough();

    jasmine.clock().install();
    memoryGame = new MemoryGame();

    memoryGame.initializeGame();

    domElements = memoryGame.domElements;
    resetButton = domElements.resetButton;
    restartButton = domElements.restartButton;
    resetDiv = domElements.resetDiv;
    cards = domElements.cards;

    firstCard = cards[0];
    secondCard = cards[1];
  });

  afterEach(() => {
    memoryGame.resetGame();
    MemoryGame.prototype.setCards.calls.reset();
    MemoryGame.prototype.flipCard.calls.reset();
    MemoryGame.prototype.resetGame.calls.reset();
    MemoryGame.prototype.showGameComplete.calls.reset();
    MemoryGame.prototype.flipBack.calls.reset();
    MemoryGame.prototype.markCardsAsMatched.calls.reset();
    MemoryGame.prototype.handleNoMatch.calls.reset();
    MemoryGame.prototype.handleMatch.calls.reset();
    MemoryGame.prototype.checkForMatch.calls.reset();
    MemoryGame.prototype.resetCard.calls.reset();
    MemoryGame.prototype.handleCardClick.calls.reset();
    MemoryGame.prototype.setGrid.calls.reset();
    MemoryGame.prototype.newGrid.calls.reset();
    MemoryGame.prototype.showErrorMessage.calls.reset();
    MemoryGame.prototype.startTimer.calls.reset();
    MemoryGame.prototype.endTimer.calls.reset();
    jasmine.clock().uninstall();
  });

  describe("Onload", () => {
    it("should initialize all game elements", () => {
      cards.forEach((card) => {
        const img = card.querySelector(`.${fixedValues.classes.cardImage}`);
        expect(img.src).not.toBe("");
        expect(img.alt).not.toBe("");
        expect(img.dataset.id).not.toBe("");
      });
      expect(MemoryGame.prototype.setCards).toHaveBeenCalled();
      expect(MemoryGame.prototype.resetCard).toHaveBeenCalled();
    });
  });

  describe("Card flipping functionality", () => {
    it("should flip a card and reveal the fruit image when clicked", () => {
      const defaultImage = memoryGame.getDefaultImageElement(firstCard);
      const fruitImage = memoryGame.getCardImageElement(firstCard);

      expect(firstCard.classList.contains(fixedValues.classes.toggled)).toBe(
        false
      );
      expect(defaultImage.style.display).toBe("flex");
      expect(fruitImage.style.display).toBe("none");

      firstCard.click();

      expect(firstCard.classList.contains(fixedValues.classes.toggled)).toBe(
        true
      );
      expect(defaultImage.style.display).toBe("none");
      expect(fruitImage.style.display).toBe("flex");
      expect(MemoryGame.prototype.handleCardClick).toHaveBeenCalled();
      expect(MemoryGame.prototype.flipCard).toHaveBeenCalled();
    });
  });

  describe("Matching cards functionality", () => {
    it("should mark two cards as matched if they have the same image ID", () => {
      const firstCardImage = memoryGame.getCardImageElement(firstCard);
      const secondCardImage = memoryGame.getCardImageElement(secondCard);

      expect(firstCard.classList.contains(fixedValues.classes.matched)).toBe(
        false
      );
      expect(secondCard.classList.contains(fixedValues.classes.matched)).toBe(
        false
      );

      firstCardImage.dataset.id = "1";
      secondCardImage.dataset.id = "1";

      firstCard.click();
      secondCard.click();

      jasmine.clock().tick(500);
      expect(firstCard.classList.contains(fixedValues.classes.matched)).toBe(
        true
      );
      expect(secondCard.classList.contains(fixedValues.classes.matched)).toBe(
        true
      );
      expect(MemoryGame.prototype.handleCardClick).toHaveBeenCalled();
      expect(MemoryGame.prototype.flipCard).toHaveBeenCalled();
      expect(MemoryGame.prototype.checkForMatch).toHaveBeenCalled();
      expect(MemoryGame.prototype.handleMatch).toHaveBeenCalled();
      expect(MemoryGame.prototype.markCardsAsMatched).toHaveBeenCalled();
    });
  });

  describe("Non-matching cards functionality", () => {
    it("should mark two cards as unmatched if they have different image IDs", () => {
      const firstCardImage = memoryGame.getCardImageElement(firstCard);
      const secondCardImage = memoryGame.getCardImageElement(secondCard);

      firstCardImage.dataset.id = "1";
      secondCardImage.dataset.id = "2";

      firstCard.click();
      expect(firstCard.classList.contains(fixedValues.classes.toggled)).toBe(
        true
      );
      secondCard.click();

      jasmine.clock().tick(1000);
      expect(firstCard.classList.contains(fixedValues.classes.toggled)).toBe(
        false
      );
      expect(MemoryGame.prototype.handleCardClick).toHaveBeenCalled();
      expect(MemoryGame.prototype.flipCard).toHaveBeenCalled();
      expect(MemoryGame.prototype.checkForMatch).toHaveBeenCalled();
      expect(MemoryGame.prototype.flipBack).toHaveBeenCalled();
      expect(MemoryGame.prototype.handleNoMatch).toHaveBeenCalled();
    });
  });

  describe("Game reset functionality", () => {
    it("should show that the reset button is disabled before the first click", () => {
      expect(resetButton.disabled).toBe(true);
      firstCard.click();
      expect(resetButton.disabled).toBe(false);
    });

    it("should show the reset div when the first card is clicked", () => {
      expect(resetDiv.style.visibility).toBe("hidden");
      firstCard.click();
      expect(resetDiv.style.visibility).toBe("visible");
    });

    it("should reset the game when the reset button has been clicked", () => {
      firstCard.click();
      resetButton.click();

      domElements.cards.forEach((card) => {
        expect(card.classList.contains(fixedValues.classes.toggled)).toBe(
          false
        );
        expect(card.classList.contains(fixedValues.classes.matched)).toBe(
          false
        );

        const defaultImage = memoryGame.getDefaultImageElement(card);
        const fruitImage = memoryGame.getCardImageElement(card);

        expect(defaultImage.style.display).toBe("flex");
        expect(fruitImage.style.display).toBe("none");
      });
      expect(resetDiv.style.visibility).toBe("hidden");
      expect(MemoryGame.prototype.resetGame).toHaveBeenCalled();
      expect(MemoryGame.prototype.resetCard).toHaveBeenCalled();
      expect(MemoryGame.prototype.setCards).toHaveBeenCalled();
    });
  });

  describe("Game completion", () => {
    it("should display the game complete container when all cards are matched", () => {
      for (let i = 0; i < cards.length; i += 2) {
        const firstCard = cards[i];
        const secondCard = cards[i + 1];

        memoryGame.getCardImageElement(firstCard).dataset.id = (
          i / 2
        ).toString();
        memoryGame.getCardImageElement(secondCard).dataset.id = (
          i / 2
        ).toString();

        firstCard.click();
        secondCard.click();

        jasmine.clock().tick(500);
      }

      expect(domElements.completeGame.style.display).toBe("flex");
      restartButton.click();
      expect(MemoryGame.prototype.showGameComplete).toHaveBeenCalled();
      expect(MemoryGame.prototype.resetGame).toHaveBeenCalled();
    });
  });

  describe("Grid setup and resizing", () => {
    it("should show an error message when grid dimensions result in an odd number of cards", () => {
      domElements.gridRows.value = 3;
      domElements.gridCols.value = 3;

      domElements.gridSubmit.click();

      expect(MemoryGame.prototype.showErrorMessage).toHaveBeenCalledWith(
        "Error: Please enter values that result in an even number of cards."
      );
    });

    it("should show error message when only one grid dimension is entered", () => {
      domElements.gridRows.value = 3;

      domElements.gridSubmit.click();

      expect(MemoryGame.prototype.showErrorMessage).toHaveBeenCalledWith(
        "Error: Please enter a value in both input places"
      );
    });

    it("should successfully set the grid when dimensions result in an even number of cards", () => {
      domElements.gridRows.value = 2;
      domElements.gridCols.value = 4;

      domElements.gridSubmit.click();

      expect(domElements.gameContainer.style.gridTemplateRows).toBe(
        "repeat(2, 1fr)"
      );
      expect(domElements.gameContainer.style.gridTemplateColumns).toBe(
        "repeat(4, 1fr)"
      );
    });

    it("should maintain the same grid after clicking the reset button", () => {
      domElements.gridRows.value = 2;
      domElements.gridCols.value = 4;
      domElements.gridSubmit.click();

      domElements.resetButton.click();

      expect(domElements.gameContainer.style.gridTemplateRows).toBe(
        "repeat(2, 1fr)"
      );
      expect(domElements.gameContainer.style.gridTemplateColumns).toBe(
        "repeat(4, 1fr)"
      );
      expect(domElements.cards.length).toBeGreaterThan(0);
    });
  });

  describe("Timer Logic", () => {
    it("should start timer after the first click on a card", async () => {
      expect(domElements.time.textContent).toBe("Timer: 00:00");
      firstCard.click();
      jasmine.clock().tick(5000);
      expect(domElements.time.textContent).toMatch(/^Timer: 00:(\d+)(\d+)$/);
      expect(MemoryGame.prototype.startTimer).toHaveBeenCalled();
    });

    it("should start timer after the first click and then reset timer if reset button in clicked", () => {
      firstCard.click();
      jasmine.clock().tick(5000);
      expect(domElements.time.textContent).toMatch(/^Timer: 00:(\d+)(\d+)$/);
      resetButton.click();
      expect(domElements.time.textContent).toBe("Timer: 00:00");
    });

    it("should end the timer after the final click and display final time in game complete", () => {
      for (let i = 0; i < cards.length; i += 2) {
        const firstCard = cards[i];
        const secondCard = cards[i + 1];

        memoryGame.getCardImageElement(firstCard).dataset.id = (
          i / 2
        ).toString();
        memoryGame.getCardImageElement(secondCard).dataset.id = (
          i / 2
        ).toString();

        firstCard.click();
        secondCard.click();

        jasmine.clock().tick(500);
      }
      expect(domElements.completeGame.style.display).toBe("flex");
      expect(domElements.timeCompleted.textContent).toMatch(
        /^Time: (\d+) minute\(s\) and (\d+) second\(s\)$|^Time: (\d+) second\(s\)$/
      );
      expect(MemoryGame.prototype.endTimer).toHaveBeenCalled();
    });

    it("should display the game complete container and reset the timer after restart button is clicked", () => {
      for (let i = 0; i < cards.length; i += 2) {
        const firstCard = cards[i];
        const secondCard = cards[i + 1];

        memoryGame.getCardImageElement(firstCard).dataset.id = (
          i / 2
        ).toString();
        memoryGame.getCardImageElement(secondCard).dataset.id = (
          i / 2
        ).toString();

        firstCard.click();
        secondCard.click();

        jasmine.clock().tick(500);
      }

      expect(domElements.completeGame.style.display).toBe("flex");
      restartButton.click();
      expect(domElements.time.textContent).toBe("Timer: 00:00");
    });
  });

  describe("Moves Logic", () => {
    it("should increase moves count after two card flips", () => {
      expect(domElements.moves.textContent).toBe("Moves: 0");
      firstCard.click();
      expect(domElements.moves.textContent).toBe("Moves: 1");
      secondCard.click();
      expect(domElements.moves.textContent).toBe("Moves: 2");
    });

    it("should reset the moves after the reset buton has been clicked", () => {
      firstCard.click();
      secondCard.click();
      expect(domElements.moves.textContent).toBe("Moves: 2");
      resetButton.click();
      expect(domElements.moves.textContent).toBe("Moves: 0");
    });

    it("should display the total moves in the complete pop when done", () => {
      for (let i = 0; i < cards.length; i += 2) {
        const firstCard = cards[i];
        const secondCard = cards[i + 1];

        memoryGame.getCardImageElement(firstCard).dataset.id = (
          i / 2
        ).toString();
        memoryGame.getCardImageElement(secondCard).dataset.id = (
          i / 2
        ).toString();

        firstCard.click();
        secondCard.click();

        jasmine.clock().tick(500);
      }

      expect(domElements.completeGame.style.display).toBe("flex");
      expect(domElements.movesComplete.textContent).toMatch(
        /^Total Moves: (\d+)$/
      );
    });

    it("should reset the moves after the restart button is click", () => {
      for (let i = 0; i < cards.length; i += 2) {
        const firstCard = cards[i];
        const secondCard = cards[i + 1];

        memoryGame.getCardImageElement(firstCard).dataset.id = (
          i / 2
        ).toString();
        memoryGame.getCardImageElement(secondCard).dataset.id = (
          i / 2
        ).toString();

        firstCard.click();
        secondCard.click();

        jasmine.clock().tick(500);
      }

      expect(domElements.completeGame.style.display).toBe("flex")
      restartButton.click()
      expect(domElements.moves.textContent).toBe("Moves: 0");
    })
  });
});
