import {Tile} from "./Tile.mjs";
import {enter} from "../hinjs/enter.mjs";
import {hinj} from "../hinjs/hinj.mjs";

let defaultBorder = '1px solid crimson';
export const Positioner = enter(null, {
  // tile: hinj(),
  offsetTileLeft: hinj()
      .sync((T, ot) => {
        const x = Positioner.x(ot) + Tile.widthEm(ot)
        console.log('x', Tile.id(T), x)
        Positioner.x(T, x)
        Positioner.y(T, Positioner.y(ot))
      })
      .sync((T, ot) => Positioner.borderingTilesLeft(T, [...Positioner.borderingTilesLeft(T), ot])),
  offsetTileRight: hinj()
      .sync((T, ot) => {
        const x = Positioner.x(ot) - Tile.widthEm(T)
        console.log('x', Tile.id(T), x)
        Positioner.x(T, x)
        Positioner.y(T, Positioner.y(ot))
      })
      .sync((T, ot) => Positioner.borderingTilesRight(T, [...Positioner.borderingTilesRight(T), ot])),

  offsetTileBottom: hinj()
      .sync((T, ot) => {
        const y = Positioner.y(ot) - Tile.heightEm(T)
        console.log('y', Tile.id(T), y)
        Positioner.y(T, y)
        Positioner.x(T, Positioner.x(ot))
      })
      .sync((T, ot) => Positioner.borderingTilesBottom(T, [...Positioner.borderingTilesBottom(T), ot])),

  offsetTileTop: hinj()
      .sync((T, ot) => {
        const y = Positioner.y(ot) + Tile.heightEm(ot)
        console.log('y', Tile.id(T), y)
        Positioner.y(T, y)
        Positioner.x(T, Positioner.x(ot))
      })
      .sync((T, ot) => Positioner.borderingTilesTop(T, [...Positioner.borderingTilesTop(T), ot])),


  borderingTilesTop: hinj(() => [])
      .sync((T, ot) => {
        ot.length && Positioner.borderTop(T, '0px')
      }),
  borderingTilesBottom: hinj(() => []).sync((T, ot) => {
    ot.length && Positioner.borderBottom(T, '0px')
  }),
  borderingTilesLeft: hinj(() => []).sync((T, ot) => {
    ot.length && Positioner.borderLeft(T, '0px')
  }),
  borderingTilesRight: hinj(() => []).sync((T, ot) => {
    ot.length && Positioner.borderRight(T, '0px')
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
export const drawBorders = hinj()
    .sync(T => {
      const dom = Tile.dom(T)
      dom.style.borderLeft = Positioner.borderLeft(T)
      dom.style.borderBottom = Positioner.borderBottom(T)
      dom.style.borderRight = Positioner.borderRight(T)
      dom.style.borderTop = Positioner.borderTop(T)
      if (Tile.id(T) == 2) debugger

    })
    // .sync(T => {
    //   const dom = Tile.dom(T)
    //   dom.style.paddingLeft = Positioner.borderLeft(T) !== '0px' ? '4px' : 0
    //   dom.style.paddingBottom = Positioner.borderBottom(T) !== '0px' ? '4px' : 0
    //   dom.style.paddingRight = Positioner.borderRight(T) !== '0px' ? '4px' : 0
    //   dom.style.paddingTop = Positioner.borderTop(T) !== '0px' ? '4px' : 0
    // })
