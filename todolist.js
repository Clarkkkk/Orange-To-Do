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

const TodoItemCheckbox = {
  data: function() {
    return {
      // checked: false
    };
  },
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
  props: ['value'],

  template: `
  <input 
    type="text"
    class="text"
    ref="input"
    :value="value"
  >`,

  methods: {
    focus() {
      this.$refs.input.focus();
    }
  },

  mounted: function() {
    this.focus();
  },
};

const TodoItemDelete = {
  props: ['hovering'],
  template: `
    <span 
      :class="['del', { 'del-show': hovering }]"
      tabindex="0"
      @mousedown.prevent
    ></span>
  `,
};

const TodoItem = {
  props: ['code', 'moveCode', 'swapCode'],
  data: function() {
    return {
      text: '',
      checked: false,
      hovering: false,

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


  mounted: function() {
    this.$emit('item-mounted', this);
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
      class="box"
      >
        <todo-item-checkbox v-model="checked"/>
        <todo-item-text 
          ref="todoInput"
          v-model="text"
          @focus.native="hovering=true"
          @blur.native="hovering=false"
        />
        <todo-item-delete 
          @click.native="$emit('delete-item', code)"
          :hovering="hovering"
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
    hovering: function(newVal) {
      // console.log(newVal);
    }
  },

  methods: {
    refreshRect() {
      this.rect = this.$el.getBoundingClientRect();
      return this.rect;
    },

    _dragStart(event) {
      console.log('start');
      this.$emit('update:moveCode', this.code);
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
      console.log('over');
      this.shadowNode.style.left = (event.clientX - this.relativeLeft) + 'px';
      this.shadowNode.style.top = (event.clientY - this.relativeTop) + 'px';
    },

    _dragEnter(event) {
      console.log('enter');
      console.log(event);
      event.preventDefault();
      console.log(this.swapCode);
      this.$emit('update:swapCode', this.code);
      console.log(this.swapCode);
    },

    _dragEnd(event) {
      console.log('end');
      // the handler below is binded to body
      // they are going to influence the next drag operation if not removed
      document.body.removeEventListener('dragend', this.dragEnd);
      document.body.removeEventListener('dragover', this.dragOver);
      // remove the shadow node
      // remove its registration in drag tool as well
      this.shadowNode.remove();
      // restore styles
      this.$refs.elm.style = '';
    }
  }
};

const vm = new Vue({
  el: '#root',
  data: {
    count: 0,
    codes: [],
    instances: [],
    moveCode: -1,
    swapCode: -1,
  },
  components: {
    'todo-item': TodoItem
  },
  template: `
  <main id="container">
  <header>待办事项</header>
  <button 
    type="button" 
    id="newItem" 
    tabindex="0" 
    @click="createItem"
  >
    新建待办事项
  </button>
  <transition-group name="todo-list" class="todo-list">
  <todo-item 
    v-for="code in codes"
    ref="items"
    :key="code"
    :code="code"
    :moveCode.sync="moveCode"
    :swapCode.sync="swapCode"
    @item-mounted="itemMounted"
    @delete-item="deleteItem($event)"
  />
  </transition-group>
  <div id="list-container">

  </div>

  </main>
  `,
  watch: {
    swapCode: function(newVal) {
      console.log('swapCode');
      if (newVal > 0) {
        const first = this.codes.indexOf(this.moveCode);
        const second = this.codes.indexOf(this.swapCode);
        // swap the code
        const temp = this.codes[first];
        this.codes[first] = this.codes[second];
        this.codes[second] = temp;
        // swap the instance
      }
    }
  },

  methods: {
    createItem() {
      this.count++;
      this.codes.push(this.count);
      event.target.blur();
    },

    deleteItem(event) {
      const i = this.codes.indexOf(event);
      this.codes.splice(i, 1);
      this.instances.splice(i, 1);
    },

    itemMounted(instance) {
      this.instances.push(instance);
    }
  },
});
