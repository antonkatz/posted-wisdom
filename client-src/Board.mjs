import {group, hinj} from "../hinjs/hinj.mjs";
import {Tile} from "./Tile.mjs";
import {BoardLayer} from "./BoardLayer.mjs";

function linkTiles(T) {
  const tiles = Board.tiles(T)
  const byId = Board.tilesById(T)
  for (const tile of tiles) {
    const dataset = Tile.dom(tile).dataset
    const r = dataset.right
    const l = dataset.left
    const t = dataset.top
    const b = dataset.bottom

    if (r) Tile.right(tile, byId[r])
    if (b) Tile.bottom(tile, byId[b])
    if (t) Tile.top(tile, byId[t])
    if (l) Tile.left(tile, byId[l])

    const subIds = []
    for (const sub of Tile.dom(tile).querySelectorAll('.tile')) {
      if (sub.parentElement === Tile.dom(tile)) {
        const t = tiles.find(t => Tile.dom(t) == Tile.dom(tile))
        subIds.push(Tile.id(t))
      }
    }
    Tile.subtileIds(tile, subIds)

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

export const Board = group(null, {
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
