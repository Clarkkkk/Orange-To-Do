<template>
  <main id="home">
    <header>待办事项</header>
    <div class="operations">
      <button
        type="button"
        id="create-button"
        tabindex="0"
        @click="createItem"
      >
        新建
      </button>
    </div>

    <transition-group name="todo-list" class="todo-list">
      <todo-item
        v-for="item in list"
        :key="item.date"
        :code="item.date"
        :data="item"
      />
    </transition-group>
  </main>
</template>

<script>
import TodoItem from '@/components/TodoItem.vue';
import {mapState, mapMutations} from 'vuex';
export default {
  name: 'Home',
  computed: {
    ...mapState('list', ['list'])
  },

  components: {
    TodoItem
  },

  methods: {
    ...mapMutations('list', ['add']),
    createItem(event) {
      this.add();
      event.target.blur();
    }
  }
};
</script>

<style scoped>
#home {
  min-height: 15rem;
  justify-self: stretch;
  background-color: #fff;
  padding: 2rem 2.5rem;
  box-shadow: 0px 0px 10px #ddd;
  border-radius: 10px;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: grid;
  grid-template-rows: 4rem 3rem minmax(10rem, 1fr);
  grid-template-columns: 1fr;
}

/* focus style except for text area */

:focus:not(.text) {
  outline: 1px solid orange;
  box-shadow: 0 0 4px orange;
}

header {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 2.5rem;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  align-self: center;
  user-select: none;
}

.operations {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  align-self: center;
  display: grid;
  grid-template-columns: repeat(auto-fit, 4.5rem);
  justify-content: end;
}

button {
  text-decoration: none;
  background-color: transparent;
  border: 0;
  outline: none;
  cursor: pointer;
}

#create-button {
  color: orange;
  font-size: 1rem;
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  align-self: center;
  justify-self: end;
  user-select: none;
}

#create-button:active {
  position: relative;
  top: 1px;
  left: 1px;
  outline: none;
  box-shadow: none;
}

#create-button::before {
  content: '+';
  background-color: orange;
  width: 1rem;
  height: 1rem;
  display: inline-block;
  border-radius: 50%;
  color: white;
}

.todo-list {
  grid-column: 1 / 2;
  grid-row: 3 / 4;

  min-height: 20rem;
  display: grid;
  grid-template-rows: 3rem;
  grid-template-columns: 1fr;
  grid-auto-flow: row;
  grid-auto-rows: 3rem;
  gap: 5px;

  --tick-width: 0.3rem;
  --tick-height: 0.6rem;
  --tick-top: -0.33rem;
  --tick-left: 0.32rem;
  --sqrt-two: 1.4142;
}
</style>
