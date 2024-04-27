import {enter, hinj} from "../hinjs/hinj.mjs";
import {Tile} from "./Tile.mjs";
import {BoardLayer} from "./BoardLayer.mjs";

function linkTiles(T) {
  const tiles = Board.tiles(T)
  const byId = Board.tilesById(T)
  for (const t of tiles) {
    const dataset = Tile.dom(t).dataset
    const r = dataset.right
    const l = dataset.left
    const b = dataset.bottom

    if (r) Tile.right(t, byId[r])
    if (b) Tile.bottom(t, byId[b])

    // console.log('RB', r, b)
  }
}

const doAttach = hinj()
    .sync(T => Board.dom(T).IS_BOARD = true)
    .sync(getTiles)
    .sync(linkTiles)
    .sync(T => BoardLayer.centerTile(Board.layer(T), Board.activeTile(T)))
    // .sync(layoutActiveTile)
    // .sync(layoutTiles)

export const Board = enter(null, {
  dom: hinj()
      .sync((T, dom) => !dom.IS_BOARD && doAttach(T, null)),
  tiles: hinj()
      .sync(makeTilesByIdTable),
  tilesById: hinj(),
  activeTile: hinj(/* set by the tile itself */),

  layer: hinj(T => BoardLayer(T))
  // doAttach: hinj(),
})

function makeTilesByIdTable(T) {
  const tiles = Board.tiles(T)
  const tilesById = {}
  tiles.forEach(tile => {
    tilesById[Tile.id(tile)] = tile
  })

  Board.tilesById(T, tilesById)
}

function getTiles(T) {
  Board.tiles(T,
      Array.from(Board.dom(T).querySelectorAll('.tile')).map(td => {
        const tile = Tile(T)
        Tile.dom(tile, td)

        return tile
      })
  )
}
