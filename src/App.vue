<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
body {
  font-size: 18px;
  padding: 2rem;
  background-color: #f8f8f8;
  min-height: 600px;
  display: grid;
  grid-template-rows: minmax(min-content, max-content) minmax(5em, 1fr);
  grid-template-columns: minmax(max-content, 600px);
  justify-content: space-around;
}

#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

footer {
  margin-top: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.7rem;
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}
</style>
