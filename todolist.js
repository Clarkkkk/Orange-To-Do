/* eslint-disable require-jsdoc */

const newOperation = document.getElementById('newItem');
const container = document.getElementById('container');

function deleteItem(node) {
  const confirm = window.confirm('删除这个项目吗？');
  if (confirm) {
    const parent = node.parentNode;
    while (parent.firstChild) {
      parent.firstChild.remove();
    }
    parent.remove();
  }
}

function dragstartEvent(event) {
  const offset = event.target.offsetTop;
  event.target.id = 'dragged';
  event.dataTransfer.setData('dragged-item', offset);
  event.dataTransfer.effectAllowed = 'all';
}

function dragenter(event) {
  if (event.dataTransfer.types[0] == 'dragged-item' &&
   event.currentTarget.id != 'dragged') {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const draggedTop = document.getElementById('dragged').offsetTop;
    const currentTop = event.currentTarget.offsetTop;
    if (draggedTop > currentTop) {
      event.currentTarget.classList.add('dragenter-top');
    } else {
      event.currentTarget.classList.add('dragenter-bottom');
    }

  } else return;
}

function dragleave(event) {
  const isChild = (event.relatedTarget.parentNode == event.currentTarget);
  if (event.dataTransfer.types[0] == 'dragged-item' &&
   event.currentTarget.id != 'dragged' && !isChild) {
    event.currentTarget.classList.remove('dragenter-top');
    event.currentTarget.classList.remove('dragenter-bottom');
  }
}

function dropEvent(event) {
  if (event.dataTransfer.types[0] == 'dragged-item') {
    event.preventDefault();
  } else return;
  const dragged = document.getElementById('dragged');
  const dragOffset = event.dataTransfer.getData('dragged-item');
  const dropOffset = event.currentTarget.offsetTop;
  const parent = event.currentTarget.parentNode;
  if (dragOffset < dropOffset) {
    parent.insertBefore(dragged, event.currentTarget.nextElementSibling);
  } else if (dragOffset > dropOffset) {
    parent.insertBefore(dragged, event.currentTarget);
  }
  event.currentTarget.classList.remove('dragenter-top');
  event.currentTarget.classList.remove('dragenter-bottom');
}


function createItem() {
  // create a p container
  const itemOwner = document.createElement('P');
  itemOwner.draggable = 'true';
  itemOwner.tabIndex = 0;
  // add drag event listener
  itemOwner.addEventListener('dragstart', dragstartEvent);
  itemOwner.addEventListener('dragend', (event) => {
    event.target.removeAttribute('id');
  });
  itemOwner.addEventListener('dragenter', dragenter);
  itemOwner.addEventListener('dragover', (event) => {
    if (event.dataTransfer.types[0] == 'dragged-item') {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    } else return;
  });
  itemOwner.addEventListener('dragleave', dragleave);
  itemOwner.addEventListener('drop', dropEvent);
  // add mouse event to show or hide the delete button
  itemOwner.addEventListener('mouseenter', () => {
    itemOwner.lastElementChild.style.opacity = '1';
  });
  itemOwner.addEventListener('mouseleave', () => {
    itemOwner.lastElementChild.style.opacity = '0';
  });
  // create a checkbox
  const checkbox = document.createElement('span');
  checkbox.classList.add('checkbox');
  checkbox.tabIndex = 0;
  checkbox.addEventListener('click', (event) => {
    if (event.target.classList.contains('checked')) {
      event.target.classList.remove('checked');
    } else {
      event.target.classList.add('checked');
      event.target.classList.add('animate');
      setTimeout(() => event.target.classList.remove('animate'), 500);
    }

    event.target.blur();
  });
  addEventListener('keydown', () => {
    if (event.key == 'Enter') {
      event.target.click();
    }
  });
  // create a content-editable span
  const text = document.createElement('span');
  text.contentEditable = 'true';
  text.classList.add('text');
  // create a delete button
  const delButton = document.createElement('span');
  delButton.classList.add('del');
  delButton.tabIndex = 0;
  delButton.addEventListener('focus', () => event.target.style.opacity = '1');
  delButton.addEventListener('click', (event) => {
    event.target.blur();
    setTimeout(() => deleteItem(event.target), 10);
  });
  delButton.addEventListener('keydown', () => {
    if (event.key == 'Enter') {
      event.target.click();
    }
  });
  delButton.style.opacity = '0';
  // struture them together
  container.appendChild(itemOwner);
  itemOwner.appendChild(checkbox);
  itemOwner.appendChild(text);
  itemOwner.appendChild(delButton);
  // focus
  text.focus();
}

newOperation.addEventListener('click', createItem);