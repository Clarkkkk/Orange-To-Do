/* eslint-disable require-jsdoc */

import Vue from './vue.esm.browser.js';

/*
const div = document.createElement('div');
div.style.position = 'absolute';
document.documentElement.appendChild(div);
document.documentElement.addEventListener('mousemove', (e) => {
  div.style.top = event.clientY + 'px';
  div.style.left = event.clientX + 5 + 'px';
  div.innerText = `(${event.clientX}, ${event.clientY})`;
});
*/

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/worker.js')
      .then((reg) => {
        console.log('Service worker registered.', reg);
      });
  });
}

const TodoItemCheckbox = {
  props: ['checked'],
  model: {
    prop: 'checked',
    event: 'switch'
  },
  template: `
    <span 
      :class="[{checked: checked, animate: checked}, 'checkbox']" 
      tabindex="0"
      @mousedown.prevent
      @click="checkSwitch"
    ></span>
  `,
  methods: {
    checkSwitch(event) {
      this.$emit('switch', !this.checked);
      event.target.blur();
    }
  }
};

const TodoItemText = {
  props: ['value', 'isEditing'],
  template: `
  <input 
    type="text"
    class="text"
    :value="value"
    @change="$emit('input', $event.target.value)"
    @focus="$emit('update:isEditing', true)"
    @blur="$emit('update:isEditing', false)"
  >`,
  mounted: function() {
    this.$el.focus();
  },
};

const TodoItemDelete = {
  props: ['isEditing'],
  template: `
    <span 
      :class="['del', { 'del-show': isEditing }]"
      tabindex="0"
      @mousedown.prevent
    ></span>
  `,
};

const TodoItem = {
  props: ['code', 'moveCode', 'swapCode', 'isDragging', 'todoData'],
  data: function() {
    return {
      text: '',
      checked: false,
      isEditing: false,

      relativeLeft: 0,
      relativeTop: 0,
      shadowNode: {},
      rect: {},

      dragStart: this._dragStart.bind(this),
      dragEnd: this._dragEnd.bind(this),
      dragOver: this._dragOver.bind(this),
      dragEnter: this._dragEnter.bind(this),
    };
  },

  created: function() {
    const data = this.todoData[this.code];
    if (data) {
      this.text = data.text;
      this.checked = data.checked;
    }
  },

  template: `
    <div 
      class="shadow"
      :draggable="true"
      @dragstart="dragStart"
      @dragenter="dragEnter"
    >
      <div 
      ref="elm"
      :class="['box', {'dragging': isDragging}]"
      >
        <todo-item-checkbox v-model="checked"/>
        <todo-item-text 
          ref="todoInput"
          v-model="text"
          :isEditing.sync="isEditing"
        />
        <todo-item-delete 
          @click.native="$emit('delete-item', code)"
          :isEditing="isEditing"
        />
      </div>
    </div>
  `,

  components: {
    'todo-item-checkbox': TodoItemCheckbox,
    'todo-item-text': TodoItemText,
    'todo-item-delete': TodoItemDelete
  },

  watch: {
    // watch data changes and emit data-update
    checked: function(newVal) {
      this.$emit('data-update', {
        code: this.code,
        type: 'checked',
        data: newVal,
        timestamp: Date.now()
      });
    },

    text: function(newVal) {
      this.$emit('data-update', {
        code: this.code,
        type: 'text',
        data: newVal,
        timestamp: Date.now()
      });
    }
  },

  methods: {
    refreshRect() {
      this.rect = this.$el.getBoundingClientRect();
      return this.rect;
    },

    _dragStart(event) {
      this.$emit('update:moveCode', this.code);
      this.$emit('update:isDragging', true);
      this.$el.classList.add('moving');
      // hide the default drag image
      const img = document.createElement('img');
      event.dataTransfer.setDragImage(img, 0, 0);

      const rect = this.refreshRect();

      // calculate the relative distance of the rect and the mouse
      // is used to locate the shadow node
      this.relativeLeft = event.clientX - rect.left;
      this.relativeTop = event.clientY - rect.top;

      // clone a shadow node of the dragged node
      // set pointer-events to none
      // so that the cloned node won't fire pointer events
      // 如果不克隆，直接用原来的节点，原来的节点会挡住鼠标
      // 导致dragenter dragover等事件无法正确触发
      // 为了修复这个问题，会引入更多问题，因此使用克隆节点来避免这些问题
      this.shadowNode = this.$el.cloneNode(true);
      this.shadowNode.style = `
      pointer-events: none;
      width: ${rect.right - rect.left}px;
      height: ${rect.bottom - rect.top}px;
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      z-index: 1000;
      contain: layout;
      `;
      this.shadowNode.classList.add('clone');
      // append the shadow node to the parent of the dragged node
      // to avoid potential style change
      this.$el.parentNode.appendChild(this.shadowNode);
      // hide the original dragged node
      this.$refs.elm.style.opacity = '0';
      // use body to capture dragover
      // so that the position of the mouse is always accessible
      document.body.addEventListener('dragover', this.dragOver);
      // dragend is fired on dropped target
      // but the function is used to do some initialization of the dragged element
      // so just add the handler to body and access the dragged by 'this'
      document.body.addEventListener('dragend', this.dragEnd);
    },

    _dragOver(event) {
      // preventDefault() must be called
      event.preventDefault();
      this.shadowNode.style.left = (event.clientX - this.relativeLeft) + 'px';
      this.shadowNode.style.top = (event.clientY - this.relativeTop) + 'px';
    },

    _dragEnter(event) {
      // dragenter will fire on the dragged element itself somehow
      // need to prevent it
      if (event.currentTarget.classList.contains('moving')) {
        return;
      }
      event.preventDefault();
      this.$emit('update:swapCode', this.code);
      this.$emit('swap');
    },

    _dragEnd(event) {
      // the handler below is binded to body
      // they are going to influence the next drag operation if not removed
      document.body.removeEventListener('dragend', this.dragEnd);
      document.body.removeEventListener('dragover', this.dragOver);
      this.$emit('update:isDragging', false);
      this.$el.classList.remove('moving');
      // remove the shadow node
      // remove its registration in drag tool as well
      this.shadowNode.remove();
      // restore styles
      this.$refs.elm.style = '';
    }
  }
};

