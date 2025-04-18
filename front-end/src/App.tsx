import React from 'react';
import './App.css';
import { GameState, Cell } from './game';
import BoardCell from './Cell';

/**
 * Define the type of the props field for a React component
 */
interface Props {}

/**
 * Using generics to specify the type of props and state.
 * props and state are special fields in a React component.
 * React will keep track of the value of props and state.
 * Any time there's a change to their values, React will automatically update (not fully re-render) the HTML needed.
 * 
 * props and state are similar in the sense that they manage the data of this component. A change to their values will
 * cause the view (HTML) to change accordingly.
 * 
 * Usually, props is passed and changed by the parent component; state is the internal value of the component and managed by
 * the component itself.
 */
class App extends React.Component<Props, GameState> {
  private initialized: boolean = false;

  /**
   * @param props has type Props
   */
  constructor(props: Props) {
    super(props);
    /**
     * state has type GameState as specified in the class inheritance.
     */
    this.state = { cells: [], instructions: '' };
  }

  /**
   * Use an arrow function, i.e., () => {} to create an async function.
   * Otherwise, 'this' would become undefined in runtime. This is
   * just an issue of Javascript.
   */
  newGame = async () => {
    try {
      const response = await fetch('/newgame', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to start a new game');
      }
      const json = await response.json();
      this.setState({ cells: json['cells'], instructions: json['instructions'] });
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  undo = async () => {
    try {
      const response = await fetch('/undo', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to undo move');
      }
      const json = await response.json();
      this.setState({ cells: json['cells'], instructions: json['instructions'] });
    } catch (error) {
      console.error('Error undoing move:', error);
    }
  };

  /**
   * play will generate an anonymous function that the component
   * can bind with.
   * @param x 
   * @param y 
   * @returns 
   */
  play(x: number, y: number): React.MouseEventHandler {
    return async (e) => {
      // prevent the default behavior on clicking a link; otherwise, it will jump to a new page.
      e.preventDefault();
      try {
        const response = await fetch(`/play?x=${x}&y=${y}`, { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to make a move');
        }
        const json = await response.json();
        this.setState({ cells: json['cells'], instructions: json['instructions'] });
      } catch (error) {
        console.error('Error making a move:', error);
      }
    };
  }

  createCell(cell: Cell, index: number): React.ReactNode {
    if (cell.playable)
      /**
       * key is used for React when given a list of items. It
       * helps React to keep track of the list items and decide
       * which list item needs to be updated.
       * @see https://reactjs.org/docs/lists-and-keys.html#keys
       */
      return (
        <div key={index}>
          <a href='/' onClick={this.play(cell.x, cell.y)}>
            <BoardCell cell={cell}></BoardCell>
          </a>
        </div>
      );
    else
      return (
        <div key={index}>
          <BoardCell cell={cell}></BoardCell>
        </div>
      );
  }

  /**
   * This function will call after the HTML is rendered.
   * We update the initial state by creating a new game.
   * @see https://reactjs.org/docs/react-component.html#componentdidmount
   */
  componentDidMount(): void {
    /**
     * setState in DidMount() will cause it to render twice which may cause
     * this function to be invoked twice. Use initialized to avoid that.
     */
    if (!this.initialized) {
      this.newGame();
      this.initialized = true;
    }
  }

  /**
   * The only method you must define in a React.Component subclass.
   * @returns the React element via JSX.
   * @see https://reactjs.org/docs/react-component.html
   */
  render(): React.ReactNode {
    /**
     * We use JSX to define the template. An advantage of JSX is that you
     * can treat HTML elements as code.
     * @see https://reactjs.org/docs/introducing-jsx.html
     */
    return (
      <div>
        <div id="instructions">{this.state.instructions}</div>
        <div id="board">
          {this.state.cells.map((cell, i) => this.createCell(cell, i))}
        </div>
        <div id="bottombar">
          <button onClick={this.newGame}>New Game</button>
          <button onClick={this.undo}>Undo</button>
        </div>
      </div>
    );
  }
}

export default App;