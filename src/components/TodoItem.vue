<template>
  <div
    id="todo-item"
    class="shadow"
    :draggable="true"
    @dragstart="dragStart"
    @dragenter="dragEnter"
  >
    <div
      ref="elm"
      :class="['box', {'dragging': isDragging}]"
    >
      <span
        :class="[{checked: checked, animate: checked}, 'checkbox']"
        tabindex="0"
        @click="checkSwitch"
      ></span>
      <input
        type="text"
        class="text"
        v-model="text"
        @focus="onFocus"
        @blur="onBlur"
      >
      <span
        :class="['del', { 'del-show': isEditing }]"
        tabindex="0"
        @click="clickDelete"
      ></span>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapActions, mapGetters} from 'vuex';
export default {
  props: ['data'],
  data: function() {
    return {
      text: '',
      checked: false,
      date: '',
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

  computed: {
    ...mapGetters('drag', ['isDragging'])
  },

  created() {
    this.text = this.data.text;
    this.checked = this.data.checked;
    this.date = this.data.date;
  },

  watch: {
    // watch data changes and emit data-update
    checked: function(newVal) {
      this.mutate({
        checked: newVal,
        text: this.text,
        date: this.date
      });
    },

    text: function(newVal) {
      this.mutate({
        checked: this.checked,
        text: newVal,
        date: this.date
      });
    }
  },

  methods: {
    ...mapMutations('list', ['delete', 'mutate']),
    ...mapMutations('drag', ['updateMoveCode']),
    ...mapActions('drag', ['swap']),
    checkSwitch(event) {
      this.checked = !this.checked;
      event.target.blur();
    },

    clickDelete(event) {
      if (this.isEditing) {
        this.delete(this.date);
      }
    },

    onFocus() {
      this.isEditing = true;
    },

    onBlur() {
      this.isEditing = false;
    },

    refreshRect() {
      this.rect = this.$el.getBoundingClientRect();
      return this.rect;
    },

    _dragStart(event) {
      this.updateMoveCode(this.date);
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
      this.swap(this.date);
    },

    _dragEnd(event) {
      // the handler below is binded to body
      // they are going to influence the next drag operation if not removed
      document.body.removeEventListener('dragend', this.dragEnd);
      document.body.removeEventListener('dragover', this.dragOver);
      this.updateMoveCode(-1);
      this.$el.classList.remove('moving');
      // remove the shadow node
      // remove its registration in drag tool as well
      this.shadowNode.remove();
      // restore styles
      this.$refs.elm.style = '';
    }
  }
};
</script>

<style scoped>
.dragging {
  pointer-events: none;
}

.shadow {
  width: 100%;
  height: 100%;
  background-color: #ddd;
  align-self: center;
  border-radius: 5px;
}

.box {
  width: 100%;
  height: 100%;
  padding: 0 0.5rem;
  box-sizing: border-box;
  background-color: white;
  border-radius: 5px;
  transition: box-shadow, 200ms;
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  align-items: center;
}

.box:hover {
  box-shadow: 0px 2px 6px #ddd;
}

.todo-list-move {
  transition: transform 200ms;
}

.clone {
  box-shadow: 0px 3px 8px #ccc;
  cursor: grabbing;
}

.text {
  display: inline-block;
  background-color: transparent;
  flex: 1 1 auto;
  margin: 0 0.5rem;
  padding: 0 0.5rem;
  font-size: 1rem;
  line-height: 1.5em;
  min-width: 10rem;
  outline: none;
  border: none;
}

.text.dragging {
  cursor: grabbing;
}

.text:focus {
  border-top: 1px solid rgba(255, 255, 155, 0);
  border-bottom: 1px solid #ddd;
}

/* check box circle */

.checkbox {
  height: 1rem;
  width: 1rem;
  background-color: transparent;
  border: 2px solid rgba(255, 165, 0, 0.8);
  border-radius: 50%;
  outline: none;
  flex: none;
}

/* check box tick, transparent by default */

.checkbox::before {
  content: '';
  border-width: 0px 2px 2px 0px; 
  border-style: solid;
  border-color: transparent;
  position: relative;
  transform: translateX(var(--tick-left)) translateY(var(--tick-top)) rotate(45deg);
  /*top: var(--tick-top);
  left: var(--tick-left);*/
  width: var(--tick-width);
  height: var(--tick-height);
  display: inline-block;
}

@keyframes ticked {
  0% {
    width: 0;
    height: 0;
    transform:
      translateX(calc(var(--tick-left) - var(--tick-height) / 2 / var(--sqrt-two) + var(--tick-width) / 2 - var(--tick-width) / 2 / var(--sqrt-two)))
      translateY(calc(var(--tick-top) - var(--tick-height) / 2 + var(--tick-height) / 2 / var(--sqrt-two) - var(--tick-width) / 2 / var(--sqrt-two)))
      rotate(45deg);
  }

  33% {
    width: var(--tick-width);
    height: 0;
    transform:
      translateX(calc(var(--tick-left) - var(--tick-height) / 2 / var(--sqrt-two)))
      translateY(calc(var(--tick-top) - var(--tick-height) / 2 + var(--tick-height) / 2 / var(--sqrt-two)))
      rotate(45deg);
  }

  100% {
    width: var(--tick-width);
    height: var(--tick-height);
  }
}

/* check box circle when checked */

.checkbox.checked {
  height: 1rem;
  width: 1rem;
  background-color: rgb(255, 165, 0);
  border: 2px solid rgb(255, 165, 0);
  border-radius: 50%;
}

/* check box tick when hovered */

.checkbox:hover::before {
  border-color: rgb(255, 165, 0);
}

/* check box tick when checked */

.checkbox.checked::before {
  border-color: rgb(255, 255, 255);
}

/* check box tick animation when checked */

.checkbox.checked.animate::before {
  animation: 500ms ticked;
}

/* check box when active(clicked) */

.checkbox:active {
  filter: brightness(90%);
  outline: none;
  box-shadow: none;
}

/* delete button circle */

.del {
  height: 1rem;
  width: 1rem;
  background-color: rgb(240, 25, 25);
  border-radius: 50%;
  outline: none;
  flex: none;
  transition: opacity 300ms;
  opacity: 0;
}

.del-show {
  opacity: 1;
}

/* delete button bar */

.del::before {
  content: '';
  display: inline-block;
  width: 0.4rem;
  border-top: 2px solid white;
  position: relative;
  top: -0.6rem;
  left: 0.3rem;
}

.del:hover {
  background-color: rgb(240, 70, 70);
}

.del:active {
  background-color: rgb(200, 25, 25);
  outline: none;
  box-shadow: none;
}
</style>
