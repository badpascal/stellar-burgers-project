import { rootReducer } from './store';
import type { RootState } from './store';

// Мокируем все API и утилиты, которые используются в слайсах
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn(),
  getFeedsApi: jest.fn(),
  orderBurgerApi: jest.fn(),
  loginUserApi: jest.fn(),
  logoutApi: jest.fn(),
  getUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  getOrdersApi: jest.fn()
}));

jest.mock('../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  getCookie: jest.fn()
}));

describe('Тестирование rootReducer', () => {
  const expectedInitialState: RootState = {
    burgerConstructor: {
      burgerConstructor: {
        bun: null,
        ingredients: []
      },
      error: null
    },
    feed: {
      orders: [],
      isFeedsLoading: false,
      order: null,
      isOrderLoading: false,
      total: 0,
      totalToday: 0,
      error: null
    },
    ingredients: {
      ingredients: [],
      isIngredientsLoading: false,
      error: null
    },
    order: {
      order: null,
      isOrderLoading: false,
      error: null
    },
    user: {
      isAuthenticated: false,
      loginUserRequest: false,
      user: null,
      orders: [],
      ordersRequest: false,
      error: null
    }
  };

  it('Должен возвращать корректное начальное состояние', () => {
    const initialState = rootReducer(undefined, { type: 'INIT' });
    expect(initialState).toEqual(expectedInitialState);
  });

  it('Должен возвращать неизмененное состояние при неизвестном экшене', () => {
    const testState: RootState = {
      ...expectedInitialState,
      user: {
        ...expectedInitialState.user,
        isAuthenticated: true,
        user: { name: 'Test', email: 'test@test.com' }
      }
    };
    
    const resultState = rootReducer(testState, { type: 'UNKNOWN_ACTION' });
    expect(resultState).toEqual(testState);
    expect(resultState).toBe(testState); // Проверка ссылочной целостности
  });
});
