# mei-goban

Goban for [meishengo](https://github.com/dawicorti/meishengo) in HTML5 Canvas

## Usage

### Create and append goban

```js
var goban = new Goban();
parentNode.appendChild(goban.el);
```

### API

- **goban.set**(key, value)
  - **'width' / 'height'** : resize goban canvas
  - **'size'** : goban type (9/13/19)
  - **'boardColor'** : lines and hoshis color
  - **'blackStoneColor'** : color of a black stone
  - **'whiteStoneColor'** : color of a black stone

- **goban.putStone**(row, col, color)
 - **row** : stone row
 - **col** : stone col
 - **color** : 'black' or 'white'

- **goban.removeStone**(row, col)
 - **row** : stone row
 - **col** : stone col

- **goban.on**(event, callback)
 - **event** : 'mousedown' / 'mouseup' / 'mousemove'
 - **callback** : got params _row_ & _col_
