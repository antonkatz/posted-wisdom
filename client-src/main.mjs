// alert("hello")

import {Board} from "./Board.mjs";

const bDom = document.querySelector('#board')

if (bDom) {
  const b = Board()
  Board.dom(b, bDom)
}