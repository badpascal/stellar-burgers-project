import reducer, {
  loginUserThunk,
  logoutUserThunk,
  getUserThunk,
  getOrdersThunk,
  clearErrors,
  isAuthCheckedSelector,
  userSelector,
  userOrdersSelector,
  initialState
} from './userSlice';

import { TOrder, TUser } from '@utils-types';

// Мокируем API
jest.mock('@api', () => ({
  loginUserApi: jest.fn(),
  logoutApi: jest.fn(),
  getUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  getOrdersApi: jest.fn()
}));

jest.mock('../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

describe('Тестирование userSlice', () => {
  const testUser: TUser = {
    email: 'test@example.com',
    name: 'Test User'
  };

  const testOrders: TOrder[] = [
    {
      _id: '1',
      ingredients: ['60d3b41abdacab0026a733c6'],
      status: 'done',
      name: 'Test Order 1',
      createdAt: '2025-06-01T12:00:00.000Z',
      updatedAt: '2025-06-01T12:30:00.000Z',
      number: 1
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Тестирование loginUserThunk', () => {
    it('Должен корректно обрабатывать pending', () => {
      const action = { type: loginUserThunk.pending.type };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loginUserRequest: true,
        error: null
      });
    });

    it('Должен корректно обрабатывать fulfilled', () => {
      const action = {
        type: loginUserThunk.fulfilled.type,
        payload: testUser
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user: testUser,
        loginUserRequest: false,
        isAuthenticated: true,
        error: null
      });
    });

    it('Должен корректно обрабатывать rejected', () => {
      const errorMessage = 'Ошибка авторизации';
      const action = {
        type: loginUserThunk.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loginUserRequest: false,
        error: errorMessage
      });
    });
  });

  describe('Тестирование logoutUserThunk', () => {
    it('Должен очищать данные пользователя при pending', () => {
      const stateWithUser = {
        ...initialState,
        user: testUser,
        isAuthenticated: true
      };
      const action = { type: logoutUserThunk.pending.type };
      const state = reducer(stateWithUser, action);

      expect(state).toEqual({
        ...initialState,
        user: null,
        isAuthenticated: false,
        loginUserRequest: false
      });
    });
  });

  describe('Тестирование getUserThunk', () => {
    it('Должен корректно обрабатывать fulfilled', () => {
      const action = {
        type: getUserThunk.fulfilled.type,
        payload: { user: testUser }
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user: testUser,
        loginUserRequest: false,
        isAuthenticated: true,
        error: null
      });
    });
  });
  describe('Тестирование getOrdersThunk', () => {
    it('Должен корректно обрабатывать fulfilled', () => {
      const action = {
        type: getOrdersThunk.fulfilled.type,
        payload: testOrders
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        orders: testOrders,
        ordersRequest: false,
        error: null
      });
    });
  });

  describe('Тестирование clearErrors', () => {
    it('Должен очищать ошибку', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error'
      };
      const state = reducer(stateWithError, clearErrors());

      expect(state.error).toBeNull();
    });
  });

  describe('Тестирование селекторов', () => {
    const testState = {
      user: {
        ...initialState,
        user: testUser,
        orders: testOrders,
        isAuthenticated: true,
        loginUserRequest: false
      }
    };

    it('isAuthCheckedSelector должен возвращать статус аутентификации', () => {
      expect(isAuthCheckedSelector(testState as any)).toBe(true);
    });

    it('userSelector должен возвращать данные пользователя', () => {
      expect(userSelector(testState as any)).toEqual(testUser);
    });

    it('userOrdersSelector должен возвращать заказы пользователя', () => {
      expect(userOrdersSelector(testState as any)).toEqual(testOrders);
    });
  });
});
