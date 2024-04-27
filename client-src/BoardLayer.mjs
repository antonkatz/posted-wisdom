import {enter, hinj} from "../hinjs/hinj.mjs";
import {Tile} from "./Tile.mjs";

let defaultBorder = '2px solid crimson';
const Positioner = enter(null, {
  // tile: hinj(),
  offsetTileLeft: hinj()
      .sync((T, ot) => {
        const x = Positioner.x(ot) + Tile.widthEm(ot)
        console.log('x', Tile.id(T), x)
        Positioner.x(T, x)
        Positioner.y(T, Positioner.y(ot))
      })
      .sync((T, ot) => {
        Positioner.borderLeft(T, '0px')
      }),
  offsetTileRight: hinj()
      .sync((T, ot) => {
        Positioner.borderRight(T, '0px')
      }),
  offsetTileBottom: hinj()
      .sync((T, ot) => {
        Positioner.borderBottom(T, '0px')
      }),
  offsetTileTop: hinj()
      .sync((T, ot) => {
        const y = Positioner.y(ot) + Tile.heightEm(ot)
        console.log('y', Tile.id(T), y)
        Positioner.y(T, y)
        Positioner.x(T, Positioner.x(ot))
      })
      .sync((T, ot) => {
        Positioner.borderTop(T, '0px')
      }),

  borderLeft: hinj(defaultBorder),
  borderRight: hinj(defaultBorder),
  borderTop: hinj(defaultBorder),
  borderBottom: hinj(defaultBorder),

  isCenter: hinj(false),
  // .sync(positionTile),

  x: hinj(T => Tile.widthEm(T) / 2 * -1),
  // .sync(positionTile),
  y: hinj(T => Tile.heightEm(T) / 2 * -1),
  // .sync(positionTile),
})
export const BoardLayer = enter(null, {
  centerTile: hinj()
      .sync((T, tile) => {
        const p = Positioner(tile)
        Positioner.isCenter(p, true)
        BoardLayer.current(T, p)
      }),

  current: hinj()
      .sync((T, t) => console.log('Laying tile', t))
      .sync((T, p) => positionTile(p))
      .sync((T, p) => BoardLayer.present(T).add(Tile.id(p)))
      // .sync(layoutTile)
      .sync(nextTiles)
      .sync((T,p) => drawBorders(p, null)),

  present: hinj(() => new Set())
})

const drawBorders = hinj()
    .sync(T => {
      const dom = Tile.dom(T)
      dom.style.borderLeft = Positioner.borderLeft(T)
      dom.style.borderBottom = Positioner.borderBottom(T)
      dom.style.borderRight = Positioner.borderRight(T)
      dom.style.borderTop = Positioner.borderTop(T)
    })

function positionTile(T) {
  const d = Tile.dom(T)
  d.style.top = `calc(50vh + (${Positioner.y(T)}em))`
  d.style.left = `calc(50vw + (${Positioner.x(T)}em))`
}

function nextTiles(T, currentPositioner) {
  // const next = [Tile.right(tile), Tile.bottom(tile)]
  const r = Tile.right(currentPositioner)
  if (r && !BoardLayer.present(T).has(Tile.id(r))) {
    const p = Positioner(r)
    Positioner.offsetTileLeft(p, currentPositioner)
    Positioner.offsetTileRight(currentPositioner, p)
    BoardLayer.current(T, p)
  }
  const b = Tile.bottom(currentPositioner)
  if (b && !BoardLayer.present(T).has(Tile.id(b))) {
    const p = Positioner(b)
    Positioner.offsetTileTop(p, currentPositioner)
    Positioner.offsetTileBottom(currentPositioner, p)

    BoardLayer.current(T, p)
  }

  // for (const t of next) {
  //   BoardLayer.current(T, t)
  // }
}