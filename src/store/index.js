import Vue from 'vue';
import Vuex from 'vuex';
import {getItem, setItem} from '@/functions/storage.js';

Vue.use(Vuex);

const list = {
  namespaced: true,
  state: {
    list: getItem('list') ? getItem('list') : [],
  },

  mutations: {
    add(state) {
      state.list.push({
        checked: false,
        text: '',
        date: Date.now(),
      });
      setItem('list', state.list);
    },

    delete(state, timestamp) {
      let i;
      console.log(state);
      for (i = 0; i < state.list.length; i++) {
        if (state.list[i].date === timestamp) {
          break;
        }
      }
      state.list.splice(i, 1);
      setItem('list', state.list);
    },

    mutate(state, item) {
      let i;
      for (i = 0; i < state.list.length; i++) {
        if (state.list[i].date === item.date) {
          break;
        }
      }
      state.list[i] = item;
      setItem('list', state.list);
    }
  }
};

const drag = {
  namespaced: true,
  state: {
    moveCode: -1,
    isDragging: false
  },

  getters: {
    isDragging(state) {
      return state.moveCode !== -1;
    }
  },

  mutations: {
    updateMoveCode(state, code) {
      state.moveCode = code;
    }
  },

  actions: {
    swap({state, rootState}, swapCode) {
      let i;
      const list = rootState.list.list;
      for (i = 0; i < list.length; i++) {
        if (list[i].date === state.moveCode) {
          break;
        }
      }

      const dragged = list[i];
      let swapped;
      let j;
      if (i - 1 >= 0 && list[i - 1].date === swapCode) {
        swapped = list[i - 1];
        j = i - 1;
      } else if (i + 1 < list.length && list[i + 1].date === swapCode) {
        swapped = list[i + 1];
        j = i + 1;
      }
      Vue.set(list, i, swapped);
      Vue.set(list, j, dragged);
    }
  }
};

const store = new Vuex.Store({
  modules: {
    drag,
    list
  },
});

export default store;