new Vue({
  el: '#root',
  data: {
    count: 0,
    codes: [],
    todoData: {},
    moveCode: -1,
    swapCode: -1,
    isDragging: false
  },
  components: {
    'todo-item': TodoItem
  },
  template: `
  <main id="container">
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
        v-for="code in codes"
        :key="code"
        :code="code"
        :todoData="todoData"
        :moveCode.sync="moveCode"
        :swapCode.sync="swapCode"
        :isDragging.sync="isDragging"
        @delete-item="deleteItem($event)"
        @data-update="dataUpdate"
        @swap="swap"
      />
    </transition-group>
  </main>
  `,

  created: function() {
    const codes = localStorage.getItem('codes');
    const todoData = localStorage.getItem('todoData');
    if (codes) {
      this.codes = JSON.parse(codes);
    }
    if (todoData) {
      this.todoData = JSON.parse(todoData);
    }
  },

  watch: {
    // save changes in local storage
    codes: function(newVal) {
      localStorage.setItem('codes', JSON.stringify(newVal));
    },

    todoData: {
      handler: function(newVal) {
        localStorage.setItem('todoData', JSON.stringify(newVal));
      },
      deep: true,
    }
  },

  methods: {
    createItem(event) {
      this.count++;
      this.codes.push(this.count);
      const data = {
        checked: false,
        text: '',
        date: Date.now(),
      };
      this.$set(this.todoData, this.count, data);
      event.target.blur();
    },

    deleteItem(code) {
      const i = this.codes.indexOf(code);
      this.codes.splice(i, 1);
      this.$delete(this.todoData, code);
    },

    swap() {
      const first = this.codes.indexOf(this.moveCode);
      const second = this.codes.indexOf(this.swapCode);
      // swap the code
      // use $set() in order to watch the change of 'codes'
      const temp = this.codes[first];
      Vue.set(this.codes, first, this.codes[second]);
      Vue.set(this.codes, second, temp);
    },

    dataUpdate(dataObj) {
      // handle all the data update from child components here
      const {code, type, data, timestamp} = dataObj;
      this.todoData[code][type] = data;
      this.todoData[code][timestamp] = timestamp;
    }
  },
});
