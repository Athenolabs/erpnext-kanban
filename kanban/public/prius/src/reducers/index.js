import * as ActionTypes from '../actions';
import { combineReducers } from 'redux';


const filters = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_FILTER:
      state.forEach((filter) => {
        if (filter.id === action.id) {
          filter.values = action.values;
        }
      });
      return [...state];
    default:
      return state;
  }
};

const card = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_CARD:
      return {
        id: action.id,
        title: action.title,
        description: action.description,
        parentList: action.parentList,
      };
    default:
      return state;
  }
};

const cards = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_CARD: {
      const newCard = action.card.card;
      const existingCard = state.find((existing) => existing.key == newCard.key);
      let newState = [...state];
      if (existingCard == null) {
        newState = [...state, newCard];
      } else {
        const idx = state.indexOf(existingCard);
        newState = [...state.slice(0, idx), newCard, ...state.slice(idx + 1)];
      }
      return newState;
    }
    case ActionTypes.ADD_CARD:
      return [
        ...state,
        card(undefined, action),
      ];
    case ActionTypes.DELETE_CARD: {
      const delCard = action.card.card;
      const existingCard = state.find((existing) => existing.key == delCard.key);
      let newState = [...state];
      if (existingCard != null) {
        const idx = state.indexOf(existingCard);
        newState = [...state.slice(0, idx), ...state.slice(idx + 1)];
      }
      return newState;
    }
    default:
      return state;
  }
};

const list = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_LIST:
      return {
        id: action.id,
        title: action.title,
      };
    default:
      return state;
  }
};

const lists = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.ADD_LIST:
      return [
        ...state,
        list(undefined, action),
      ];
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  lists,
  cards,
  filters,
});

export default rootReducer;
