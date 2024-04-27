import {enter, hinj} from "../hinjs/hinj.mjs";
import {Board} from "./Board.mjs";

export const Tile = enter(null,{
  dom: hinj()
      .sync(detectActiveStatus)
      .sync(T => Tile.id(T, Tile.dom(T).id.replace('tile_', '')))
      .sync(readSize),
  aspectRatio: hinj('12:5'),
  widthEm: hinj(12)
      .sync(T => Tile.dom(T).style.width = `${Tile.widthEm(T)}em`),
  heightEm: hinj(5)
      .sync(T => Tile.dom(T).style.height = `${Tile.heightEm(T)}em`),


  id: hinj()
      .sync(T => Tile.dom(T).append(Tile.id(T))),
  isActive: hinj()
      .sync(T => {
        if (Tile.isActive(T)) {
          Board.activeTile(T, T)
        }
      }),

  right: hinj()
      .sync((T,r) => console.log('R', r)),
  bottom: hinj()
      .sync((T,r) => console.log('B', r)),

})

function detectActiveStatus(T) {
  const s = Tile.dom(T).classList.contains('active')
  Tile.isActive(T, s)
}

function readSize(T) {
  const ar = Tile.dom(T).dataset.aspectRatio
  if (ar) {
    const [w, h] = ar.split(':')
    const r = w / h

    Tile.widthEm(T, 5 * r)
    Tile.heightEm(T, 5)
  }

}