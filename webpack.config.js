const path = require('path');

module.exports = {
  entry: './src/memory_game_script.js', 
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist'), 
  },
  mode: 'development', 
};
