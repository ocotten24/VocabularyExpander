import React, { Component } from 'react';

class WordGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      highScore: 0,
      lives: 3,
      randomWord: '',
      definition: '',
      wordOptions: [],
      buttonsDisabled: false,
      gameOver: false,
    };
  }

  componentDidMount() {
    this.resetGame();
  }

  async wordGame() {
    if (this.state.lives <= 0) {
      this.setState({ gameOver: true });
      return;
    }

    let hasDefinition = false;

    this.setState({ buttonsDisabled: false });

    while (!hasDefinition && this.state.lives > 0) {
      const wordURL = 'https://random-word-api.herokuapp.com/word?number=4';

      try {
        const wordResponse = await fetch(wordURL);
        const wordJSON = await wordResponse.json();
        const wordOptions = wordJSON.map((word) => ({ value: word, disabled: false }));
        const randomWord = wordOptions[Math.floor(Math.random() * 4)].value;
        console.log(randomWord)

        let dictionaryURL = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + randomWord;
        const WordDefinitionResponse = await fetch(dictionaryURL);
        const definitionJSON = await WordDefinitionResponse.json();

        if (definitionJSON.length > 0) {
          const wordInfoArray = definitionJSON[0].meanings[0];
          const firstDefinition = wordInfoArray.definitions[0].definition;

          hasDefinition = true;

          this.setState({
            definition: firstDefinition,
            randomWord: randomWord,
            wordOptions: wordOptions,
            buttonsDisabled: false,
          });
        }
      } catch (error) {
        console.error('no definition for word. rerolling...');
      }
    }
  }

  buttonClick(word) {
    if (this.state.lives <= 0) return;

    if (word === this.state.randomWord) {
      this.setState((prevState) => {
        const newScore = prevState.score + 1;
        const newHighScore = Math.max(prevState.highScore, newScore);
        return { score: newScore, highScore: newHighScore };
      });

      const updatedWordOptions = this.state.wordOptions.map((option) => ({
        value: option.value,
        disabled: true,
      }));
      this.setState({ wordOptions: updatedWordOptions, buttonsDisabled: true });

      setTimeout(() => {
        this.wordGame();
      }, 1000);
    } else {
      this.setState((prevState) => ({ lives: prevState.lives - 1 }));
      const allButtonsDisabled = this.state.wordOptions.every((option) => option.disabled);
      if (allButtonsDisabled) {
        this.wordGame();
      }
    }
  }

  resetGame() {
    this.setState(
      {
        score: 0,
        highScore: this.state.highScore,
        lives: 3,
        gameOver: false,
        buttonsDisabled: false,
        wordOptions: [],
        definition: '',
      },
      () => {
        this.wordGame();
      }
    );
  }

  render() {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      if (i >= this.state.lives) {
        hearts.push(<img key={i} className="heart" src="./images/empty.png" alt="Empty Heart" />);
      } else {
        hearts.push(<img key={i} className="heart" src="./images/full.png" alt="Full Heart" />);
      }
    }

    const wordButtons = this.state.wordOptions.map((word, index) => (
      <button
        key={index}
        onClick={() => this.buttonClick(word.value)}
        disabled={this.state.lives <= 0 || this.state.buttonsDisabled || word.disabled}
        className={`wordButton ${this.state.lives <= 0 ? 'hidden' : ''}`}
      >
        {word.value}
      </button>
    ));
    
    return (
      <div>
        <h1 className='title'>Vocabulary Expander</h1>
        <p className="score">High Score: {this.state.highScore}</p>
        <p className="score">Score: {this.state.score}</p>
        <div className="lives">{hearts}</div>
        <br /><br />
        {this.state.gameOver || this.state.lives <= 0 ? (
          <div>
            <p className="definition">Game Over</p>
            <button className="resetButton" onClick={() => this.resetGame()}>Reset Game</button>
          </div>
        ) : (
          <p className="definition">{this.state.definition}</p>
        )}
        <br/><br/><br/><br/>
        {this.state.gameOver || this.state.lives <= 0 ? null : (
  <div className='wordButtons'>
    {wordButtons}
  </div>
)}

      </div>
    );
    
  }
}

export default WordGame;
