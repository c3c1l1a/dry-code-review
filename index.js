
import './css/style.css';
import './index.html';

import Model from './modules/Model.js';
import View from './modules/View.js';
import Controller from './modules/Controller.js';

window.onload = () => {
  const controller = new Controller(new Model(), new View());
  controller.populateItems();
  controller.addNewItem();
  controller.clearAllCompleted();
};


export default class {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  populateItems() {
    const items = this.model.getItems();

    this.view.refreshDOM();
    const updateDesriptionHander = this.handleDescriptionUpdate.bind(this);
    const deleteItemHandler = this.handleDeleteItem.bind(this);
    const markAsComplete = this.handleMarkAsComplete.bind(this);

    const eventHandlers = [updateDesriptionHander, deleteItemHandler, markAsComplete];
    items.slice(0).reverse().map((item) => this.view.generateTemplate(item, eventHandlers));
  }

  handleMarkAsComplete(index, bool) {
    this.model.completedItem(index, bool, this.populateItems.bind(this));
  }

  handleNewItem(inputValue) {
    this.model.addItem(inputValue, this.populateItems.bind(this));
  }

  handleDescriptionUpdate(value, index) {
    this.model.updateItem(value, index);
  }

  handleDeleteItem(index) {
    this.model.deleteItem(index, this.populateItems.bind(this));
  }

  handleClearAllCompleted() {
    this.model.clearAllCompleted(this.populateItems.bind(this));
  }

  addNewItem() {
    this.view.submitNewItem(this.handleNewItem.bind(this));
  }

  clearAllCompleted() {
    this.view.clearAllCompleted(this.handleClearAllCompleted.bind(this));
  }
}

export default class {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('todoItems'));
    this.updateLocalStorage(this.items);
  }

  updateLocalStorage(items) {
    if (items === null) {
      this.items = [];
      localStorage.setItem('todoItems', JSON.stringify(this.items));
    } else {
      this.items = items;
      localStorage.setItem('todoItems', JSON.stringify(this.items));
    }
  }

  getItems() {
    this.updateLocalStorage(this.items);
    return this.items;
  }

  completedItem(index, bool, populateItems) {
    this.items[index].completed = bool;
    this.updateLocalStorage(this.items);
    populateItems();
  }

  addItem(inputValue, populateItems) {
    const item = {
      description: inputValue,
      completed: false,
      index: this.items.length,
    };

    this.items.push(item);
    this.updateLocalStorage(this.items);
    populateItems();
  }

  updateItem(value, index) {
    this.items[index].description = value;
    this.updateLocalStorage(this.items);
  }

  deleteItem(index, populateItems) {
    this.items.splice(index, 1);
    this.items.map((item, i) => {
      item.index = i;
      return item.index;
    });

    this.updateLocalStorage(this.items);
    populateItems();
  }

  clearAllCompleted(populateItems) {
    const inComplete = this.items.filter((item) => !item.completed);

    inComplete.map((item, i) => {
      item.index = i;
      return item.index;
    });

    this.items = inComplete;
    this.updateLocalStorage(this.items);
    populateItems();
  }
}

export default class {
  constructor() {
    this.itemTemplate = document.querySelector('.todo-item-template');
    this.todoItems = document.querySelector('.todo-items');
    this.input = document.querySelector('.new-item');
    this.clearAllButton = document.querySelector('.todo-clear-completed');
  }

  refreshDOM() {
    if (this.todoItems.hasChildNodes()) {
      this.todoItems.textContent = '';
    }
  }

  clearAllCompleted(handleClearAll) {
    this.clearAllButton.addEventListener('click', () => {
      handleClearAll();
    });
  }

  generateTemplate(itemData, eventHandlers) {
    const [updateDesciption, deleteItem, markAsComplete] = eventHandlers;
    const itemTag = this.itemTemplate.content.firstElementChild.cloneNode(true);

    const checkbox = itemTag.querySelector('.checkbox');
    checkbox.setAttribute('name', itemData.index);
    checkbox.checked = itemData.completed;

    checkbox.addEventListener('click', (e) => {
      markAsComplete(itemData.index, e.target.checked);
    });

    const itemDescription = itemTag.querySelector('.item-description');
    itemDescription.setAttribute('id', itemData.index);

    itemDescription.value = itemData.description;
    if (itemData.completed) {
      itemDescription.classList.add('strikethrough');
    } else {
      itemDescription.classList.remove('strikethrough');
    }

    itemDescription.addEventListener('input', (e) => {
      e.preventDefault();
      updateDesciption(e.target.value, itemData.index);
      itemTag.classList.remove('item-edit');
    });

    const bin = itemTag.querySelector('.bin');
    const more = itemTag.querySelector('.more');
    bin.addEventListener('click', () => {
      deleteItem(itemData.index);
    });

    itemTag.addEventListener('mouseover', () => {
      bin.style.display = 'block';
      more.style.display = 'none';
      itemTag.classList.add('item-edit');
    });

    itemTag.addEventListener('mouseout', () => {
      bin.style.display = 'none';
      more.style.display = 'block';
      itemTag.classList.remove('item-edit');
    });

    this.todoItems.appendChild(itemTag);
  }

  submitNewItem(handleNewItem) {
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.target.value.length > 0) handleNewItem(e.target.value);
        e.target.value = '';
      }
    });
  }
}



