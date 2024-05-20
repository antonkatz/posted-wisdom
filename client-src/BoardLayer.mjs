import {group, hinj} from "../hinjs/hinj.mjs";
import {Tile} from "./Tile.mjs";
import {drawBorders, Positioner} from "./Positioner.mjs";
import {Board} from "./Board.mjs";

export const BoardLayer = group(null, {
  centerTile: hinj()
      .sync((T, tile) => {
        const p = Positioner(tile)
        Positioner.layer(p, T)
        Positioner.isCenter(p, true)
        BoardLayer.current(T, p)
      }),

  offsetCenterY: hinj('50vh'),
  offsetCenterX: hinj('50vw'),
  current: hinj()
      // .sync((T, t) => console.log('Laying tile', t))
      .sync((T, p) => positionTile(p))
      .sync((T, p) => BoardLayer.drawnTileIds(T).add(Tile.id(p)))
      .sync((T, p) => BoardLayer.positioners(T).add(p))
      // .sync(layoutTile)
      .sync(nextTiles),

  isComplete: hinj()
      .sync(linkBorderTiles) // todo. sould it only run once
      .sync((T,p) => Array.from(BoardLayer.positioners(T)).forEach(p => drawBorders(p, null))),

  drawnTileIds: hinj(() => new Set()),
  positioners: hinj(() => new Set()),
})

export function positionTile(T) {
  const d = Tile.dom(T)
  d.style.top = `calc(${BoardLayer.offsetCenterY(Positioner.layer(T))} + (${Positioner.y(T)}em))`
  d.style.left = `calc(${BoardLayer.offsetCenterX(Positioner.layer(T))} + (${Positioner.x(T)}em))`
}

function nextTiles(T, currentPositioner) {
  let complete = true
  // const next = [Tile.right(tile), Tile.bottom(tile)]

  if (Tile.subtiles(currentPositioner).length) {
    const l = BoardLayer(T)
    const ts = Tile.subtiles(currentPositioner)
    debugger
    BoardLayer.centerTile(l, ts[0])
  }

  const r = Tile.right(currentPositioner)
  if (r && !BoardLayer.drawnTileIds(T).has(Tile.id(r))) {
    complete = false
    const p = Positioner(r)
    Positioner.layer(p, T)

    Positioner.offsetTileLeft(p, currentPositioner)
    Positioner.offsetTileRight(currentPositioner, p)
    BoardLayer.current(T, p)
  }
  const b = Tile.bottom(currentPositioner)
  if (b && !BoardLayer.drawnTileIds(T).has(Tile.id(b))) {
    complete = false

    const p = Positioner(b)
    Positioner.layer(p, T)
    Positioner.offsetTileTop(p, currentPositioner)
    Positioner.offsetTileBottom(currentPositioner, p)

    BoardLayer.current(T, p)
  }

  const l = Tile.left(currentPositioner)
  if (l && !BoardLayer.drawnTileIds(T).has(Tile.id(l))) {
    complete = false

    const p = Positioner(l)
    Positioner.layer(p, T)
    Positioner.offsetTileRight(p, currentPositioner)
    Positioner.offsetTileLeft(currentPositioner, p)

    BoardLayer.current(T, p)
  }
  const t = Tile.top(currentPositioner)
  if (t && !BoardLayer.drawnTileIds(T).has(Tile.id(t))) {
    complete = false

    const p = Positioner(t)
    Positioner.layer(p, T)
    Positioner.offsetTileBottom(p, currentPositioner)
    Positioner.offsetTileTop(currentPositioner, p)

    BoardLayer.current(T, p)
  }

  if (complete) BoardLayer.isComplete(T, true)
}

function linkBorderTiles(T) {
  const positioners = Array.from(BoardLayer.positioners(T))
  positioners.forEach(p => {
    if (!Positioner.offsetTileTop(p)) {
      const op = positioners.find(_ => {
        const xe = (Positioner.x(_) <= Positioner.x(p)) && (Positioner.x(_) + Tile.widthEm(_) >= Positioner.x(p))
        const ye = (Positioner.y(_) + Tile.heightEm(_)) == Positioner.y(p)

        if (Tile.id(p) == 2 && Tile.id(_) == 4) {
          console.log(Positioner.y(_) + Tile.heightEm(_), (Positioner.y(p)))
          console.log(Positioner.x(_) , Positioner.x(p), Positioner.x(_) + Tile.widthEm(_))
          console.log(ye, xe)
          console.log('===')
        }
        return xe && ye
      })
      if (op) {
        // if (Tile.id(p) == 4) {
        //   console.log(Tile.id(op), Positioner.y(op), Positioner.y(p))
        //   debugger
        // }
        Positioner.borderingTilesTop(p, [...Positioner.borderingTilesTop(p), op])
      }
    }
  })
}